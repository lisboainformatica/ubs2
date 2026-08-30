import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('appointments')
@UseGuards(RolesGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get('available-slots')
  async getAvailableSlots(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
    @Query('specialtyId') specialtyId: string
  ) {
    return this.appointmentsService.getAvailableSlots(doctorId, date, specialtyId);
  }

  @Get()
  async getAppointments(
    @Req() req: any,
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('ubsId') ubsId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string
  ) {
    // Let's implement this check:
    let queryPatientId = patientId;
    if (req.user.role === 'PACIENTE') {
      // In auth.service, we put patientId in user payload! Yes!
      // req.user has patientId!
      queryPatientId = req.user.patientId;
    }

    let queryDoctorId = doctorId;
    if (req.user.role === 'MEDICO') {
      queryDoctorId = req.user.doctorId;
    }

    return this.appointmentsService.findAll({
      patientId: queryPatientId,
      doctorId: queryDoctorId,
      ubsId,
      status,
      date,
    });
  }

  @Get(':id')
  async getAppointmentById(@Param('id') id: string, @Req() req: any) {
    const appointment = await this.appointmentsService.findOne(id);
    if (req.user.role === 'PACIENTE' && appointment.patient.userId !== req.user.userId) {
      throw new ForbiddenException('Você não tem permissão para visualizar esta consulta.');
    }
    if (req.user.role === 'MEDICO' && appointment.doctor.userId !== req.user.userId) {
      throw new ForbiddenException('Você não tem permissão para visualizar esta consulta.');
    }
    return appointment;
  }

  @Post()
  async createAppointment(
    @Body()
    body: {
      patientId: string;
      doctorId: string;
      specialtyId: string;
      ubsId: string;
      dateTime: string;
    },
    @Req() req: any
  ) {
    // If patient, check that they are booking for themselves
    if (req.user.role === 'PACIENTE') {
      if (body.patientId !== req.user.patientId) {
        throw new ForbiddenException('Você só pode agendar consultas para si mesmo.');
      }
    }
    return this.appointmentsService.createAppointment(body, req.user.userId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: any
  ) {
    // Restrictions:
    // Patients can only transition to CANCELADA.
    if (req.user.role === 'PACIENTE') {
      if (status !== 'CANCELADA') {
        throw new ForbiddenException('Pacientes só podem cancelar suas próprias consultas.');
      }
      const appointment = await this.appointmentsService.findOne(id);
      if (appointment.patient.userId !== req.user.userId) {
        throw new ForbiddenException('Você só pode cancelar suas próprias consultas.');
      }
    }

    return this.appointmentsService.updateStatus(id, status, req.user.userId);
  }
}
