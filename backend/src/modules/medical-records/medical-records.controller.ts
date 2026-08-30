import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('medical-records')
@UseGuards(RolesGuard)
export class MedicalRecordsController {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  @Post('attendances')
  @Roles('MEDICO')
  async createAttendance(
    @Body()
    body: {
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
    @Req() req: any
  ) {
    return this.medicalRecordsService.createAttendance(body, req.user.userId);
  }

  @Get('attendances/appointment/:appointmentId')
  async getAttendanceByAppointment(
    @Param('appointmentId') appointmentId: string,
    @Req() req: any
  ) {
    const record = await this.medicalRecordsService.getAttendanceByAppointment(appointmentId);

    if (req.user.role === 'PACIENTE' && record.appointment.patient.userId !== req.user.userId) {
      throw new ForbiddenException('Você não tem permissão para visualizar este atendimento.');
    }
    return record;
  }

  @Get('history/:patientId')
  async getHistory(@Param('patientId') patientId: string, @Req() req: any) {
    if (req.user.role === 'PACIENTE' && req.user.patientId !== patientId) {
      throw new ForbiddenException('Você só pode visualizar seu próprio histórico médico.');
    }
    return this.medicalRecordsService.getPatientMedicalHistory(patientId);
  }

  @Get('referrals')
  async getReferrals(
    @Req() req: any,
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
