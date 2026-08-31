import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { UbsService } from './ubs.service';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateUbsDto } from './dto/create-ubs.dto';
import { UpdateUbsDto } from './dto/update-ubs.dto';
import { AddZoneDto } from './dto/add-zone.dto';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';

@Controller()
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
    @Body() body: CreateUbsDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.ubsService.createUbs(body, req.user.userId);
  }

  @Patch('ubs/:id')
  @Roles('ADMINISTRADOR')
  async updateUbs(
    @Param('id') id: string,
    @Body() body: UpdateUbsDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.ubsService.updateUbs(id, body, req.user.userId);
  }

  @Post('ubs/:id/zones')
  @Roles('ADMINISTRADOR')
  async addZone(
    @Param('id') id: string,
    @Body() body: AddZoneDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.ubsService.addZone(id, body.neighborhood, req.user.userId);
  }

  @Delete('ubs/zones/:id')
  @Roles('ADMINISTRADOR')
  async removeZone(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.ubsService.removeZone(id, req.user.userId);
  }

  @Get('specialties')
  async getSpecialties() {
    return this.ubsService.findAllSpecialties();
  }

  @Post('specialties')
  @Roles('ADMINISTRADOR')
  async createSpecialty(
    @Body() body: CreateSpecialtyDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.ubsService.createSpecialty(body, req.user.userId);
  }

  @Post('ubs/:id/specialties')
  @Roles('ADMINISTRADOR')
  async linkSpecialty(
    @Param('id') ubsId: string,
    @Body('specialtyId') specialtyId: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.ubsService.linkSpecialty(ubsId, specialtyId, req.user.userId);
  }

  @Delete('ubs/:id/specialties/:specialtyId')
  @Roles('ADMINISTRADOR')
  async unlinkSpecialty(
    @Param('id') ubsId: string,
    @Param('specialtyId') specialtyId: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.ubsService.unlinkSpecialty(ubsId, specialtyId, req.user.userId);
  }
}
