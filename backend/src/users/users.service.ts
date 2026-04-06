import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UpdateUserProfileDto, UpdateUserPermissionsDto } from './dto/user.dto';
import { PermissionsService } from './permissions.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private permissionsService: PermissionsService,
    private activityLogService: ActivityLogService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Get default permissions for role
    const defaultPermissions = await this.permissionsService.getDefaultPermissionsForRole(
      createUserDto.role,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
      system_access: createUserDto.system_access || defaultPermissions.system_access,
      partial_access: createUserDto.partial_access || defaultPermissions.partial_access,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map(user => this.toResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async getUserCompanies(userId: string): Promise<Company[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });

    if (!user) {
      return [];
    }

    // For now, return the user's company
    // In the future, this could return multiple companies if a user can access multiple
    return user.company ? [user.company] : [];
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      user.password_hash = updateUserDto.password;
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.is_active = false;
    await this.usersRepository.save(user);
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['substitute_user'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toResponseDto(user);
  }

  async updateUserProfile(
    userId: string,
    updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);
    const updatedUser = await this.usersRepository.save(user);

    // Log activity
    await this.activityLogService.logActivity(
      userId,
      'updated_profile',
      'user',
      userId,
      updateProfileDto,
    );

    return this.toResponseDto(updatedUser);
  }

  async updateUserPermissions(
    userId: string,
    updatePermissionsDto: UpdateUserPermissionsDto,
    adminId: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updatePermissionsDto.system_access) {
      user.system_access = updatePermissionsDto.system_access;
    }
    if (updatePermissionsDto.partial_access) {
      user.partial_access = updatePermissionsDto.partial_access;
    }

    const updatedUser = await this.usersRepository.save(user);

    // Log activity
    await this.activityLogService.logActivity(
      adminId,
      'updated_user_permissions',
      'user',
      userId,
      updatePermissionsDto,
    );

    return this.toResponseDto(updatedUser);
  }

  async getAllUsers(limit: number = 50, offset: number = 0) {
    const [users, total] = await this.usersRepository.findAndCount({
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      users: users.map(user => this.toResponseDto(user)),
      total,
    };
  }

  private toResponseDto(user: User): UserResponseDto {
    const { password_hash, ...result } = user;
    return result as UserResponseDto;
  }
}
