import { z } from 'zod';
import {
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  invoiceStatusSchema,
  paymentMethodSchema,
  paymentStatusSchema,
  objectIdSchema,
  dateSchema,
  urlSchema,
} from './common';

export interface IInvoiceLineItem {
  type: 'MACHINERY' | 'COMPONENT' | 'ASSISTANCE' | 'TAX' | 'FEE';
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxPercent?: number;
  taxAmount?: number;
  total: number;
  metadata?: Record<string, any>;
}

export interface IInvoice {
  _id: string;
  invoiceNumber: string; // Auto-generated: INV-2024-00001
  requestId: string;
  organizationId: string;

  // Line items
  lineItems: IInvoiceLineItem[];

  // Totals
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  currency: string; // "INR"

  // Payment
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  paidAmount: number;

  // PDF
  pdfUrl?: string;

  // Metadata
  billingAddress?: {
    organizationName: string;
    gstNumber?: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  notes?: string;
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  _id: string;
  paymentNumber: string; // PAY-2024-00001
  invoiceId: string;
  organizationId: string;

  amount: number;
  currency: string; // "INR"
  method: PaymentMethod;
  status: PaymentStatus;

  // Razorpay fields
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // Bank transfer fields
  bankTransferDetails?: {
    receiptUrl: string;
    transactionId?: string;
    bankName?: string;
    uploadedAt: Date;
    uploadedBy: string; // userId
    verifiedAt?: Date;
    verifiedBy?: string; // admin userId
    verificationNotes?: string;
  };

  // Events
  events: {
    timestamp: Date;
    type: string;
    data?: Record<string, any>;
    notes?: string;
  }[];

  failureReason?: string;
  refundedAt?: Date;
  refundAmount?: number;

  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

// Zod schemas
export const invoiceCreateSchema = z.object({
  requestId: objectIdSchema,
  organizationId: objectIdSchema,
  lineItems: z.array(z.object({
    type: z.enum(['MACHINERY', 'COMPONENT', 'ASSISTANCE', 'TAX', 'FEE']),
    description: z.string(),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
    subtotal: z.number().min(0),
    taxPercent: z.number().min(0).optional(),
    taxAmount: z.number().min(0).optional(),
    total: z.number().min(0),
  })),
  subtotal: z.number().min(0),
  taxPercent: z.number().min(0).default(18), // GST 18%
  taxAmount: z.number().min(0),
  total: z.number().min(0),
  dueDate: dateSchema,
  notes: z.string().optional(),
});

export const razorpayOrderCreateSchema = z.object({
  invoiceId: objectIdSchema,
  amount: z.number().min(1),
  currency: z.string().default('INR'),
});

export const razorpayVerifySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export const bankTransferUploadSchema = z.object({
  invoiceId: objectIdSchema,
  receiptUrl: urlSchema,
  transactionId: z.string().optional(),
  bankName: z.string().optional(),
});

export const bankTransferVerifySchema = z.object({
  paymentId: objectIdSchema,
  action: z.enum(['APPROVE', 'REJECT']),
  verificationNotes: z.string().optional(),
});

export type InvoiceCreateDTO = z.infer<typeof invoiceCreateSchema>;
export type RazorpayOrderCreateDTO = z.infer<typeof razorpayOrderCreateSchema>;
export type RazorpayVerifyDTO = z.infer<typeof razorpayVerifySchema>;
export type BankTransferUploadDTO = z.infer<typeof bankTransferUploadSchema>;
export type BankTransferVerifyDTO = z.infer<typeof bankTransferVerifySchema>;
