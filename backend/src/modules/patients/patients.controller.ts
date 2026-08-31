import { Controller, Get, Post, Patch, Body, Query, Req } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UpdateMeDto } from './dto/update-me.dto';
import { CreatePatientOperationalDto } from './dto/create-patient-operational.dto';

@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get('me')
  @Roles('PACIENTE')
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.patientsService.findMe(req.user.userId);
  }

  @Patch('me')
  @Roles('PACIENTE')
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateMeDto
  ) {
    return this.patientsService.updateMe(req.user.userId, body);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'GESTOR', 'MEDICO', 'ATENDENTE')
  async getAllPatients(@Query('search') search?: string) {
    return this.patientsService.findAll(search);
  }

  @Post()
  @Roles('ADMINISTRADOR', 'ATENDENTE')
  async createPatientOperational(
    @Body() body: CreatePatientOperationalDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.patientsService.createPatientOperational(body, req.user.userId);
  }
}

