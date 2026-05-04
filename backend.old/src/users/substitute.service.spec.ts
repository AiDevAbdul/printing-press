import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubstituteService } from './substitute.service';
import { User } from './entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

describe('SubstituteService', () => {
  let service: SubstituteService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 'user-1',
    email: 'user@test.com',
    full_name: 'Test User',
    substitute_user_id: null,
    substitute_start_date: null,
    substitute_end_date: null,
    substitute_reason: null,
  };

  const mockSubstituteUser = {
    id: 'substitute-1',
    email: 'substitute@test.com',
    full_name: 'Substitute User',
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockNotificationsService = {
    notifySubstituteAssigned: jest.fn(),
  };

  const mockActivityLogService = {
    logActivity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubstituteService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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

    service = module.get<SubstituteService>(SubstituteService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setSubstituteUser', () => {
    it('should set a substitute user with valid dates', async () => {
      const startDate = new Date('2026-03-15');
      const endDate = new Date('2026-03-20');

      const setSubstituteDto = {
        substitute_user_id: 'substitute-1',
        substitute_start_date: startDate.toISOString().split('T')[0],
        substitute_end_date: endDate.toISOString().split('T')[0],
        substitute_reason: 'Leave',
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockSubstituteUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.setSubstituteUser('user-1', setSubstituteDto);

      expect(result.substitute_user).toEqual(mockSubstituteUser);
      expect(result.substitute_start_date).toEqual(startDate);
      expect(result.substitute_end_date).toEqual(endDate);
    });

    it('should throw error if start date is after end date', async () => {
      const startDate = new Date('2026-03-20');
      const endDate = new Date('2026-03-15');

      const setSubstituteDto = {
        substitute_user_id: 'substitute-1',
        substitute_start_date: startDate.toISOString().split('T')[0],
        substitute_end_date: endDate.toISOString().split('T')[0],
        substitute_reason: 'Leave',
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockSubstituteUser);

      await expect(
        service.setSubstituteUser('user-1', setSubstituteDto),
      ).rejects.toThrow('Start date must be before end date');
    });

    it('should throw error if user not found', async () => {
      const setSubstituteDto = {
        substitute_user_id: 'substitute-1',
        substitute_start_date: '2026-03-15',
        substitute_end_date: '2026-03-20',
        substitute_reason: 'Leave',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.setSubstituteUser('invalid-id', setSubstituteDto),
      ).rejects.toThrow();
    });
  });

  describe('removeSubstituteUser', () => {
    it('should remove substitute user', async () => {
      const userWithSubstitute = {
        ...mockUser,
        substitute_user: mockSubstituteUser,
        substitute_start_date: new Date(),
        substitute_end_date: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(userWithSubstitute);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.removeSubstituteUser('user-1');

      expect(result.substitute_user).toBeNull();
      expect(result.substitute_start_date).toBeNull();
      expect(result.substitute_end_date).toBeNull();
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.removeSubstituteUser('invalid-id')).rejects.toThrow();
    });
  });

  describe('getActiveSubstitute', () => {
    it('should return substitute user if active', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 86400000); // Yesterday
      const endDate = new Date(now.getTime() + 86400000); // Tomorrow

      const userWithActiveSubstitute = {
        ...mockUser,
        substitute_user: mockSubstituteUser,
        substitute_start_date: startDate,
        substitute_end_date: endDate,
      };

      mockUserRepository.findOne.mockResolvedValue(userWithActiveSubstitute);

      const result = await service.getActiveSubstitute('user-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('substitute-1');
    });

    it('should return null if substitute not active', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() + 86400000); // Tomorrow
      const endDate = new Date(now.getTime() + 172800000); // Day after tomorrow

      const userWithInactiveSubstitute = {
        ...mockUser,
        substitute_user: mockSubstituteUser,
        substitute_start_date: startDate,
        substitute_end_date: endDate,
      };

      mockUserRepository.findOne.mockResolvedValue(userWithInactiveSubstitute);

      const result = await service.getActiveSubstitute('user-1');

      expect(result).toBeNull();
    });

    it('should return null if no substitute assigned', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getActiveSubstitute('user-1');

      expect(result).toBeNull();
    });
  });

  describe('cleanupExpiredSubstitutes', () => {
    it('should remove expired substitutes', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.cleanupExpiredSubstitutes();

      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });
});
