import { Controller, Get, Post, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('inventory')
@UseGuards(RolesGuard)
export class PharmacyController {
  constructor(private pharmacyService: PharmacyService) {}

  @Post('medications')
  @Roles('ADMINISTRADOR')
  async createMedication(@Body() body: { name: string; dosageForm: string; minStock?: number; targetStock?: number }) {
    return this.pharmacyService.createMedication(body);
  }

  @Get('medications')
  async getMedications() {
    return this.pharmacyService.findAllMedications();
  }

  @Post('lots')
  @Roles('ADMINISTRADOR', 'FARMACEUTICO')
  async addLot(
    @Body()
    body: {
      medicationId: string;
      lotNumber: string;
      quantityPhysical: number;
      expirationDate: string;
      manufacturingDate?: string;
      supplier?: string;
      ubsId: string;
    },
    @Req() req: any
  ) {
    return this.pharmacyService.addLot(body, req.user.userId);
  }

  @Post('dispense')
  @Roles('FARMACEUTICO', 'ATENDENTE')
  async dispenseMedication(@Body('prescriptionItemId') prescriptionItemId: string, @Req() req: any) {
    return this.pharmacyService.dispenseMedication(prescriptionItemId, req.user.userId);
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
    @Body()
    body: {
      medicationId: string;
      lotId: string;
      ubsId: string;
      quantity: number;
      type: 'LOSS' | 'RETURN';
      remarks?: string;
    },
    @Req() req: any
  ) {
    return this.pharmacyService.registerLossOrReturn(body, req.user.userId);
  }

  @Get('movements')
  @Roles('ADMINISTRADOR', 'FARMACEUTICO', 'GESTOR')
  async getMovements(@Query('ubsId') ubsId?: string) {
    return this.pharmacyService.getMovements(ubsId);
  }
}
