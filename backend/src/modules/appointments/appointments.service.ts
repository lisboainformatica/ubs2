import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { AuditService } from '../../shared/audit.service';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  AGENDADA: ['CONFIRMADA', 'CANCELADA', 'FALTA'],
  CONFIRMADA: ['PACIENTE_CHEGOU', 'CANCELADA', 'FALTA'],
  PACIENTE_CHEGOU: ['EM_ATENDIMENTO', 'CANCELADA'],
  EM_ATENDIMENTO: ['ATENDIDA', 'CANCELADA', 'ENCAMINHADA'],
  ATENDIDA: [],
  CANCELADA: [],
  FALTA: [],
  ENCAMINHADA: [],
};

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async getAvailableSlots(doctorId: string, dateStr: string, specialtyId: string) {
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Data inválida. Formato esperado: AAAA-MM-DD');
    }

    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // 1. Fetch doctor's schedule for this day of week
    const schedules = await this.prisma.doctorSchedule.findMany({
      where: { doctorId, dayOfWeek },
    });

    if (schedules.length === 0) {
      return [];
    }

    // 2. Fetch existing appointments for this doctor on this day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ['CANCELADA'] },
      },
    });

    const bookedTimes = appointments.map((a) => {
      const hours = a.dateTime.getHours().toString().padStart(2, '0');
      const minutes = a.dateTime.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    });

    // 3. Generate slots
    const slots: string[] = [];
    for (const schedule of schedules) {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);

      let current = new Date(targetDate);
      current.setHours(startHour, startMin, 0, 0);

      const endLimit = new Date(targetDate);
      endLimit.setHours(endHour, endMin, 0, 0);

      while (current < endLimit) {
        const timeStr = `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`;
        if (!bookedTimes.includes(timeStr)) {
          slots.push(timeStr);
        }
        current.setMinutes(current.getMinutes() + schedule.intervalMin);
      }
    }

    return slots;
  }

  async createAppointment(
    data: {
      patientId: string;
      doctorId: string;
      specialtyId: string;
      ubsId: string;
      dateTime: string;
    },
    userId: string
  ) {
    const bookingTime = new Date(data.dateTime);
    if (isNaN(bookingTime.getTime())) {
      throw new BadRequestException('Data e hora inválidas.');
    }

    // Check if patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: data.patientId },
    });
    if (!patient) throw new NotFoundException('Paciente não encontrado.');

    // Check if doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: data.doctorId },
    });
    if (!doctor) throw new NotFoundException('Médico não encontrado.');

    // Check if UBS exists
    const ubs = await this.prisma.uBS.findUnique({
      where: { id: data.ubsId },
    });
    if (!ubs) throw new NotFoundException('UBS não encontrada.');

    // Check if specialty exists
    const specialty = await this.prisma.specialty.findUnique({
      where: { id: data.specialtyId },
    });
    if (!specialty) throw new NotFoundException('Especialidade não encontrada.');

    // Concurrency Lock & Transaction
    return await this.prisma.$transaction(async (tx) => {
      // 1. Check if the doctor already has an appointment booked at this exact time
      const existing = await tx.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          dateTime: bookingTime,
          status: { notIn: ['CANCELADA'] },
        },
      });

      if (existing) {
        throw new BadRequestException('Este horário já foi reservado por outro paciente.');
      }

      // 2. Create Appointment
      const appointment = await tx.appointment.create({
        data: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          specialtyId: data.specialtyId,
          ubsId: data.ubsId,
          dateTime: bookingTime,
          status: 'AGENDADA',
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'APPOINTMENT_CREATED',
          resource: 'Appointment',
          resourceId: appointment.id,
          details: JSON.stringify({
            patientId: data.patientId,
            doctorId: data.doctorId,
            dateTime: data.dateTime,
          }),
        },
      });

      return appointment;
    });
  }

  async updateStatus(id: string, newStatus: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada.');
    }

    const currentStatus = appointment.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: não é permitido alterar de ${currentStatus} para ${newStatus}.`
      );
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: newStatus },
    });

    await this.audit.log(userId, 'APPOINTMENT_CANCELLED', 'Appointment', id, {
      from: currentStatus,
      to: newStatus,
    });

    return updated;
  }

  async findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    ubsId?: string;
    status?: string;
    date?: string;
  }) {
    const where: any = {};
    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.doctorId) where.doctorId = filters.doctorId;
    if (filters?.ubsId) where.ubsId = filters.ubsId;
    if (filters?.status) where.status = filters.status;

    if (filters?.date) {
      const targetDate = new Date(filters.date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.dateTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        specialty: true,
        ubs: true,
        medicalRecord: true,
      },
      orderBy: { dateTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: { address: true },
        },
        doctor: true,
        specialty: true,
        ubs: true,
        medicalRecord: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada.');
    }

    return appointment;
  }
}
