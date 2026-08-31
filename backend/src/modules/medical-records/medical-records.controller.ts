import { Controller, Get, Post, Param, Body, Query, Req, ForbiddenException } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  @Post('attendances')
  @Roles('MEDICO')
  async createAttendance(
    @Body() body: CreateAttendanceDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.medicalRecordsService.createAttendance(body, req.user.userId);
  }

  @Get('attendances/appointment/:appointmentId')
  async getAttendanceByAppointment(
    @Param('appointmentId') appointmentId: string,
    @Req() req: AuthenticatedRequest
  ) {
    const record = await this.medicalRecordsService.getAttendanceByAppointment(appointmentId);

    if (req.user.role === 'PACIENTE' && record.appointment.patient.userId !== req.user.userId) {
      throw new ForbiddenException('Você não tem permissão para visualizar este atendimento.');
    }
    return record;
  }

  @Get('history/:patientId')
  async getHistory(@Param('patientId') patientId: string, @Req() req: AuthenticatedRequest) {
    if (req.user.role === 'PACIENTE' && req.user.patientId !== patientId) {
      throw new ForbiddenException('Você só pode visualizar seu próprio histórico médico.');
    }
    return this.medicalRecordsService.getPatientMedicalHistory(patientId);
  }

  @Get('referrals')
  async getReferrals(
    @Req() req: AuthenticatedRequest,
    @Query('patientId') patientId?: string,
    @Query('originUbsId') originUbsId?: string,
    @Query('destinationUbsId') destinationUbsId?: string
  ) {
    let queryPatientId = patientId;
    if (req.user.role === 'PACIENTE') {
      queryPatientId = req.user.patientId;
    }
    return this.medicalRecordsService.getReferrals({
      patientId: queryPatientId,
      originUbsId,
      destinationUbsId,
    });
  }
}
