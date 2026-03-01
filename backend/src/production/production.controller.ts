import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductionService } from './production.service';
import { CreateProductionJobDto, UpdateProductionJobDto, UpdateProductionJobStatusDto, StartStageDto, CompleteStageDto, QueryProductionJobsDto } from './dto/production-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductionJobStatus } from './entities/production-job.entity';

@Controller('production')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('jobs')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  create(@Body() createProductionJobDto: CreateProductionJobDto) {
    return this.productionService.create(createProductionJobDto);
  }

  @Get('jobs')
  findAll(@Query() queryDto: QueryProductionJobsDto) {
    return this.productionService.findAllWithFilters(queryDto);
  }

  @Get('queue')
  getQueuedJobs() {
    return this.productionService.getQueuedJobs();
  }

  @Get('jobs/:id')
  findOne(@Param('id') id: string) {
    return this.productionService.findOne(id);
  }

  @Patch('jobs/:id')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  update(@Param('id') id: string, @Body() updateProductionJobDto: UpdateProductionJobDto) {
    return this.productionService.update(id, updateProductionJobDto);
  }

  @Patch('jobs/:id/status')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateProductionJobStatusDto) {
    return this.productionService.updateStatus(id, updateStatusDto);
  }

  @Post('jobs/:id/start')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  startJob(@Param('id') id: string) {
    return this.productionService.startJob(id);
  }

  @Post('jobs/:id/complete')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  completeJob(@Param('id') id: string) {
    return this.productionService.completeJob(id);
  }

  @Post('jobs/:id/start-stage')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  startStage(@Param('id') id: string, @Body() startStageDto: StartStageDto) {
    return this.productionService.startStage(id, startStageDto);
  }

  @Post('jobs/:id/complete-stage')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  completeStage(@Param('id') id: string, @Body() completeStageDto: CompleteStageDto) {
    return this.productionService.completeStage(id, completeStageDto);
  }

  @Get('jobs/:id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.productionService.getStageTimeline(id);
  }

  @Get('schedule')
  getSchedule(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.productionService.getSchedule(start, end);
  }
}
