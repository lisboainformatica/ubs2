import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
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
