import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { AuditService } from '../../shared/audit.service';

@Injectable()
export class UbsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async createUbs(
    data: {
      name: string;
      code: string;
      phone: string;
      email: string;
      latitude: number;
      longitude: number;
      capacity?: number;
      address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
      };
      specialtyIds?: string[];
      zones?: string[];
    },
    userId: string
  ) {
    const existingUbs = await this.prisma.uBS.findUnique({
      where: { code: data.code },
    });
    if (existingUbs) {
      throw new BadRequestException('Já existe uma UBS cadastrada com este código.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          street: data.address.street,
          number: data.address.number,
          complement: data.address.complement || null,
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
        },
      });

      const ubs = await tx.uBS.create({
        data: {
          name: data.name,
          code: data.code,
          addressId: address.id,
          phone: data.phone,
          email: data.email,
          latitude: data.latitude,
          longitude: data.longitude,
          capacity: data.capacity || 50,
          status: 'ACTIVE',
        },
      });

      if (data.specialtyIds && data.specialtyIds.length > 0) {
        await tx.ubsSpecialty.createMany({
          data: data.specialtyIds.map((specId) => ({
            ubsId: ubs.id,
            specialtyId: specId,
          })),
        });
      }

      if (data.zones && data.zones.length > 0) {
        await tx.serviceZone.createMany({
          data: data.zones.map((neighborhood) => ({
            ubsId: ubs.id,
            neighborhood: neighborhood,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          resource: 'UBS',
          resourceId: ubs.id,
          details: JSON.stringify({ name: ubs.name, code: ubs.code }),
        },
      });

      return ubs;
    });
  }

  async updateUbs(
    id: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      capacity?: number;
      latitude?: number;
      longitude?: number;
    },
    userId: string
  ) {
    const ubs = await this.prisma.uBS.findUnique({ where: { id } });
    if (!ubs) {
      throw new NotFoundException('UBS não encontrada.');
    }

    const updated = await this.prisma.uBS.update({
      where: { id },
      data,
    });

    await this.audit.log(userId, 'UPDATE', 'UBS', id, data);
    return updated;
  }

  async findAll(filters?: { status?: string; search?: string }) {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
      ];
    }

    return this.prisma.uBS.findMany({
      where,
      include: {
        address: true,
        zones: true,
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const ubs = await this.prisma.uBS.findUnique({
      where: { id },
      include: {
        address: true,
        zones: true,
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });

    if (!ubs) {
      throw new NotFoundException('UBS não encontrada.');
    }

    return ubs;
  }

  // Zonas de Atendimento
  async addZone(ubsId: string, neighborhood: string, userId: string) {
    const existing = await this.prisma.serviceZone.findFirst({
      where: { ubsId, neighborhood },
    });
    if (existing) {
      throw new BadRequestException('Esta zona de atendimento já está cadastrada para esta UBS.');
    }

    const zone = await this.prisma.serviceZone.create({
      data: { ubsId, neighborhood },
    });

    await this.audit.log(userId, 'CREATE', 'ServiceZone', zone.id, { ubsId, neighborhood });
    return zone;
  }

  async removeZone(id: string, userId: string) {
    const zone = await this.prisma.serviceZone.findUnique({ where: { id } });
    if (!zone) {
      throw new NotFoundException('Zona de atendimento não encontrada.');
    }

    await this.prisma.serviceZone.delete({ where: { id } });
    await this.audit.log(userId, 'DELETE', 'ServiceZone', id, zone);
    return { success: true };
  }

  // Especialidades
  async createSpecialty(data: { name: string; description?: string }, userId: string) {
    const existing = await this.prisma.specialty.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new BadRequestException('Especialidade já cadastrada.');
    }

    const spec = await this.prisma.specialty.create({
      data,
    });

    await this.audit.log(userId, 'CREATE', 'Specialty', spec.id, data);
    return spec;
  }

  async findAllSpecialties() {
    return this.prisma.specialty.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async linkSpecialty(ubsId: string, specialtyId: string, userId: string) {
    const link = await this.prisma.ubsSpecialty.create({
      data: { ubsId, specialtyId },
    });

    await this.audit.log(userId, 'CREATE', 'UbsSpecialty', link.id, { ubsId, specialtyId });
    return link;
  }

  async unlinkSpecialty(ubsId: string, specialtyId: string, userId: string) {
    const link = await this.prisma.ubsSpecialty.findUnique({
      where: { ubsId_specialtyId: { ubsId, specialtyId } },
    });
    if (!link) {
      throw new NotFoundException('Vínculo não encontrado.');
    }

    await this.prisma.ubsSpecialty.delete({
      where: { ubsId_specialtyId: { ubsId, specialtyId } },
    });

    await this.audit.log(userId, 'DELETE', 'UbsSpecialty', link.id, { ubsId, specialtyId });
    return { success: true };
  }
}
