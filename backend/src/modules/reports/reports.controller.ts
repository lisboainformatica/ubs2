import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
@UseGuards(RolesGuard)
@Roles('ADMINISTRADOR', 'GESTOR')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  async getDashboard(@Query('ubsId') ubsId?: string) {
    return this.reportsService.getDashboardStats(ubsId);
  }

  @Get('ubs')
  async getUbsReports() {
    return this.reportsService.getReportsByUbs();
  }
}
