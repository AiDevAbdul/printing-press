import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('wastage-analytics')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  async exportWastageAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const buffer = await this.exportService.exportWastageAnalytics(start, end, user.company_id);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=wastage-analytics-${startDate}-to-${endDate}.xlsx`);
    res.send(buffer);
  }

  @Get('quality-metrics')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  async exportQualityMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const buffer = await this.exportService.exportQualityMetrics(start, end, user.company_id);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=quality-metrics-${startDate}-to-${endDate}.xlsx`);
    res.send(buffer);
  }

  @Get('dashboard-stats')
  @Roles(UserRole.ADMIN)
  async exportDashboardStats(@CurrentUser() user: any, @Res() res: Response) {
    const buffer = await this.exportService.exportDashboardStats(user.company_id);

    const today = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=dashboard-stats-${today}.xlsx`);
    res.send(buffer);
  }
}
