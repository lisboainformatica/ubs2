import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { AuditService } from '../../shared/audit.service';

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async createMedication(data: { name: string; dosageForm: string; minStock?: number; targetStock?: number }) {
    const existing = await this.prisma.medication.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new BadRequestException('Medicamento já cadastrado com este nome.');
    }

    return this.prisma.medication.create({
      data: {
        name: data.name,
        dosageForm: data.dosageForm,
        minStock: data.minStock ?? 10,
        targetStock: data.targetStock ?? 100,
        status: 'ACTIVE',
      },
    });
  }

  async findAllMedications() {
    return this.prisma.medication.findMany({
      where: { status: 'ACTIVE' },
      include: {
        lots: true,
      },
    });
  }

  async addLot(
    data: {
      medicationId: string;
      lotNumber: string;
      quantityPhysical: number;
      expirationDate: string;
      manufacturingDate?: string;
      supplier?: string;
      ubsId: string;
    },
    userId: string
  ) {
    const expDate = new Date(data.expirationDate);
    if (isNaN(expDate.getTime())) {
      throw new BadRequestException('Data de validade inválida.');
    }

    const mfgDate = data.manufacturingDate ? new Date(data.manufacturingDate) : null;

    // Check if medication exists
    const medication = await this.prisma.medication.findUnique({
      where: { id: data.medicationId },
    });
    if (!medication) throw new NotFoundException('Medicamento não encontrado.');

    return await this.prisma.$transaction(async (tx) => {
      // 1. Check if lot exists for this medication
      let lot = await tx.medicationLot.findFirst({
        where: { ubsId: data.ubsId, medicationId: data.medicationId, lotNumber: data.lotNumber },
      });

      if (lot) {
        // Increment quantity if lot exists
        lot = await tx.medicationLot.update({
          where: { id: lot.id },
          data: {
            quantityPhysical: { increment: data.quantityPhysical },
            quantityAvailable: { increment: data.quantityPhysical },
          },
        });
      } else {
        // Create new lot
        lot = await tx.medicationLot.create({
          data: {
            ubsId: data.ubsId,
            medicationId: data.medicationId,
            lotNumber: data.lotNumber,
            quantityPhysical: data.quantityPhysical,
            quantityAvailable: data.quantityPhysical,
            quantityReserved: 0,
            expirationDate: expDate,
            manufacturingDate: mfgDate,
            supplier: data.supplier,
          },
        });
      }

      // 2. Create inventory movement
      await tx.inventoryMovement.create({
        data: {
          medicationId: data.medicationId,
          lotId: lot.id,
          ubsId: data.ubsId,
          quantity: data.quantityPhysical,
          type: 'INPUT',
          userId,
          remarks: `Lote adicionado/atualizado. Fornecedor: ${data.supplier || 'N/A'}`,
        },
      });

      // 3. Update aggregated inventory for this UBS
      const totalAvailable = await tx.medicationLot.aggregate({
        _sum: { quantityAvailable: true },
        where: {
          ubsId: data.ubsId,
          medicationId: data.medicationId,
          expirationDate: { gt: new Date() },
        },
      });

      const currentStock = totalAvailable._sum.quantityAvailable || 0;

      const inventory = await tx.inventory.upsert({
        where: {
          ubsId_medicationId: { ubsId: data.ubsId, medicationId: data.medicationId },
        },
        create: {
          ubsId: data.ubsId,
          medicationId: data.medicationId,
          quantity: currentStock,
        },
        update: {
          quantity: currentStock,
        },
      });

      await this.audit.log(userId, 'INVENTORY_ADJUSTED', 'MedicationLot', lot.id, { medicationId: data.medicationId, ubsId: data.ubsId, quantity: data.quantityPhysical }, undefined, tx);

      return lot;
    });
  }

  async dispenseMedication(prescriptionItemId: string, userId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Fetch the prescription item
      const item = await tx.prescriptionItem.findUnique({
        where: { id: prescriptionItemId },
        include: {
          prescription: {
            include: { medicalRecord: { include: { appointment: true } } },
          },
          reservations: {
            where: { status: 'RESERVED' },
            include: { lot: true },
          },
        },
      });

      if (!item) {
        throw new NotFoundException('Item de receita médica não encontrado.');
      }

      if (item.reservations.length === 0) {
        throw new BadRequestException('Não há reservas ativas para dispensar este medicamento.');
      }

      const now = new Date();
      let totalDispensed = 0;

      // 2. Perform dispensation for each reservation
      for (const res of item.reservations) {
        // Rule 6: Medicamento vencido nunca pode ser dispensado
        if (res.lot.expirationDate <= now) {
          throw new BadRequestException(
            `Não é possível dispensar: O lote ${res.lot.lotNumber} está vencido (Validade: ${res.lot.expirationDate.toLocaleDateString()}).`
          );
        }

        // Check stock invariants
        const lot = await tx.medicationLot.findUnique({
          where: { id: res.lotId },
        });
        if (!lot) {
          throw new NotFoundException(`Lote ${res.lotId} não encontrado.`);
        }
        if (lot.quantityPhysical < res.quantity) {
          throw new BadRequestException(`Estoque físico insuficiente no lote ${lot.lotNumber} para dispensação.`);
        }
        if (lot.quantityReserved < res.quantity) {
          throw new BadRequestException(`Estoque reservado insuficiente no lote ${lot.lotNumber} para dispensação.`);
        }

        // Physical and Reservation release
        await tx.medicationLot.update({
          where: { id: res.lotId },
          data: {
            quantityPhysical: { decrement: res.quantity },
            quantityReserved: { decrement: res.quantity },
          },
        });

        // Update reservation status to DISPENSED
        await tx.medicationReservation.update({
          where: { id: res.id },
          data: { status: 'DISPENSED' },
        });

        // Log inventory movement
        await tx.inventoryMovement.create({
          data: {
            medicationId: item.medicationId,
            lotId: res.lotId,
            ubsId: item.prescription.medicalRecord.appointment.ubsId,
            quantity: -res.quantity,
            type: 'DISPENSED',
            userId,
            remarks: `Dispensação da receita ${item.prescriptionId}`,
          },
        });

        totalDispensed += res.quantity;
      }

      // 3. Update prescription item dispensed qty
      await tx.prescriptionItem.update({
        where: { id: prescriptionItemId },
        data: {
          qtyDispensed: { increment: totalDispensed },
        },
      });

      // 4. Recalculate aggregated inventory for this UBS
      const ubsId = item.prescription.medicalRecord.appointment.ubsId;
      const totalAvailable = await tx.medicationLot.aggregate({
        _sum: { quantityAvailable: true },
        where: {
          ubsId,
          medicationId: item.medicationId,
          expirationDate: { gt: now },
        },
      });

      const currentStock = totalAvailable._sum.quantityAvailable || 0;
      await tx.inventory.upsert({
        where: {
          ubsId_medicationId: { ubsId, medicationId: item.medicationId },
        },
        create: { ubsId, medicationId: item.medicationId, quantity: currentStock },
        update: { quantity: currentStock },
      });

      await this.audit.log(userId, 'MEDICATION_DISPENSED', 'PrescriptionItem', prescriptionItemId, { qty: totalDispensed, ubsId }, undefined, tx);

      return { success: true, quantityDispensed: totalDispensed };
    });
  }

  async getInventoryAlerts(ubsId: string) {
    // Return medications below minimum stock in this UBS
    const inventoryItems = await this.prisma.inventory.findMany({
      where: { ubsId },
      include: { medication: true },
    });

    return inventoryItems
      .filter((inv) => inv.quantity < inv.medication.minStock)
      .map((inv) => ({
        medicationId: inv.medicationId,
        name: inv.medication.name,
        currentStock: inv.quantity,
        minStock: inv.medication.minStock,
        status: 'ESTOQUE ABAIXO DO MÍNIMO',
      }));
  }

  async getExpiringLots(ubsId: string) {
    // Return warning alerts for expiration dates
    const lots = await this.prisma.medicationLot.findMany({
      where: {
        ubsId,
        quantityPhysical: { gt: 0 },
      },
      include: { medication: true },
    });

    const now = new Date();
    const alerts = [];

    for (const lot of lots) {
      const diffTime = lot.expirationDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let alertStatus: string | null = null;
      if (diffDays <= 0) {
        alertStatus = 'VENCIDO';
      } else if (diffDays <= 7) {
        alertStatus = 'VENCE EM 7 DIAS';
      } else if (diffDays <= 30) {
        alertStatus = 'VENCE EM 30 DIAS';
      } else if (diffDays <= 60) {
        alertStatus = 'VENCE EM 60 DIAS';
      }

      if (alertStatus) {
        alerts.push({
          lotId: lot.id,
          medicationName: lot.medication.name,
          lotNumber: lot.lotNumber,
          expirationDate: lot.expirationDate,
          daysRemaining: diffDays,
          status: alertStatus,
        });
      }
    }

    return alerts;
  }

  async getUbsInventory(ubsId: string) {
    return this.prisma.inventory.findMany({
      where: { ubsId },
      include: { medication: true },
    });
  }

  async getLotInventory(ubsId: string, medicationId?: string) {
    const where: any = { ubsId };
    if (medicationId) {
      where.medicationId = medicationId;
    }
    return this.prisma.medicationLot.findMany({
      where,
      include: { medication: true },
      orderBy: { expirationDate: 'asc' },
    });
  }

  async registerLossOrReturn(
    data: {
      medicationId: string;
      lotId: string;
      ubsId: string;
      quantity: number; // negative for loss, positive for return
      type: 'LOSS' | 'RETURN';
      remarks?: string;
    },
    userId: string
  ) {
    if (data.quantity === 0) {
      throw new BadRequestException('Quantidade deve ser diferente de zero.');
    }

    if (data.type === 'LOSS' && data.quantity > 0) {
      throw new BadRequestException('Perdas devem ter quantidade negativa.');
    }

    if (data.type === 'RETURN' && data.quantity < 0) {
      throw new BadRequestException('Devoluções devem ter quantidade positiva.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const currentLot = await tx.medicationLot.findUnique({
        where: { id: data.lotId },
      });
      if (!currentLot) {
        throw new NotFoundException('Lote não encontrado.');
      }

      if (currentLot.quantityPhysical + data.quantity < 0) {
        throw new BadRequestException('A quantidade física do lote não pode se tornar negativa.');
      }
      if (currentLot.quantityAvailable + data.quantity < 0) {
        throw new BadRequestException('A quantidade disponível do lote não pode se tornar negativa.');
      }

      // Update lot stock
      const lot = await tx.medicationLot.update({
        where: { id: data.lotId },
        data: {
          quantityPhysical: { increment: data.quantity },
          quantityAvailable: { increment: data.quantity },
        },
      });

      // Log movement
      const movement = await tx.inventoryMovement.create({
        data: {
          medicationId: data.medicationId,
          lotId: data.lotId,
          ubsId: data.ubsId,
          quantity: data.quantity,
          type: data.type,
          userId,
          remarks: data.remarks || `${data.type === 'LOSS' ? 'Registro de perda' : 'Registro de devolução'}`,
        },
      });

      // Recalculate aggregated inventory
      const totalAvailable = await tx.medicationLot.aggregate({
        _sum: { quantityAvailable: true },
        where: {
          ubsId: data.ubsId,
          medicationId: data.medicationId,
          expirationDate: { gt: new Date() },
        },
      });

      const currentStock = totalAvailable._sum.quantityAvailable || 0;
      await tx.inventory.upsert({
        where: {
          ubsId_medicationId: { ubsId: data.ubsId, medicationId: data.medicationId },
        },
        create: { ubsId: data.ubsId, medicationId: data.medicationId, quantity: currentStock },
        update: { quantity: currentStock },
      });

      await this.audit.log(userId, 'INVENTORY_ADJUSTED', 'MedicationLot', lot.id, { type: data.type, quantity: data.quantity }, undefined, tx);

      return lot;
    });
  }

  async getMovements(ubsId?: string) {
    const where: any = {};
    if (ubsId) {
      where.ubsId = ubsId;
    }
    return this.prisma.inventoryMovement.findMany({
      where,
      include: {
        medication: true,
        lot: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
