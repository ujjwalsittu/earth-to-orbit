import { z } from 'zod';
import { RequestStatus, requestStatusSchema, objectIdSchema, dateSchema } from './common';

export interface IMachineryItem {
  labId: string;
  siteId: string;
  requestedStart: Date;
  requestedEnd: Date;
  scheduledStart?: Date; // Admin-assigned
  scheduledEnd?: Date;
  durationHours: number;
  rateSnapshot: number; // Capture rate at time of request
  subtotal: number;
  notes?: string;
}

export interface IComponentItem {
  componentId: string;
  quantity: number;
  priceSnapshot: number; // Capture price at time of request
  isRental: boolean;
  rentalDays?: number;
  subtotal: number;
  notes?: string;
}

export interface IAssistanceItem {
  staffId?: string; // May be null until admin assigns
  skillRequired: string;
  hours: number;
  rateSnapshot?: number; // Captured once staff assigned
  subtotal: number;
  notes?: string;
}

export interface IRequest {
  _id: string;
  organizationId: string;
  requestedBy: string; // userId
  requestNumber: string; // Auto-generated: REQ-2024-00001
  title: string;
  description: string;
  status: RequestStatus;

  // Items
  machineryItems: IMachineryItem[];
  componentItems: IComponentItem[];
  assistanceItems: IAssistanceItem[];

  // Pricing
  totals: {
    machinerySubtotal: number;
    componentsSubtotal: number;
    assistanceSubtotal: number;
    subtotal: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    currency: string; // "INR"
  };

  // Workflow
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // userId (admin)
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  resubmitRequestedAt?: Date;
  resubmitReason?: string;

  // Schedule
  scheduledStart?: Date;
  scheduledEnd?: Date;
  assignedStaffIds?: string[];

  // Extensions
  extensionRequests?: {
    requestedAt: Date;
    requestedBy: string;
    additionalHours: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewedAt?: Date;
    reviewedBy?: string;
    rejectionReason?: string;
  }[];

  // Metadata
  attachments?: string[];
  internalNotes?: string; // Admin-only notes
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

// Zod schemas
const machineryItemSchema = z.object({
  labId: objectIdSchema,
  siteId: objectIdSchema,
  requestedStart: dateSchema,
  requestedEnd: dateSchema,
  durationHours: z.number().min(0.25),
  notes: z.string().optional(),
});

const componentItemSchema = z.object({
  componentId: objectIdSchema,
  quantity: z.number().int().min(1),
  isRental: z.boolean().default(false),
  rentalDays: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

const assistanceItemSchema = z.object({
  skillRequired: z.string().min(1),
  hours: z.number().min(0.5),
  notes: z.string().optional(),
});

export const requestCreateSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  machineryItems: z.array(machineryItemSchema).min(1),
  componentItems: z.array(componentItemSchema).default([]),
  assistanceItems: z.array(assistanceItemSchema).default([]),
  attachments: z.array(z.string().url()).optional(),
});

export const requestUpdateSchema = requestCreateSchema.partial();

export const requestReviewSchema = z.object({
  requestId: objectIdSchema,
  action: z.enum(['APPROVE', 'REJECT', 'RESUBMIT']),
  reason: z.string().optional(),
  scheduledStart: dateSchema.optional(),
  scheduledEnd: dateSchema.optional(),
  assignedStaffIds: z.array(objectIdSchema).optional(),
  internalNotes: z.string().optional(),
});

export const extensionRequestSchema = z.object({
  requestId: objectIdSchema,
  additionalHours: z.number().int().min(1),
  reason: z.string().min(10),
});

export const extensionReviewSchema = z.object({
  requestId: objectIdSchema,
  extensionIndex: z.number().int().min(0),
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().optional(),
});

export type RequestCreateDTO = z.infer<typeof requestCreateSchema>;
export type RequestUpdateDTO = z.infer<typeof requestUpdateSchema>;
export type RequestReviewDTO = z.infer<typeof requestReviewSchema>;
export type ExtensionRequestDTO = z.infer<typeof extensionRequestSchema>;
export type ExtensionReviewDTO = z.infer<typeof extensionReviewSchema>;
