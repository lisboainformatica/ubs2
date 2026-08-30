import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(ubsId?: string) {
    const whereAppointment: any = {};
    const whereInventory: any = {};
    if (ubsId) {
      whereAppointment.ubsId = ubsId;
      whereInventory.ubsId = ubsId;
    }

    // 1. Appointments counts
    const appointments = await this.prisma.appointment.findMany({
      where: whereAppointment,
    });

    const totalAppointments = appointments.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments.filter(
      (a) => a.dateTime >= today && a.dateTime < tomorrow
    ).length;

    const stats = {
      total: totalAppointments,
      today: todayAppointments,
      agendadas: appointments.filter((a) => a.status === 'AGENDADA').length,
      confirmadas: appointments.filter((a) => a.status === 'CONFIRMADA').length,
      pacienteChegou: appointments.filter((a) => a.status === 'PACIENTE_CHEGOU').length,
      emAtendimento: appointments.filter((a) => a.status === 'EM_ATENDIMENTO').length,
      atendidas: appointments.filter((a) => a.status === 'ATENDIDA').length,
      canceladas: appointments.filter((a) => a.status === 'CANCELADA').length,
      faltas: appointments.filter((a) => a.status === 'FALTA').length,
      encaminhadas: appointments.filter((a) => a.status === 'ENCAMINHADA').length,
    };

    // 2. Specialty breakdown
    const specialtyStats = await this.prisma.appointment.groupBy({
      by: ['specialtyId'],
      _count: { id: true },
      where: whereAppointment,
    });

    const specialties = await this.prisma.specialty.findMany();
    const specialtyBreakdown = specialtyStats.map((item) => {
      const spec = specialties.find((s) => s.id === item.specialtyId);
      return {
        name: spec ? spec.name : 'Outra',
        count: item._count.id,
      };
    });

    // 3. Inventory details
    const inventory = await this.prisma.inventory.findMany({
      where: whereInventory,
      include: { medication: true },
    });

    const belowMinCount = inventory.filter((inv) => inv.quantity < inv.medication.minStock).length;

    const now = new Date();
    const expiredCount = await this.prisma.medicationLot.count({
      where: {
        expirationDate: { lte: now },
        quantityPhysical: { gt: 0 },
      },
    });

    const expiring30Days = await this.prisma.medicationLot.count({
      where: {
        expirationDate: {
          gt: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        quantityPhysical: { gt: 0 },
      },
    });

    // 4. Pharmacy movements details
    const movements = await this.prisma.inventoryMovement.findMany({
      where: ubsId ? { ubsId } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { medication: true },
    });

    const totalDispensed = await this.prisma.inventoryMovement.aggregate({
      _sum: { quantity: true },
      where: {
        type: 'DISPENSED',
        ...(ubsId ? { ubsId } : {}),
      },
    });

    return {
      appointments: stats,
      specialties: specialtyBreakdown,
      inventory: {
        totalItems: inventory.length,
        belowMinCount,
        expiredCount,
        expiring30Days,
        totalDispensed: Math.abs(totalDispensed._sum.quantity || 0),
      },
      recentMovements: movements.map((m) => ({
        id: m.id,
        medicationName: m.medication.name,
        quantity: m.quantity,
        type: m.type,
        createdAt: m.createdAt,
        remarks: m.remarks,
      })),
    };
  }

  async getReportsByUbs() {
    const ubs = await this.prisma.uBS.findMany({
      include: {
        appointments: true,
        inventories: { include: { medication: true } },
      },
    });

    return ubs.map((u) => {
      const total = u.appointments.length;
      const done = u.appointments.filter((a) => a.status === 'ATENDIDA').length;
      const missed = u.appointments.filter((a) => a.status === 'FALTA').length;
      const cancelled = u.appointments.filter((a) => a.status === 'CANCELADA').length;

      return {
        id: u.id,
        name: u.name,
        code: u.code,
        appointments: {
          total,
          atendidas: done,
          faltas: missed,
          canceladas: cancelled,
          taxaFalta: total > 0 ? (missed / total) * 100 : 0,
        },
        medicationsCount: u.inventories.length,
      };
    });
  }
}
