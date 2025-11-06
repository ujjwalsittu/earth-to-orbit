import { z } from 'zod';

// Common enums
export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  ORG_MEMBER = 'ORG_MEMBER',
}

export enum RequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESUBMIT_REQUESTED = 'RESUBMIT_REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  RAZORPAY = 'RAZORPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  VERIFICATION_REQUIRED = 'VERIFICATION_REQUIRED',
}

export enum NotificationType {
  REQUEST_SUBMITTED = 'REQUEST_SUBMITTED',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  REQUEST_RESUBMIT = 'REQUEST_RESUBMIT',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  EXTENSION_REQUESTED = 'EXTENSION_REQUESTED',
  EXTENSION_APPROVED = 'EXTENSION_APPROVED',
  EXTENSION_REJECTED = 'EXTENSION_REJECTED',
}

// Zod schemas for validation
export const userRoleSchema = z.nativeEnum(UserRole);
export const requestStatusSchema = z.nativeEnum(RequestStatus);
export const invoiceStatusSchema = z.nativeEnum(InvoiceStatus);
export const paymentMethodSchema = z.nativeEnum(PaymentMethod);
export const paymentStatusSchema = z.nativeEnum(PaymentStatus);

// Common types
export interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFields {
  createdBy: string; // userId
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Zod common schemas
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);
export const emailSchema = z.string().email();
export const urlSchema = z.string().url();
export const dateSchema = z.coerce.date();
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
