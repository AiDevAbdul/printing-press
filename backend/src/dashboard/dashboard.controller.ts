import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('production-status')
  getProductionStatus() {
    return this.dashboardService.getProductionStatus();
  }

  @Get('pending-deliveries')
  getPendingDeliveries() {
    return this.dashboardService.getPendingDeliveries();
  }

  @Get('revenue-trend')
  getRevenueTrend() {
    return this.dashboardService.getRevenueTrend();
  }
}
