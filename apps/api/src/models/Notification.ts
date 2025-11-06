import mongoose, { Schema, Document } from 'mongoose';
import { INotification, NotificationType } from '@e2o/types';

export interface NotificationDocument extends Omit<INotification, '_id'>, Document {}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: String,
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<NotificationDocument>(
  'Notification',
  notificationSchema
);
