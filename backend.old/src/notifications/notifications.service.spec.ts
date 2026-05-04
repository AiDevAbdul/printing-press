import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './entities/notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: Repository<Notification>;

  const mockNotification = {
    id: 'notif-1',
    user_id: 'user-1',
    type: NotificationType.APPROVAL_REQUEST,
    title: 'New Approval Request',
    message: 'Stage Printing requires approval',
    link: '/qa-approval',
    is_read: false,
    created_at: new Date(),
  };

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createNotification({
        user_id: 'user-1',
        type: NotificationType.APPROVAL_REQUEST,
        title: 'New Approval Request',
        message: 'Stage Printing requires approval',
        link: '/qa-approval',
      });

      expect(mockNotificationRepository.create).toHaveBeenCalled();
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });

    it('should create notification with all fields', async () => {
      const createDto = {
        user_id: 'user-1',
        type: NotificationType.STAGE_APPROVED,
        title: 'Stage Approved',
        message: 'Your stage has been approved',
        link: '/production',
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      await service.createNotification(createDto);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(createDto),
      );
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications with pagination', async () => {
      mockNotificationRepository.findAndCount.mockResolvedValue([
        [mockNotification],
        1,
      ]);

      const result = await service.getUserNotifications('user-1', 10, 0);

      expect(result.notifications).toEqual([mockNotification]);
      expect(result.total).toBe(1);
      expect(mockNotificationRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        order: { created_at: 'DESC' },
        take: 10,
        skip: 0,
      });
    });

    it('should return empty array if no notifications', async () => {
      mockNotificationRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getUserNotifications('user-1', 10, 0);

      expect(result.notifications).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const readNotification = { ...mockNotification, read: true };

      mockNotificationRepository.update.mockResolvedValue({});
      mockNotificationRepository.findOne.mockResolvedValue(readNotification);

      const result = await service.markAsRead('notif-1');

      expect(result.read).toBe(true);
      expect(mockNotificationRepository.update).toHaveBeenCalled();
    });
  });

  describe('notifyApprovalRequest', () => {
    it('should create approval request notification', async () => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      await service.notifyApprovalRequest('qa-manager-1', 'JOB-001', 'Printing', 1);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'qa-manager-1',
          type: NotificationType.APPROVAL_REQUEST,
        }),
      );
    });
  });

  describe('notifyStageApproved', () => {
    it('should create stage approved notification', async () => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      await service.notifyStageApproved('operator-1', 'JOB-001', 'Printing', 1);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'operator-1',
          type: NotificationType.STAGE_APPROVED,
        }),
      );
    });
  });

  describe('notifyStageRejected', () => {
    it('should create stage rejected notification', async () => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      await service.notifyStageRejected(
        'operator-1',
        'JOB-001',
        'Printing',
        'Quality issues',
        1,
      );

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'operator-1',
          type: NotificationType.STAGE_REJECTED,
        }),
      );
    });
  });

  describe('notifyStageAssigned', () => {
    it('should create stage assigned notification', async () => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      await service.notifyStageAssigned('operator-1', 'JOB-001', 'Printing', 1);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'operator-1',
          type: NotificationType.STAGE_ASSIGNED,
        }),
      );
    });
  });

  describe('notifySubstituteAssigned', () => {
    it('should create substitute assigned notification', async () => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      await service.notifySubstituteAssigned('user-1', 'substitute-1', '2026-03-15');

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          type: NotificationType.SUBSTITUTE_ASSIGNED,
        }),
      );
    });
  });
});
