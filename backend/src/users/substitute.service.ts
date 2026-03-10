import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from './entities/user.entity';
import { SetSubstituteUserDto } from './dto/user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class SubstituteService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
    private activityLogService: ActivityLogService,
  ) {}

  async setSubstituteUser(
    userId: string,
    setSubstituteDto: SetSubstituteUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const substituteUser = await this.userRepository.findOne({
      where: { id: setSubstituteDto.substitute_user_id },
    });
    if (!substituteUser) {
      throw new NotFoundException('Substitute user not found');
    }

    const startDate = new Date(setSubstituteDto.substitute_start_date);
    const endDate = new Date(setSubstituteDto.substitute_end_date);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Update using raw column names since TypeORM doesn't have the FK property
    await this.userRepository.update(userId, {
      substitute_start_date: startDate,
      substitute_end_date: endDate,
      substitute_reason: setSubstituteDto.substitute_reason,
    });

    // Manually set the relationship for the returned object
    user.substitute_user = substituteUser;
    user.substitute_start_date = startDate;
    user.substitute_end_date = endDate;
    user.substitute_reason = setSubstituteDto.substitute_reason;

    // Notify substitute user
    await this.notificationsService.notifySubstituteAssigned(
      setSubstituteDto.substitute_user_id,
      user.full_name,
      endDate.toISOString().split('T')[0],
    );

    // Log activity
    await this.activityLogService.logActivity(
      userId,
      'set_substitute_user',
      'user',
      userId,
      {
        substitute_user_id: setSubstituteDto.substitute_user_id,
        substitute_user_name: substituteUser.full_name,
        start_date: startDate,
        end_date: endDate,
        reason: setSubstituteDto.substitute_reason,
      },
    );

    return user;
  }

  async removeSubstituteUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(userId, {
      substitute_start_date: null,
      substitute_end_date: null,
      substitute_reason: null,
    });

    user.substitute_user = null;
    user.substitute_start_date = null;
    user.substitute_end_date = null;
    user.substitute_reason = null;

    // Log activity
    await this.activityLogService.logActivity(
      userId,
      'remove_substitute_user',
      'user',
      userId,
    );

    return user;
  }

  async getActiveSubstitute(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['substitute_user'],
    });

    if (!user || !user.substitute_user) {
      return null;
    }

    const now = new Date();
    if (
      user.substitute_start_date <= now &&
      now <= user.substitute_end_date
    ) {
      return user.substitute_user;
    }

    return null;
  }

  async getSubstituteUsers(userId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { substitute_user: { id: userId } },
    });
  }

  async cleanupExpiredSubstitutes(): Promise<number> {
    const now = new Date();
    const result = await this.userRepository.update(
      {
        substitute_end_date: LessThan(now),
      },
      {
        substitute_start_date: null,
        substitute_end_date: null,
        substitute_reason: null,
      },
    );

    return result.affected || 0;
  }
}

