import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('doctors')
@UseGuards(RolesGuard)
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
    @Body('ubsId') ubsId: string,
    @Body('schedules')
    schedules: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      intervalMin?: number;
    }[],
    @Req() req: any
  ) {
    // If current user is a doctor, they can only edit their own schedule
    if (req.user.role === 'MEDICO') {
      const doctor = await this.doctorsService.findOne(doctorId);
      if (doctor.userId !== req.user.userId) {
        throw new ForbiddenException('Você só pode editar sua própria agenda.');
      }
    }

    return this.doctorsService.createSchedule(doctorId, ubsId, schedules, req.user.userId);
  }
}
