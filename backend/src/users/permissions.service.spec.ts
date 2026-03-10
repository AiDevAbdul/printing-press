import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionsService } from './permissions.service';
import { User, UserRole } from './entities/user.entity';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 'user-1',
    role: UserRole.OPERATOR,
    system_access: ['Dashboard', 'Production'],
    partial_access: {
      Dashboard: ['view'],
      Production: ['view'],
    },
  };

  const mockAdminUser = {
    id: 'admin-1',
    role: UserRole.ADMIN,
    system_access: ['Dashboard', 'Orders', 'Production', 'User Management'],
    partial_access: {},
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkSystemAccess', () => {
    it('should return true if user has system access', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.checkSystemAccess('user-1', 'Dashboard');

      expect(result).toBe(true);
    });

    it('should return false if user does not have system access', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.checkSystemAccess('user-1', 'Orders');

      expect(result).toBe(false);
    });

    it('should return true for admin user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdminUser);

      const result = await service.checkSystemAccess('admin-1', 'Orders');

      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.checkSystemAccess('invalid-id', 'Dashboard');

      expect(result).toBe(false);
    });
  });

  describe('checkPartialAccess', () => {
    it('should return true if user has action access', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.checkPartialAccess('user-1', 'Dashboard', 'view');

      expect(result).toBe(true);
    });

    it('should return false if user does not have action access', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.checkPartialAccess('user-1', 'Dashboard', 'create');

      expect(result).toBe(false);
    });

    it('should return true for admin user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdminUser);

      const result = await service.checkPartialAccess('admin-1', 'Orders', 'delete');

      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.checkPartialAccess('invalid-id', 'Dashboard', 'view');

      expect(result).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has both system and partial access', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.hasPermission('user-1', 'Dashboard', 'view');

      expect(result).toBe(true);
    });

    it('should return false if user lacks system access', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.hasPermission('user-1', 'Orders', 'view');

      expect(result).toBe(false);
    });

    it('should return true if only checking system access', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.hasPermission('user-1', 'Dashboard');

      expect(result).toBe(true);
    });

    it('should return true for admin user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdminUser);

      const result = await service.hasPermission('admin-1', 'Orders', 'delete');

      expect(result).toBe(true);
    });
  });
});
