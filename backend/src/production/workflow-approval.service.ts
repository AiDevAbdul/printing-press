import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionWorkflowStage } from './entities/production-workflow-stage.entity';
import { ApprovalsService } from '../approvals/approvals.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { SubstituteService } from '../users/substitute.service';
import { CreateStageApprovalDto } from '../approvals/dto/approval.dto';

@Injectable()
export class WorkflowApprovalService {
  constructor(
    @InjectRepository(ProductionWorkflowStage)
    private workflowStagesRepository: Repository<ProductionWorkflowStage>,
    private approvalsService: ApprovalsService,
    private notificationsService: NotificationsService,
    private activityLogService: ActivityLogService,
    private substituteService: SubstituteService,
  ) {}

  /**
   * Create QA approval request for a stage
   * Called when a stage is ready to start
   */
  async createApprovalRequest(
    stageId: number,
    jobId: string,
    stageName: string,
    qaManagerId: string,
  ): Promise<void> {
    // Check if approval already exists
    const existingApproval = await this.approvalsService.getApprovalByStageId(stageId.toString());
    if (existingApproval) {
      return; // Approval already exists
    }

    // Create approval request
    const approvalDto: CreateStageApprovalDto = {
      inline_item_id: stageId,
      job_id: jobId,
      stage_name: stageName,
    };

    await this.approvalsService.createApproval(approvalDto);

    // Check if QA manager has a substitute
    const substitute = await this.substituteService.getActiveSubstitute(qaManagerId);
    const targetQAId = substitute ? substitute.id : qaManagerId;

    // Notify QA manager (or substitute)
    // Note: jobId is UUID string, but notification expects number for link generation
    // We'll use 0 as placeholder since the link is just for reference
    await this.notificationsService.notifyApprovalRequest(
      targetQAId,
      jobId,
      stageName,
      0, // Placeholder - actual jobId is in the link message
    );

    // Log activity
    await this.activityLogService.logActivity(
      qaManagerId,
      'approval_request_created',
      'stage',
      stageId.toString(),
      {
        stage_name: stageName,
        job_id: jobId,
      },
    );
  }

  /**
   * Check if stage has QA approval
   * Returns true if approval is not required or if approved
   */
  async isStageApproved(stageId: number): Promise<boolean> {
    const stage = await this.workflowStagesRepository.findOne({
      where: { id: stageId },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    // If approval not required, consider it approved
    if (!stage.qa_approval_required) {
      return true;
    }

    // Check approval status
    return stage.qa_approval_status === 'approved';
  }

  /**
   * Check if stage approval is pending
   */
  async isApprovalPending(stageId: number): Promise<boolean> {
    const stage = await this.workflowStagesRepository.findOne({
      where: { id: stageId },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    return stage.qa_approval_status === 'pending';
  }

  /**
   * Get approval rejection reason if rejected
   */
  async getRejectionReason(stageId: number): Promise<string | null> {
    const stage = await this.workflowStagesRepository.findOne({
      where: { id: stageId },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    return stage.qa_rejection_reason || null;
  }

  /**
   * Mark stage as approved by QA manager
   */
  async approveStage(
    stageId: number,
    qaManagerId: string,
    operatorId: string,
    jobId: string,
    stageName: string,
  ): Promise<void> {
    const stage = await this.workflowStagesRepository.findOne({
      where: { id: stageId },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    // Update stage approval status
    stage.qa_approval_status = 'approved';
    stage.qa_approved_by = qaManagerId;
    stage.qa_approved_at = new Date();
    stage.qa_rejection_reason = null;

    await this.workflowStagesRepository.save(stage);

    // Check if operator has a substitute
    const substitute = await this.substituteService.getActiveSubstitute(operatorId);
    const targetOperatorId = substitute ? substitute.id : operatorId;

    // Notify operator (or substitute)
    await this.notificationsService.notifyStageApproved(
      targetOperatorId,
      jobId,
      stageName,
      0, // Placeholder - actual jobId is UUID
    );

    // Log activity
    await this.activityLogService.logActivity(
      qaManagerId,
      'stage_approved',
      'stage',
      stageId.toString(),
      {
        stage_name: stageName,
        job_id: jobId,
        operator_id: operatorId,
      },
    );
  }

  /**
   * Mark stage as rejected by QA manager
   */
  async rejectStage(
    stageId: number,
    qaManagerId: string,
    operatorId: string,
    jobId: string,
    stageName: string,
    rejectionReason: string,
  ): Promise<void> {
    const stage = await this.workflowStagesRepository.findOne({
      where: { id: stageId },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    // Update stage approval status
    stage.qa_approval_status = 'rejected';
    stage.qa_approved_by = qaManagerId;
    stage.qa_approved_at = new Date();
    stage.qa_rejection_reason = rejectionReason;

    await this.workflowStagesRepository.save(stage);

    // Check if operator has a substitute
    const substitute = await this.substituteService.getActiveSubstitute(operatorId);
    const targetOperatorId = substitute ? substitute.id : operatorId;

    // Notify operator (or substitute)
    await this.notificationsService.notifyStageRejected(
      targetOperatorId,
      jobId,
      stageName,
      rejectionReason,
      0, // Placeholder - actual jobId is UUID
    );

    // Log activity
    await this.activityLogService.logActivity(
      qaManagerId,
      'stage_rejected',
      'stage',
      stageId.toString(),
      {
        stage_name: stageName,
        job_id: jobId,
        operator_id: operatorId,
        rejection_reason: rejectionReason,
      },
    );
  }

  /**
   * Validate stage can be started (check QA approval)
   */
  async validateStageStart(stageId: number): Promise<{ valid: boolean; reason?: string }> {
    const stage = await this.workflowStagesRepository.findOne({
      where: { id: stageId },
    });

    if (!stage) {
      return { valid: false, reason: 'Stage not found' };
    }

    // If approval not required, allow start
    if (!stage.qa_approval_required) {
      return { valid: true };
    }

    // Check approval status
    if (stage.qa_approval_status === 'pending') {
      return { valid: false, reason: 'Waiting for QA approval' };
    }

    if (stage.qa_approval_status === 'rejected') {
      return {
        valid: false,
        reason: `Stage rejected by QA: ${stage.qa_rejection_reason}`,
      };
    }

    if (stage.qa_approval_status === 'approved') {
      return { valid: true };
    }

    return { valid: false, reason: 'Invalid approval status' };
  }

  /**
   * Get stage approval status
   */
  async getStageApprovalStatus(stageId: number): Promise<{
    required: boolean;
    status: string;
    approved_by?: string;
    approved_at?: Date;
    rejection_reason?: string;
  }> {
    const stage = await this.workflowStagesRepository.findOne({
      where: { id: stageId },
      relations: ['qa_approved_by_user'],
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    return {
      required: stage.qa_approval_required,
      status: stage.qa_approval_status,
      approved_by: stage.qa_approved_by,
      approved_at: stage.qa_approved_at,
      rejection_reason: stage.qa_rejection_reason,
    };
  }
}
