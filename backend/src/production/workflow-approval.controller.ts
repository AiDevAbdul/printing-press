import { Controller, Get, Post, Param, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { WorkflowApprovalService } from './workflow-approval.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('production/workflow-approval')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowApprovalController {
  constructor(private workflowApprovalService: WorkflowApprovalService) {}

  @Get('stage/:stageId/status')
  async getStageApprovalStatus(@Param('stageId') stageId: number) {
    return this.workflowApprovalService.getStageApprovalStatus(stageId);
  }

  @Get('stage/:stageId/validate')
  async validateStageStart(@Param('stageId') stageId: number) {
    return this.workflowApprovalService.validateStageStart(stageId);
  }

  @Post('stage/:stageId/create-request')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  async createApprovalRequest(
    @Param('stageId') stageId: number,
    @Body() body: { job_id: string; stage_name: string; qa_manager_id: string },
    @Request() req,
  ) {
    if (!body.job_id || !body.stage_name || !body.qa_manager_id) {
      throw new BadRequestException('Missing required fields: job_id, stage_name, qa_manager_id');
    }

    await this.workflowApprovalService.createApprovalRequest(
      stageId,
      body.job_id,
      body.stage_name,
      body.qa_manager_id,
    );

    return { message: 'Approval request created' };
  }

  @Post('stage/:stageId/approve')
  @Roles(UserRole.QA_MANAGER, UserRole.ADMIN)
  async approveStage(
    @Param('stageId') stageId: number,
    @Body() body: { operator_id: string; job_id: string; stage_name: string },
    @Request() req,
  ) {
    if (!body.operator_id || !body.job_id || !body.stage_name) {
      throw new BadRequestException('Missing required fields: operator_id, job_id, stage_name');
    }

    await this.workflowApprovalService.approveStage(
      stageId,
      req.user.id,
      body.operator_id,
      body.job_id,
      body.stage_name,
    );

    return { message: 'Stage approved' };
  }

  @Post('stage/:stageId/reject')
  @Roles(UserRole.QA_MANAGER, UserRole.ADMIN)
  async rejectStage(
    @Param('stageId') stageId: number,
    @Body() body: { operator_id: string; job_id: string; stage_name: string; rejection_reason: string },
    @Request() req,
  ) {
    if (!body.operator_id || !body.job_id || !body.stage_name || !body.rejection_reason) {
      throw new BadRequestException(
        'Missing required fields: operator_id, job_id, stage_name, rejection_reason',
      );
    }

    await this.workflowApprovalService.rejectStage(
      stageId,
      req.user.id,
      body.operator_id,
      body.job_id,
      body.stage_name,
      body.rejection_reason,
    );

    return { message: 'Stage rejected' };
  }
}
