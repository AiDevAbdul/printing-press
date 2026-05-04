import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { notifications, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user_id: userId, read: false },
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    await this.notificationRepository.update(notificationId, { read: true });
    return this.notificationRepository.findOne({ where: { id: notificationId } });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, read: false },
      { read: true },
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationRepository.delete(notificationId);
  }

  async deleteUserNotifications(userId: string): Promise<void> {
    await this.notificationRepository.delete({ user_id: userId });
  }

  async notifyApprovalRequest(
    qaManagerId: string,
    jobNumber: string,
    stageName: string,
    jobId: number,
  ): Promise<Notification> {
    return this.createNotification({
      user_id: qaManagerId,
      type: NotificationType.APPROVAL_REQUEST,
      title: `Approval Required: ${stageName}`,
      message: `Stage "${stageName}" in Job ${jobNumber} is ready for QA approval.`,
      link: `/production/jobs/${jobId}`,
    });
  }

  async notifyStageApproved(
    operatorId: string,
    jobNumber: string,
    stageName: string,
    jobId: number,
  ): Promise<Notification> {
    return this.createNotification({
      user_id: operatorId,
      type: NotificationType.STAGE_APPROVED,
      title: `Stage Approved: ${stageName}`,
      message: `Stage "${stageName}" in Job ${jobNumber} has been approved. You can start now.`,
      link: `/production/jobs/${jobId}`,
    });
  }

  async notifyStageRejected(
    operatorId: string,
    jobNumber: string,
    stageName: string,
    reason: string,
    jobId: number,
  ): Promise<Notification> {
    return this.createNotification({
      user_id: operatorId,
      type: NotificationType.STAGE_REJECTED,
      title: `Stage Rejected: ${stageName}`,
      message: `Stage "${stageName}" in Job ${jobNumber} was rejected. Reason: ${reason}`,
      link: `/production/jobs/${jobId}`,
    });
  }

  async notifyStageAssigned(
    operatorId: string,
    jobNumber: string,
    stageName: string,
    jobId: number,
  ): Promise<Notification> {
    return this.createNotification({
      user_id: operatorId,
      type: NotificationType.STAGE_ASSIGNED,
      title: `Stage Assigned: ${stageName}`,
      message: `You have been assigned to Stage "${stageName}" in Job ${jobNumber}.`,
      link: `/production/jobs/${jobId}`,
    });
  }

  async notifySubstituteAssigned(
    substituteUserId: string,
    originalUserName: string,
    endDate: string,
  ): Promise<Notification> {
    return this.createNotification({
      user_id: substituteUserId,
      type: NotificationType.SUBSTITUTE_ASSIGNED,
      title: `You are now acting as ${originalUserName}`,
      message: `You are now acting as ${originalUserName} until ${endDate}. All approvals and notifications will be routed to you.`,
    });
  }
}
