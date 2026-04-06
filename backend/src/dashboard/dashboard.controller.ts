import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(user.company_id);
  }

  @Get('production-status')
  getProductionStatus(@CurrentUser() user: any) {
    return this.dashboardService.getProductionStatus(user.company_id);
  }

  @Get('pending-deliveries')
  getPendingDeliveries(@CurrentUser() user: any) {
    return this.dashboardService.getPendingDeliveries(user.company_id);
  }

  @Get('revenue-trend')
  getRevenueTrend(@CurrentUser() user: any) {
    return this.dashboardService.getRevenueTrend(user.company_id);
  }
}
