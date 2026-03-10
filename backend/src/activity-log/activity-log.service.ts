import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivityLog } from './entities/user-activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(UserActivityLog)
    private activityLogRepository: Repository<UserActivityLog>,
  ) {}

  async logActivity(
    userId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserActivityLog> {
    const log = this.activityLogRepository.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return this.activityLogRepository.save(log);
  }

  async getUserActivityLog(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ logs: UserActivityLog[]; total: number }> {
    const [logs, total] = await this.activityLogRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { logs, total };
  }

  async getActivityLogByEntity(
    entityType: string,
    entityId: string,
    limit: number = 50,
  ): Promise<UserActivityLog[]> {
    return this.activityLogRepository.find({
      where: { entity_type: entityType, entity_id: entityId },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  async getAllActivityLogs(
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ logs: UserActivityLog[]; total: number }> {
    const [logs, total] = await this.activityLogRepository.findAndCount({
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['user'],
    });

    return { logs, total };
  }
}
