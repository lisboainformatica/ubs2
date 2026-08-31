import { Controller, Get, Post, Body, Query, Req, Param } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { AddLotDto } from './dto/add-lot.dto';
import { DispenseMedicationDto } from './dto/dispense-medication.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

@Controller('inventory')
export class PharmacyController {
  constructor(private pharmacyService: PharmacyService) {}

  @Post('medications')
  @Roles('ADMINISTRADOR')
  async createMedication(@Body() body: CreateMedicationDto) {
    return this.pharmacyService.createMedication(body);
  }

  @Get('medications')
  async getMedications() {
    return this.pharmacyService.findAllMedications();
  }

  @Post('lots')
  @Roles('ADMINISTRADOR', 'FARMACEUTICO')
  async addLot(
    @Body() body: AddLotDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.pharmacyService.addLot(body, req.user.userId);
  }

  @Post('dispense')
  @Roles('FARMACEUTICO', 'ATENDENTE')
  async dispenseMedication(
    @Body() body: DispenseMedicationDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.pharmacyService.dispenseMedication(body.prescriptionItemId, req.user.userId);
  }

  @Get('alerts')
  @Roles('ADMINISTRADOR', 'FARMACEUTICO', 'GESTOR')
  async getAlerts(@Query('ubsId') ubsId: string) {
    return this.pharmacyService.getInventoryAlerts(ubsId);
  }

  @Get('expiring')
  @Roles('ADMINISTRADOR', 'FARMACEUTICO', 'GESTOR')
  async getExpiring(@Query('ubsId') ubsId: string) {
    return this.pharmacyService.getExpiringLots(ubsId);
  }

  @Get()
  async getInventory(@Query('ubsId') ubsId: string) {
    return this.pharmacyService.getUbsInventory(ubsId);
  }

  @Get('lots-list')
  async getLots(@Query('ubsId') ubsId: string, @Query('medicationId') medicationId?: string) {
    return this.pharmacyService.getLotInventory(ubsId, medicationId);
  }

  @Post('adjust')
  @Roles('ADMINISTRADOR', 'FARMACEUTICO')
  async adjustInventory(
    @Body() body: AdjustInventoryDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.pharmacyService.registerLossOrReturn(body, req.user.userId);
  }

  @Get('movements')
  @Roles('ADMINISTRADOR', 'FARMACEUTICO', 'GESTOR')
  async getMovements(@Query('ubsId') ubsId?: string) {
    return this.pharmacyService.getMovements(ubsId);
  }
}
