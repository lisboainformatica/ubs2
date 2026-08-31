import { Controller, Get, Post, Param, Body, Query, Req, ForbiddenException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { SaveDoctorScheduleDto } from './dto/save-doctor-schedule.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  async getDoctors(@Query('ubsId') ubsId?: string, @Query('specialtyId') specialtyId?: string) {
    return this.doctorsService.findAll({ ubsId, specialtyId });
  }

  @Get(':id')
  async getDoctorById(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Get(':id/schedule')
  async getDoctorSchedule(@Param('id') id: string, @Query('ubsId') ubsId?: string) {
    return this.doctorsService.getSchedule(id, ubsId);
  }

  @Post(':id/schedule')
  @Roles('ADMINISTRADOR', 'MEDICO')
  async saveDoctorSchedule(
    @Param('id') doctorId: string,
    @Body() body: SaveDoctorScheduleDto,
    @Req() req: AuthenticatedRequest
  ) {
    if (req.user.role === 'MEDICO') {
      const doctor = await this.doctorsService.findOne(doctorId);
      if (doctor.userId !== req.user.userId) {
        throw new ForbiddenException('Você só pode editar sua própria agenda.');
      }
    }

    return this.doctorsService.createSchedule(doctorId, body.ubsId, body.schedules, req.user.userId);
  }
}

