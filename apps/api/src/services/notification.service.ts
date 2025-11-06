import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { NotificationType, UserRole } from '@e2o/types';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export class NotificationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Create notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        link,
        metadata,
      });

      await notification.save();
      logger.info({ userId, type, title }, 'Notification created');
    } catch (error) {
      logger.error({ error, userId, type }, 'Failed to create notification');
    }
  }

  /**
   * Notify all platform admins
   */
  async notifyPlatformAdmins(
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ): Promise<void> {
    const admins = await User.find({
      role: UserRole.PLATFORM_ADMIN,
      isActive: true,
    });

    for (const admin of admins) {
      await this.createNotification(
        admin._id.toString(),
        type,
        title,
        message,
        link
      );
    }
  }

  /**
   * Notify organization admins
   */
  async notifyOrgAdmins(
    organizationId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ): Promise<void> {
    const orgAdmins = await User.find({
      organizationId,
      role: UserRole.ORG_ADMIN,
      isActive: true,
    });

    for (const admin of orgAdmins) {
      await this.createNotification(
        admin._id.toString(),
        type,
        title,
        message,
        link
      );
    }
  }

  /**
   * Get notifications for user
   */
  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    unreadOnly = false
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const query: any = { userId };

    if (unreadOnly) {
      query.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await Notification.findByIdAndUpdate(notificationId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }
}
