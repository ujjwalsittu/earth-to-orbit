import mongoose, { Schema, Document } from 'mongoose';
import { IInvoice, InvoiceStatus } from '@e2o/types';

export interface InvoiceDocument extends Omit<IInvoice, '_id'>, Document {}

const lineItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['MACHINERY', 'COMPONENT', 'ASSISTANCE', 'TAX', 'FEE'],
      required: true,
    },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    taxPercent: Number,
    taxAmount: Number,
    total: { type: Number, required: true },
    metadata: Schema.Types.Mixed,
  },
  { _id: false }
);

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    lineItems: [lineItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxPercent: {
      type: Number,
      required: true,
      default: 18,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.PENDING,
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAt: Date,
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pdfUrl: String,
    billingAddress: {
      organizationName: String,
      gstNumber: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    notes: String,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ organizationId: 1, status: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

export const Invoice = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema);
