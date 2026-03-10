import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalsService } from './approvals.service';
import { StageApproval, ApprovalStatus } from './entities/stage-approval.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ApprovalsService', () => {
  let service: ApprovalsService;
  let approvalRepository: Repository<StageApproval>;
  let notificationsService: NotificationsService;
  let activityLogService: ActivityLogService;

  const mockApproval = {
    id: 'approval-1',
    inline_item_id: 1,
    job_id: 'job-1',
    stage_name: 'Printing',
    status: ApprovalStatus.PENDING,
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    notes: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockApprovalRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
    notifyApprovalRequest: jest.fn(),
    notifyStageApproved: jest.fn(),
    notifyStageRejected: jest.fn(),
  };

  const mockActivityLogService = {
    logActivity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalsService,
        {
          provide: getRepositoryToken(StageApproval),
          useValue: mockApprovalRepository,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: ActivityLogService,
          useValue: mockActivityLogService,
        },
      ],
    }).compile();

    service = module.get<ApprovalsService>(ApprovalsService);
    approvalRepository = module.get<Repository<StageApproval>>(
      getRepositoryToken(StageApproval),
    );
    notificationsService = module.get<NotificationsService>(NotificationsService);
    activityLogService = module.get<ActivityLogService>(ActivityLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createApproval', () => {
    it('should create a new approval', async () => {
      const createDto = {
        inline_item_id: 1,
        job_id: 'job-1',
        stage_name: 'Printing',
      };

      mockApprovalRepository.create.mockReturnValue(mockApproval);
      mockApprovalRepository.save.mockResolvedValue(mockApproval);

      const result = await service.createApproval(createDto);

      expect(mockApprovalRepository.create).toHaveBeenCalledWith({
        inline_item_id: createDto.inline_item_id,
        job_id: createDto.job_id,
        stage_name: createDto.stage_name,
        status: ApprovalStatus.PENDING,
      });
      expect(mockApprovalRepository.save).toHaveBeenCalledWith(mockApproval);
      expect(result).toEqual(mockApproval);
    });
  });

  describe('getPendingApprovals', () => {
    it('should return pending approvals with pagination', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockApproval], 1]),
      };

      mockApprovalRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPendingApprovals(10, 0);

      expect(result.approvals).toEqual([mockApproval]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by QA manager ID', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockApproval], 1]),
      };

      mockApprovalRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getPendingApprovals(10, 0, 'qa-manager-1');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('approveStage', () => {
    it('should approve a pending stage', async () => {
      const approvedApproval = {
        ...mockApproval,
        status: ApprovalStatus.APPROVED,
        approved_by: 'qa-manager-1',
        approved_at: new Date(),
        notes: 'Looks good',
      };

      mockApprovalRepository.findOne.mockResolvedValue(mockApproval);
      mockApprovalRepository.save.mockResolvedValue(approvedApproval);

      const result = await service.approveStage('approval-1', 'qa-manager-1', {
        notes: 'Looks good',
      });

      expect(result.status).toBe(ApprovalStatus.APPROVED);
      expect(result.approved_by).toBe('qa-manager-1');
      expect(mockActivityLogService.logActivity).toHaveBeenCalled();
    });

    it('should throw error if approval not found', async () => {
      mockApprovalRepository.findOne.mockResolvedValue(null);

      await expect(
        service.approveStage('invalid-id', 'qa-manager-1', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if approval is not pending', async () => {
      const approvedApproval = {
        ...mockApproval,
        status: ApprovalStatus.APPROVED,
      };

      mockApprovalRepository.findOne.mockResolvedValue(approvedApproval);

      await expect(
        service.approveStage('approval-1', 'qa-manager-1', {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectStage', () => {
    it('should reject a pending stage', async () => {
      const pendingApproval = {
        ...mockApproval,
        status: ApprovalStatus.PENDING,
      };

      const rejectedApproval = {
        ...pendingApproval,
        status: ApprovalStatus.REJECTED,
        approved_by: 'qa-manager-1',
        approved_at: new Date(),
        rejection_reason: 'Quality issues',
      };

      mockApprovalRepository.findOne.mockResolvedValue(pendingApproval);
      mockApprovalRepository.save.mockResolvedValue(rejectedApproval);

      const result = await service.rejectStage('approval-1', 'qa-manager-1', {
        rejection_reason: 'Quality issues',
      });

      expect(result.status).toBe(ApprovalStatus.REJECTED);
      expect(result.rejection_reason).toBe('Quality issues');
      expect(mockActivityLogService.logActivity).toHaveBeenCalled();
    });

    it('should throw error if approval not found', async () => {
      mockApprovalRepository.findOne.mockResolvedValue(null);

      await expect(
        service.rejectStage('invalid-id', 'qa-manager-1', {
          rejection_reason: 'Test',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if approval is not pending', async () => {
      const rejectedApproval = {
        ...mockApproval,
        status: ApprovalStatus.REJECTED,
      };

      mockApprovalRepository.findOne.mockResolvedValue(rejectedApproval);

      await expect(
        service.rejectStage('approval-1', 'qa-manager-1', {
          rejection_reason: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getApprovalStats', () => {
    it('should return approval statistics', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
      };

      mockApprovalRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getApprovalStats();

      expect(result).toHaveProperty('pending_count');
      expect(result).toHaveProperty('approved_count');
      expect(result).toHaveProperty('rejected_count');
      expect(result).toHaveProperty('total_approvals');
      expect(result).toHaveProperty('approval_rate');
    });
  });

  describe('validateStageStart', () => {
    it('should return true if stage is approved', async () => {
      const approvedApproval = {
        ...mockApproval,
        status: ApprovalStatus.APPROVED,
      };

      mockApprovalRepository.findOne.mockResolvedValue(approvedApproval);

      const result = await service.validateStageStart('1');

      expect(result).toBe(true);
    });

    it('should return false if stage is pending', async () => {
      const pendingApproval = {
        ...mockApproval,
        status: ApprovalStatus.PENDING,
      };

      mockApprovalRepository.findOne.mockResolvedValue(pendingApproval);

      const result = await service.validateStageStart('1');

      expect(result).toBe(false);
    });

    it('should return false if approval not found', async () => {
      mockApprovalRepository.findOne.mockResolvedValue(null);

      const result = await service.validateStageStart('1');

      expect(result).toBe(false);
    });
  });
});
