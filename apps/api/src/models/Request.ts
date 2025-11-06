import mongoose, { Schema, Document } from 'mongoose';
import { IRequest, RequestStatus } from '@e2o/types';

export interface RequestDocument extends Omit<IRequest, '_id'>, Document {}

const machineryItemSchema = new Schema(
  {
    labId: { type: Schema.Types.ObjectId, ref: 'Lab', required: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
    requestedStart: { type: Date, required: true },
    requestedEnd: { type: Date, required: true },
    scheduledStart: Date,
    scheduledEnd: Date,
    durationHours: { type: Number, required: true },
    rateSnapshot: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    notes: String,
  },
  { _id: false }
);

const componentItemSchema = new Schema(
  {
    componentId: { type: Schema.Types.ObjectId, ref: 'Component', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceSnapshot: { type: Number, required: true },
    isRental: { type: Boolean, default: false },
    rentalDays: Number,
    subtotal: { type: Number, required: true },
    notes: String,
  },
  { _id: false }
);

const assistanceItemSchema = new Schema(
  {
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    skillRequired: { type: String, required: true },
    hours: { type: Number, required: true, min: 0.5 },
    rateSnapshot: Number,
    subtotal: { type: Number, required: true },
    notes: String,
  },
  { _id: false }
);

const extensionRequestSchema = new Schema(
  {
    requestedAt: { type: Date, required: true, default: Date.now },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    additionalHours: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
  },
  { _id: true }
);

const requestSchema = new Schema<RequestDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.DRAFT,
      required: true,
      index: true,
    },
    machineryItems: [machineryItemSchema],
    componentItems: [componentItemSchema],
    assistanceItems: [assistanceItemSchema],
    totals: {
      machinerySubtotal: { type: Number, required: true, default: 0 },
      componentsSubtotal: { type: Number, required: true, default: 0 },
      assistanceSubtotal: { type: Number, required: true, default: 0 },
      subtotal: { type: Number, required: true, default: 0 },
      taxPercent: { type: Number, required: true, default: 18 },
      taxAmount: { type: Number, required: true, default: 0 },
      total: { type: Number, required: true, default: 0 },
      currency: { type: String, required: true, default: 'INR' },
    },
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: String,
    resubmitRequestedAt: Date,
    resubmitReason: String,
    scheduledStart: Date,
    scheduledEnd: Date,
    assignedStaffIds: [{ type: Schema.Types.ObjectId, ref: 'Staff' }],
    extensionRequests: [extensionRequestSchema],
    attachments: [String],
    internalNotes: String,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ organizationId: 1, status: 1 });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ requestNumber: 1 });

export const Request = mongoose.model<RequestDocument>('Request', requestSchema);
