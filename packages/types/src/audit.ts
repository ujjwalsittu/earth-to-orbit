import { z } from 'zod';
import { objectIdSchema } from './common';

export interface IAuditLog {
  _id: string;
  userId: string;
  organizationId?: string;
  action: string; // e.g., "REQUEST_SUBMITTED", "INVOICE_PAID", "USER_CREATED"
  entity: string; // e.g., "Request", "Invoice", "User"
  entityId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export const auditLogCreateSchema = z.object({
  userId: objectIdSchema,
  organizationId: objectIdSchema.optional(),
  action: z.string().min(1),
  entity: z.string().min(1),
  entityId: objectIdSchema,
  changes: z.array(z.object({
    field: z.string(),
    oldValue: z.any(),
    newValue: z.any(),
  })).optional(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type AuditLogCreateDTO = z.infer<typeof auditLogCreateSchema>;
