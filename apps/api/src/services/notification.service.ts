import Notification, { INotification, NotificationType } from '../models/Notification';
import logger from '../utils/logger';

/**
 * Create notification for user
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  data?: Record<string, any>
): Promise<INotification> => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      data: data ? new Map(Object.entries(data)) : undefined,
    });

    logger.info(`Notification created for user ${userId}: ${title}`);

    return notification;
  } catch (error: any) {
    logger.error('Failed to create notification:', error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string): Promise<INotification> => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

/**
 * Mark all notifications as read for user
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  logger.info(`All notifications marked as read for user ${userId}`);
};

/**
 * Get unread notification count for user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  return await Notification.countDocuments({ user: userId, isRead: false });
};

/**
 * Delete old read notifications (older than 90 days)
 */
export const cleanupOldNotifications = async (): Promise<void> => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const result = await Notification.deleteMany({
    isRead: true,
    readAt: { $lt: ninetyDaysAgo },
  });

  logger.info(`Deleted ${result.deletedCount} old notifications`);
};

export default {
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  cleanupOldNotifications,
};
