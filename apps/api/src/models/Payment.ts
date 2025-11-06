import mongoose, { Schema, Document, Model } from 'mongoose';

export enum PaymentMethod {
  RAZORPAY = 'razorpay',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  paymentId: string;
  invoice: mongoose.Types.ObjectId;
  request: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  bankTransferDetails?: {
    transactionId?: string;
    bankName?: string;
    accountNumber?: string;
    proof?: string;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
  };
  metadata?: Map<string, any>;
  failureReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    request: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true,
    },
    organization: {
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
      required: true,
      default: PaymentStatus.PENDING,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      index: true,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
    },
    bankTransferDetails: {
      transactionId: String,
      bankName: String,
      accountNumber: String,
      proof: String,
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    failureReason: {
      type: String,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
PaymentSchema.index({ organization: 1, status: 1 });
PaymentSchema.index({ invoice: 1 });
PaymentSchema.index({ request: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ createdAt: -1 });

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
