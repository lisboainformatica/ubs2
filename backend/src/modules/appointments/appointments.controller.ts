import { Controller, Get, Post, Patch, Param, Body, Query, Req, ForbiddenException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('appointments')
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
    @Req() req: AuthenticatedRequest,
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('ubsId') ubsId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string
  ) {
    let queryPatientId = patientId;
    if (req.user.role === 'PACIENTE') {
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
  async getAppointmentById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
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
    @Body() body: CreateAppointmentDto,
    @Req() req: AuthenticatedRequest
  ) {
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
    @Body() body: UpdateStatusDto,
    @Req() req: AuthenticatedRequest
  ) {
    if (req.user.role === 'PACIENTE') {
      if (body.status !== 'CANCELADA') {
        throw new ForbiddenException('Pacientes só podem cancelar suas próprias consultas.');
      }
      const appointment = await this.appointmentsService.findOne(id);
      if (appointment.patient.userId !== req.user.userId) {
        throw new ForbiddenException('Você só pode cancelar suas próprias consultas.');
      }
    }

    return this.appointmentsService.updateStatus(id, body.status, req.user.userId);
  }
}
