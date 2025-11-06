import { z } from 'zod';
import { NotificationType, objectIdSchema } from './common';

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IEmailTemplate {
  _id: string;
  name: string;
  slug: string; // e.g., "request-submitted", "payment-received"
  subject: string;
  templateId?: string; // Resend template ID if using template engine
  variables: string[]; // e.g., ["organizationName", "requestNumber", "amount"]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const notificationCreateSchema = z.object({
  userId: objectIdSchema,
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  link: z.string().optional(),
});

export const emailTemplateCreateSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).toLowerCase(),
  subject: z.string().min(1),
  templateId: z.string().optional(),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type NotificationCreateDTO = z.infer<typeof notificationCreateSchema>;
export type EmailTemplateCreateDTO = z.infer<typeof emailTemplateCreateSchema>;
