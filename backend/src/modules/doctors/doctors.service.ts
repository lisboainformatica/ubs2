import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { AuditService } from '../../shared/audit.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async findAll(filters?: { ubsId?: string; specialtyId?: string }) {
    const where: any = { status: 'ACTIVE' };

    if (filters?.ubsId) {
      where.ubsLinks = {
        some: { ubsId: filters.ubsId },
      };
    }

    if (filters?.specialtyId) {
      where.specialties = {
        some: { specialtyId: filters.specialtyId },
      };
    }

    return this.prisma.doctor.findMany({
      where,
      include: {
        specialties: {
          include: { specialty: true },
        },
        ubsLinks: {
          include: { ubs: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        specialties: {
          include: { specialty: true },
        },
        ubsLinks: {
          include: { ubs: true },
        },
        schedules: {
          include: { ubs: true },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Médico não encontrado.');
    }

    return doctor;
  }

  async getSchedule(doctorId: string, ubsId?: string) {
    const where: any = { doctorId };
    if (ubsId) {
      where.ubsId = ubsId;
    }
    return this.prisma.doctorSchedule.findMany({
      where,
      include: { ubs: true },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async createSchedule(
    doctorId: string,
    ubsId: string,
    schedules: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      intervalMin?: number;
    }[],
    userId: string
  ) {
    // Verify doctor and ubs exist
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Médico não encontrado.');

    const ubs = await this.prisma.uBS.findUnique({ where: { id: ubsId } });
    if (!ubs) throw new NotFoundException('UBS não encontrada.');

    // Remove existing schedules for this doctor at this UBS to overwrite
    await this.prisma.$transaction(async (tx) => {
      await tx.doctorSchedule.deleteMany({
        where: { doctorId, ubsId },
      });

      if (schedules.length > 0) {
        await tx.doctorSchedule.createMany({
          data: schedules.map((s) => ({
            doctorId,
            ubsId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            intervalMin: s.intervalMin || 30,
          })),
        });
      }
    });

    await this.audit.log(userId, 'UPDATE', 'DoctorSchedule', doctorId, { ubsId, schedules });
    return this.getSchedule(doctorId, ubsId);
  }
}
