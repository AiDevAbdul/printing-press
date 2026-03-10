import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApproveStageDto, RejectStageDto } from './dto/approval.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('api/approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Get('pending')
  @Roles(UserRole.QA_MANAGER, UserRole.ADMIN)
  async getPendingApprovals(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Request() req,
  ) {
    const offset = (page - 1) * limit;
    const qaManagerId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
    return this.approvalsService.getPendingApprovals(limit, offset, qaManagerId);
  }

  @Get('history')
  @Roles(UserRole.QA_MANAGER, UserRole.ADMIN)
  async getApprovalHistory(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const offset = (page - 1) * limit;
    const qaManagerId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
    return this.approvalsService.getApprovalHistory(limit, offset, status as any, search, qaManagerId);
  }

  @Get('stats')
  @Roles(UserRole.QA_MANAGER, UserRole.ADMIN)
  async getApprovalStats(@Request() req) {
    const qaManagerId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
    return this.approvalsService.getApprovalStats(qaManagerId);
  }

  @Post(':id/approve')
  @Roles(UserRole.QA_MANAGER, UserRole.ADMIN)
  async approveStage(
    @Param('id') approvalId: string,
    @Body() approveDto: ApproveStageDto,
    @Request() req,
  ) {
    return this.approvalsService.approveStage(approvalId, req.user.id, approveDto);
  }

  @Post(':id/reject')
  @Roles(UserRole.QA_MANAGER, UserRole.ADMIN)
  async rejectStage(
    @Param('id') approvalId: string,
    @Body() rejectDto: RejectStageDto,
    @Request() req,
  ) {
    return this.approvalsService.rejectStage(approvalId, req.user.id, rejectDto);
  }

  @Get('stage/:stageId')
  async getApprovalByStageId(@Param('stageId') stageId: string) {
    return this.approvalsService.getApprovalByStageId(stageId);
  }

  @Get('job/:jobId')
  async getApprovalsByJobId(@Param('jobId') jobId: string) {
    return this.approvalsService.getApprovalsByJobId(jobId);
  }
}
