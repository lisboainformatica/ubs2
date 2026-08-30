import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { UbsService } from './ubs.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(RolesGuard)
export class UbsController {
  constructor(private ubsService: UbsService) {}

  @Get('ubs')
  async getAllUbs(@Query('status') status?: string, @Query('search') search?: string) {
    return this.ubsService.findAll({ status, search });
  }

  @Get('ubs/:id')
  async getUbsById(@Param('id') id: string) {
    return this.ubsService.findOne(id);
  }

  @Post('ubs')
  @Roles('ADMINISTRADOR')
  async createUbs(
    @Body()
    body: {
      name: string;
      code: string;
      phone: string;
      email: string;
      latitude: number;
      longitude: number;
      capacity?: number;
      address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
      };
      specialtyIds?: string[];
      zones?: string[];
    },
    @Req() req: any
  ) {
    return this.ubsService.createUbs(body, req.user.userId);
  }

  @Patch('ubs/:id')
  @Roles('ADMINISTRADOR')
  async updateUbs(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      phone?: string;
      email?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      capacity?: number;
      latitude?: number;
      longitude?: number;
    },
    @Req() req: any
  ) {
    return this.ubsService.updateUbs(id, body, req.user.userId);
  }

  @Post('ubs/:id/zones')
  @Roles('ADMINISTRADOR')
  async addZone(
    @Param('id') id: string,
    @Body('neighborhood') neighborhood: string,
    @Req() req: any
  ) {
    return this.ubsService.addZone(id, neighborhood, req.user.userId);
  }

  @Delete('ubs/zones/:id')
  @Roles('ADMINISTRADOR')
  async removeZone(@Param('id') id: string, @Req() req: any) {
    return this.ubsService.removeZone(id, req.user.userId);
  }

  @Get('specialties')
  async getSpecialties() {
    return this.ubsService.findAllSpecialties();
  }

  @Post('specialties')
  @Roles('ADMINISTRADOR')
  async createSpecialty(
    @Body() body: { name: string; description?: string },
    @Req() req: any
  ) {
    return this.ubsService.createSpecialty(body, req.user.userId);
  }

  @Post('ubs/:id/specialties')
  @Roles('ADMINISTRADOR')
  async linkSpecialty(
    @Param('id') ubsId: string,
    @Body('specialtyId') specialtyId: string,
    @Req() req: any
  ) {
    return this.ubsService.linkSpecialty(ubsId, specialtyId, req.user.userId);
  }

  @Delete('ubs/:id/specialties/:specialtyId')
  @Roles('ADMINISTRADOR')
  async unlinkSpecialty(
    @Param('id') ubsId: string,
    @Param('specialtyId') specialtyId: string,
    @Req() req: any
  ) {
    return this.ubsService.unlinkSpecialty(ubsId, specialtyId, req.user.userId);
  }
}
