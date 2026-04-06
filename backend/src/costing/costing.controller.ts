import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CostingService } from './costing.service';
import { CreateJobCostDto, UpdateJobCostDto, CalculateCostDto, UpdateCostingConfigDto } from './dto/job-cost.dto';
import { CreateInvoiceDto, UpdateInvoiceDto, RecordPaymentDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { InvoiceStatus } from './entities/invoice.entity';

@Controller('costing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  // Job Costing Endpoints
  @Post('jobs/:jobId/costs')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.PLANNER)
  createJobCost(@Body() createJobCostDto: CreateJobCostDto, @CurrentUser() user: any) {
    return this.costingService.createJobCost(createJobCostDto, user.company_id);
  }

  @Get('jobs/:jobId')
  getJobCosts(@Param('jobId') jobId: string, @CurrentUser() user: any) {
    return this.costingService.getJobCosts(jobId, user.company_id);
  }

  @Get('jobs/:jobId/summary')
  getJobCostSummary(@Param('jobId') jobId: string, @CurrentUser() user: any) {
    return this.costingService.getJobCostSummary(jobId, user.company_id);
  }

  @Patch('costs/:id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  updateJobCost(@Param('id') id: string, @Body() updateJobCostDto: UpdateJobCostDto, @CurrentUser() user: any) {
    return this.costingService.updateJobCost(id, user.company_id, updateJobCostDto);
  }

  @Delete('costs/:id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  deleteJobCost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costingService.deleteJobCost(id, user.company_id);
  }

  // Auto-Calculation Endpoints
  @Post('calculate')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.PLANNER)
  calculateJobCost(@Body() calculateCostDto: CalculateCostDto, @CurrentUser() user: any) {
    return this.costingService.calculateJobCost(calculateCostDto, user.company_id);
  }

  @Post('calculate/save')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.PLANNER)
  saveCalculatedCost(@Body() calculateCostDto: CalculateCostDto, @CurrentUser() user: any) {
    return this.costingService.saveCalculatedCost(calculateCostDto, user.company_id);
  }

  // Configuration Endpoints
  @Get('config')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  getCostingConfiguration(@CurrentUser() user: any) {
    return this.costingService.getCostingConfiguration(user.company_id);
  }

  @Patch('config')
  @Roles(UserRole.ADMIN)
  updateCostingConfiguration(@Body() updateDto: UpdateCostingConfigDto, @CurrentUser() user: any) {
    return this.costingService.updateCostingConfiguration(user.company_id, updateDto);
  }
}

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly costingService: CostingService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.costingService.createInvoice(createInvoiceDto, user.id, user.company_id);
  }

  @Get()
  findAll(
    @Query('status') status?: InvoiceStatus,
    @Query('customerId') customerId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: any,
  ) {
    return this.costingService.findAllInvoices(user.company_id, status, customerId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costingService.findOneInvoice(id, user.company_id);
  }

  @Get(':id/items')
  getInvoiceItems(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costingService.getInvoiceItems(id, user.company_id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @CurrentUser() user: any) {
    return this.costingService.updateInvoice(id, user.company_id, updateInvoiceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costingService.deleteInvoice(id, user.company_id);
  }

  @Post(':id/payment')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  recordPayment(@Param('id') id: string, @Body() recordPaymentDto: RecordPaymentDto, @CurrentUser() user: any) {
    return this.costingService.recordPayment(id, user.company_id, recordPaymentDto);
  }

  @Patch(':id/mark-paid')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  markAsPaid(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costingService.markInvoiceAsPaid(id, user.company_id);
  }
}
