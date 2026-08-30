import { Controller, Get, Post, Patch, Body, Query, UseGuards, Req } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('patients')
@UseGuards(RolesGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get('me')
  @Roles('PACIENTE')
  async getMe(@Req() req: any) {
    return this.patientsService.findMe(req.user.userId);
  }

  @Patch('me')
  @Roles('PACIENTE')
  async updateMe(
    @Req() req: any,
    @Body()
    body: {
      name?: string;
      phone?: string;
      address?: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
      };
    }
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
    @Body()
    body: {
      name: string;
      cpf: string;
      birthDate: string;
      phone: string;
      email: string;
      address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
      };
    },
    @Req() req: any
  ) {
    return this.patientsService.createPatientOperational(body, req.user.userId);
  }
}
