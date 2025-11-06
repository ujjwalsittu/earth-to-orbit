import mongoose, { Schema, Document } from 'mongoose';
import { IPayment, PaymentMethod, PaymentStatus } from '@e2o/types';

export interface PaymentDocument extends Omit<IPayment, '_id'>, Document {}

const paymentEventSchema = new Schema(
  {
    timestamp: { type: Date, required: true, default: Date.now },
    type: { type: String, required: true },
    data: Schema.Types.Mixed,
    notes: String,
  },
  { _id: false }
);

const paymentSchema = new Schema<PaymentDocument>(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
      index: true,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    bankTransferDetails: {
      receiptUrl: String,
      transactionId: String,
      bankName: String,
      uploadedAt: Date,
      uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date,
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      verificationNotes: String,
    },
    events: [paymentEventSchema],
    failureReason: String,
    refundedAt: Date,
    refundAmount: Number,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ organizationId: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema);
