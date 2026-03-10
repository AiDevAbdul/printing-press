import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StageApproval, ApprovalStatus } from './entities/stage-approval.entity';
import { ApproveStageDto, RejectStageDto, CreateStageApprovalDto } from './dto/approval.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectRepository(StageApproval)
    private approvalRepository: Repository<StageApproval>,
    private notificationsService: NotificationsService,
    private activityLogService: ActivityLogService,
  ) {}

  async createApproval(
    createApprovalDto: CreateStageApprovalDto,
  ): Promise<StageApproval> {
    const approval = this.approvalRepository.create({
      inline_item_id: createApprovalDto.inline_item_id,
      job_id: createApprovalDto.job_id,
      stage_name: createApprovalDto.stage_name,
      status: ApprovalStatus.PENDING,
    });

    return this.approvalRepository.save(approval);
  }

  async getPendingApprovals(limit: number = 50, offset: number = 0, qaManagerId?: string) {
    const query = this.approvalRepository.createQueryBuilder('approval')
      .where('approval.status = :status', { status: ApprovalStatus.PENDING });

    if (qaManagerId) {
      query.andWhere('approval.created_by = :qaManagerId', { qaManagerId });
    }

    const [approvals, total] = await query
      .leftJoinAndSelect('approval.job', 'job')
      .leftJoinAndSelect('approval.approved_by_user', 'user')
      .orderBy('approval.created_at', 'ASC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { approvals, total, page: Math.floor(offset / limit) + 1, limit };
  }

  async getApprovalHistory(
    limit: number = 50,
    offset: number = 0,
    status?: ApprovalStatus,
    search?: string,
    qaManagerId?: string,
  ) {
    const query = this.approvalRepository.createQueryBuilder('approval');

    if (status) {
      query.where('approval.status = :status', { status });
    } else {
      query.where('approval.status IN (:...statuses)', {
        statuses: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED],
      });
    }

    if (qaManagerId) {
      query.andWhere('approval.approved_by = :qaManagerId', { qaManagerId });
    }

    if (search) {
      query.andWhere('approval.job_id LIKE :search OR approval.stage_name LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [approvals, total] = await query
      .leftJoinAndSelect('approval.job', 'job')
      .leftJoinAndSelect('approval.approved_by_user', 'user')
      .orderBy('approval.updated_at', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { approvals, total, page: Math.floor(offset / limit) + 1, limit };
  }

  async getApprovalStats(qaManagerId?: string) {
    const query = this.approvalRepository.createQueryBuilder('approval');

    if (qaManagerId) {
      query.where('approval.approved_by = :qaManagerId', { qaManagerId });
    }

    const total = await query.getCount();

    const pendingQuery = this.approvalRepository.createQueryBuilder('approval')
      .where('approval.status = :status', { status: ApprovalStatus.PENDING });
    if (qaManagerId) {
      pendingQuery.andWhere('approval.created_by = :qaManagerId', { qaManagerId });
    }
    const pending_count = await pendingQuery.getCount();

    const approvedQuery = this.approvalRepository.createQueryBuilder('approval')
      .where('approval.status = :status', { status: ApprovalStatus.APPROVED });
    if (qaManagerId) {
      approvedQuery.andWhere('approval.approved_by = :qaManagerId', { qaManagerId });
    }
    const approved_count = await approvedQuery.getCount();

    const rejectedQuery = this.approvalRepository.createQueryBuilder('approval')
      .where('approval.status = :status', { status: ApprovalStatus.REJECTED });
    if (qaManagerId) {
      rejectedQuery.andWhere('approval.approved_by = :qaManagerId', { qaManagerId });
    }
    const rejected_count = await rejectedQuery.getCount();

    return {
      pending_count,
      approved_count,
      rejected_count,
      total_approvals: total,
      approval_rate: total > 0 ? Math.round((approved_count / total) * 100) : 0,
      rejection_rate: total > 0 ? Math.round((rejected_count / total) * 100) : 0,
    };
  }

  async approveStage(
    approvalId: string,
    qaManagerId: string,
    approveDto: ApproveStageDto,
  ): Promise<StageApproval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId },
      relations: ['job'],
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Approval is not pending');
    }

    approval.status = ApprovalStatus.APPROVED;
    approval.approved_by = qaManagerId;
    approval.approved_at = new Date();
    approval.notes = approveDto.notes;

    const saved = await this.approvalRepository.save(approval);

    // Log activity
    await this.activityLogService.logActivity(
      qaManagerId,
      'approved_stage',
      'stage_approval',
      approvalId,
      {
        stage_name: approval.stage_name,
        job_id: approval.job_id,
        notes: approveDto.notes,
      },
    );

    return saved;
  }

  async rejectStage(
    approvalId: string,
    qaManagerId: string,
    rejectDto: RejectStageDto,
  ): Promise<StageApproval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId },
      relations: ['job'],
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Approval is not pending');
    }

    approval.status = ApprovalStatus.REJECTED;
    approval.approved_by = qaManagerId;
    approval.approved_at = new Date();
    approval.rejection_reason = rejectDto.rejection_reason;
    approval.notes = rejectDto.notes;

    const saved = await this.approvalRepository.save(approval);

    // Log activity
    await this.activityLogService.logActivity(
      qaManagerId,
      'rejected_stage',
      'stage_approval',
      approvalId,
      {
        stage_name: approval.stage_name,
        job_id: approval.job_id,
        rejection_reason: rejectDto.rejection_reason,
        notes: rejectDto.notes,
      },
    );

    return saved;
  }

  async getApprovalByStageId(stageId: string): Promise<StageApproval> {
    const numericStageId = parseInt(stageId, 10);
    return this.approvalRepository.findOne({
      where: { inline_item_id: numericStageId },
      relations: ['approved_by_user', 'job'],
    });
  }

  async getApprovalsByJobId(jobId: string): Promise<StageApproval[]> {
    return this.approvalRepository.find({
      where: { job_id: jobId },
      order: { created_at: 'ASC' },
      relations: ['approved_by_user'],
    });
  }

  async validateStageStart(stageId: string): Promise<boolean> {
    const numericStageId = parseInt(stageId, 10);
    const approval = await this.approvalRepository.findOne({
      where: { inline_item_id: numericStageId },
    });

    if (!approval) {
      return false;
    }

    return approval.status === ApprovalStatus.APPROVED;
  }
}
