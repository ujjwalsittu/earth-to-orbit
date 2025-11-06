import mongoose, { Schema, Document, Model } from 'mongoose';

export enum RequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IRequestItem {
  itemType: 'lab' | 'component';
  item: mongoose.Types.ObjectId;
  quantity: number;
  startDate: Date;
  endDate: Date;
  days: number;
  pricePerDay: number;
  subtotal: number;
}

export interface IRequest extends Document {
  _id: mongoose.Types.ObjectId;
  requestNumber: string;
  title: string;
  description: string;
  organization: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: IRequestItem[];
  status: RequestStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  documents?: string[];
  projectDetails?: {
    projectName?: string;
    projectDescription?: string;
    missionObjective?: string;
  };
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  extensionRequests?: Array<{
    requestedEndDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    respondedAt?: Date;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
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
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        itemType: {
          type: String,
          enum: ['lab', 'component'],
          required: true,
        },
        item: {
          type: Schema.Types.ObjectId,
          refPath: 'items.itemType',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        days: {
          type: Number,
          required: true,
          min: 1,
        },
        pricePerDay: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      required: true,
      default: RequestStatus.DRAFT,
      index: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    documents: [
      {
        type: String,
      },
    ],
    projectDetails: {
      projectName: String,
      projectDescription: String,
      missionObjective: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    extensionRequests: [
      {
        requestedEndDate: { type: Date, required: true },
        reason: { type: String, required: true },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        requestedAt: { type: Date, default: Date.now },
        respondedAt: Date,
      },
    ],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
RequestSchema.index({ organization: 1, status: 1 });
RequestSchema.index({ user: 1, status: 1 });
RequestSchema.index({ requestNumber: 1 });
RequestSchema.index({ createdAt: -1 });

const Request: Model<IRequest> = mongoose.model<IRequest>('Request', RequestSchema);

export default Request;
