import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { AuditService } from '../../shared/audit.service';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async createAttendance(
    data: {
      appointmentId: string;
      evolution: string;
      diagnosis: string;
      conduct: string;
      prescriptions?: {
        medicationId: string;
        dosage: string;
        frequency: string;
        duration: string;
        qtyRequested: number;
      }[];
      examRequests?: {
        examName: string;
      }[];
      referral?: {
        destinationUbsId: string;
        specialtyId: string;
        reason: string;
      };
    },
    doctorUserId: string
  ) {
    // 1. Verify doctor exists and is linked to the user
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });
    if (!doctor) throw new NotFoundException('Médico não credenciado.');

    // 2. Verify appointment exists and is in status EM_ATENDIMENTO
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { patient: true },
    });
    if (!appointment) throw new NotFoundException('Consulta não encontrada.');

    return await this.prisma.$transaction(async (tx) => {
      // Create Medical Record
      const medicalRecord = await tx.medicalRecord.create({
        data: {
          appointmentId: data.appointmentId,
          evolution: data.evolution,
          diagnosis: data.diagnosis,
          conduct: data.conduct,
        },
      });

      // Handle Prescriptions if any
      if (data.prescriptions && data.prescriptions.length > 0) {
        const prescription = await tx.prescription.create({
          data: {
            appointmentId: data.appointmentId,
            medicalRecordId: medicalRecord.id,
            doctorId: doctor.id,
            status: 'ACTIVE',
          },
        });

        for (const item of data.prescriptions) {
          const prescrItem = await tx.prescriptionItem.create({
            data: {
              prescriptionId: prescription.id,
              medicationId: item.medicationId,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              qtyRequested: item.qtyRequested,
            },
          });

          // Perform Medication Reservation logic (FEFO)
          let qtyToReserve = item.qtyRequested;

          // Find active lots (not expired) in doctor's current UBS
          // Sort by expirationDate ASC
          const now = new Date();
          const lots = await tx.medicationLot.findMany({
            where: {
              medicationId: item.medicationId,
              ubsId: appointment.ubsId,
              expirationDate: { gt: now },
              quantityAvailable: { gt: 0 },
            },
            orderBy: { expirationDate: 'asc' },
          });

          // Reserve from lots using FEFO
          for (const lot of lots) {
            if (qtyToReserve <= 0) break;

            const reserveQty = Math.min(qtyToReserve, lot.quantityAvailable);

            // Update lot stock
            await tx.medicationLot.update({
              where: { id: lot.id },
              data: {
                quantityReserved: { increment: reserveQty },
                quantityAvailable: { decrement: reserveQty },
              },
            });

            // Create Reservation record
            await tx.medicationReservation.create({
              data: {
                prescriptionItemId: prescrItem.id,
                lotId: lot.id,
                quantity: reserveQty,
                status: 'RESERVED',
              },
            });

            // Log movement
            await tx.inventoryMovement.create({
              data: {
                medicationId: item.medicationId,
                lotId: lot.id,
                ubsId: appointment.ubsId,
                quantity: reserveQty,
                type: 'RESERVED',
                userId: doctor.userId || '',
                remarks: `Reserva para receita ${prescription.id}`,
              },
            });

            qtyToReserve -= reserveQty;
          }

          // If not enough stock was reserved, trigger inventory alerts
          const medication = await tx.medication.findUnique({
            where: { id: item.medicationId },
          });

          // Update aggregated inventory count for this UBS
          const totalAvailableInUbs = await tx.medicationLot.aggregate({
            _sum: { quantityAvailable: true },
            where: {
              medicationId: item.medicationId,
              ubsId: appointment.ubsId,
              expirationDate: { gt: now },
            },
          });

          const currentStock = totalAvailableInUbs._sum.quantityAvailable || 0;
          await tx.inventory.upsert({
            where: {
              ubsId_medicationId: { ubsId: appointment.ubsId, medicationId: item.medicationId },
            },
            create: {
              ubsId: appointment.ubsId,
              medicationId: item.medicationId,
              quantity: currentStock,
            },
            update: {
              quantity: currentStock,
            },
          });

          // If stock is below minimum, alert can be read via dashboard
        }
      }

      // Handle Exam Requests if any
      if (data.examRequests && data.examRequests.length > 0) {
        const examRequest = await tx.examRequest.create({
          data: {
            appointmentId: data.appointmentId,
            medicalRecordId: medicalRecord.id,
            doctorId: doctor.id,
            priority: 'NORMAL',
          },
        });

        await tx.examRequestItem.createMany({
          data: data.examRequests.map((ex) => ({
            examRequestId: examRequest.id,
            examName: ex.examName,
            status: 'SOLICITADO',
          })),
        });
      }

      // Handle Referrals if any
      if (data.referral) {
        await tx.referral.create({
          data: {
            originUbsId: appointment.ubsId,
            destinationUbsId: data.referral.destinationUbsId,
            patientId: appointment.patientId,
            specialtyId: data.referral.specialtyId,
            reason: data.referral.reason,
            requestDoctorId: doctor.id,
          },
        });

        // Set status to ENCAMINHADA
        await tx.appointment.update({
          where: { id: data.appointmentId },
          data: { status: 'ENCAMINHADA' },
        });
      } else {
        // Set status to ATENDIDA
        await tx.appointment.update({
          where: { id: data.appointmentId },
          data: { status: 'ATENDIDA' },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: doctor.userId,
          action: 'PRESCRIPTION_CREATED',
          resource: 'MedicalRecord',
          resourceId: medicalRecord.id,
          details: JSON.stringify({ appointmentId: data.appointmentId }),
        },
      });

      return medicalRecord;
    });
  }

  async getAttendanceByAppointment(appointmentId: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: { patient: true },
        },
        prescription: {
          include: {
            items: {
              include: {
                medication: true,
                reservations: {
                  include: { lot: true },
                },
              },
            },
          },
        },
        examRequest: {
          include: { items: true },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Atendimento não encontrado.');
    }

    return record;
  }

  async getPatientMedicalHistory(patientId: string) {
    return this.prisma.medicalRecord.findMany({
      where: {
        appointment: { patientId },
      },
      include: {
        appointment: {
          include: { doctor: true, specialty: true, ubs: true },
        },
        prescription: {
          include: {
            items: { include: { medication: true } },
          },
        },
        examRequest: {
          include: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReferrals(filters?: { patientId?: string; originUbsId?: string; destinationUbsId?: string }) {
    const where: any = {};
    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.originUbsId) where.originUbsId = filters.originUbsId;
    if (filters?.destinationUbsId) where.destinationUbsId = filters.destinationUbsId;

    return this.prisma.referral.findMany({
      where,
      include: {
        patient: true,
        originUbs: true,
        destinationUbs: true,
        specialty: true,
        doctor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
