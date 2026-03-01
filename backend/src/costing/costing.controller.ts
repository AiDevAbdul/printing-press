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
  createJobCost(@Body() createJobCostDto: CreateJobCostDto) {
    return this.costingService.createJobCost(createJobCostDto);
  }

  @Get('jobs/:jobId')
  getJobCosts(@Param('jobId') jobId: string) {
    return this.costingService.getJobCosts(jobId);
  }

  @Get('jobs/:jobId/summary')
  getJobCostSummary(@Param('jobId') jobId: string) {
    return this.costingService.getJobCostSummary(jobId);
  }

  @Patch('costs/:id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  updateJobCost(@Param('id') id: string, @Body() updateJobCostDto: UpdateJobCostDto) {
    return this.costingService.updateJobCost(id, updateJobCostDto);
  }

  @Delete('costs/:id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  deleteJobCost(@Param('id') id: string) {
    return this.costingService.deleteJobCost(id);
  }

  // Auto-Calculation Endpoints
  @Post('calculate')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.PLANNER)
  calculateJobCost(@Body() calculateCostDto: CalculateCostDto) {
    return this.costingService.calculateJobCost(calculateCostDto);
  }

  @Post('calculate/save')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS, UserRole.PLANNER)
  saveCalculatedCost(@Body() calculateCostDto: CalculateCostDto) {
    return this.costingService.saveCalculatedCost(calculateCostDto);
  }

  // Configuration Endpoints
  @Get('config')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  getCostingConfiguration() {
    return this.costingService.getCostingConfiguration();
  }

  @Patch('config')
  @Roles(UserRole.ADMIN)
  updateCostingConfiguration(@Body() updateDto: UpdateCostingConfigDto) {
    return this.costingService.updateCostingConfiguration(updateDto);
  }
}

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly costingService: CostingService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.costingService.createInvoice(createInvoiceDto, user.id);
  }

  @Get()
  findAll(
    @Query('status') status?: InvoiceStatus,
    @Query('customerId') customerId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.costingService.findAllInvoices(status, customerId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costingService.findOneInvoice(id);
  }

  @Get(':id/items')
  getInvoiceItems(@Param('id') id: string) {
    return this.costingService.getInvoiceItems(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.costingService.updateInvoice(id, updateInvoiceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  remove(@Param('id') id: string) {
    return this.costingService.deleteInvoice(id);
  }

  @Post(':id/payment')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTS)
  recordPayment(@Param('id') id: string, @Body() recordPaymentDto: RecordPaymentDto) {
    return this.costingService.recordPayment(id, recordPaymentDto);
  }
}
