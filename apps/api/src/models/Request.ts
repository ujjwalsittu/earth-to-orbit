import mongoose, { Schema, Document, Model } from 'mongoose';

export enum RequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  INVOICED = 'invoiced',
  PAID = 'paid',
}

// Machinery/Lab booking item
export interface IMachineryItem {
  lab: mongoose.Types.ObjectId;
  site: mongoose.Types.ObjectId;
  startTime: Date; // Full ISO datetime with time
  endTime: Date; // Full ISO datetime with time
  durationHours: number;
  rateSnapshot: number; // Rate per hour at booking time
  subtotal: number;
  notes?: string;
}

// Component item
export interface IComponentItem {
  component: mongoose.Types.ObjectId;
  quantity: number;
  startDate?: Date; // Rental start date
  endDate?: Date; // Rental end date
  rentalDays?: number; // Duration in days
  priceSnapshot: number; // Rental rate per day at booking time (or unit price if purchase)
  subtotal: number;
}

// Assistance/Staff item
export interface IAssistanceItem {
  staff?: mongoose.Types.ObjectId; // Assigned later by admin
  hours: number;
  rateSnapshot?: number; // Rate per hour (can be set later)
  subtotal: number;
  notes?: string;
}

export interface IRequest extends Document {
  _id: mongoose.Types.ObjectId;
  requestNumber: string;
  title: string;
  description: string;
  organization: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;

  // Separate arrays for different item types
  machineryItems: IMachineryItem[];
  components: IComponentItem[];
  assistanceItems: IAssistanceItem[];

  // Project details
  projectDetails?: {
    projectName?: string;
    projectDescription?: string;
    missionObjective?: string;
  };

  // Status and workflow
  status: RequestStatus;

  // Pricing
  machinerySubtotal: number;
  componentsSubtotal: number;
  assistanceSubtotal: number;
  subtotal: number;
  taxRate: number; // Percentage (e.g., 18 for 18%)
  tax: number;
  total: number;
  currency: string;

  // Documents
  documents?: string[];

  // Review and approval
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;

  // Extension requests
  extensionRequests?: Array<{
    requestedHours: number;
    requestedEndTime: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    alternatives?: Array<{
      startTime: Date;
      endTime: Date;
      confidence: 'high' | 'medium' | 'low';
    }>;
    priceDelta?: number;
    requestedAt: Date;
    respondedAt?: Date;
    respondedBy?: mongoose.Types.ObjectId;
  }>;

  // Additional notes
  notes?: string;
  adminNotes?: string;

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

    // Machinery items (labs/equipment)
    machineryItems: [
      {
        lab: {
          type: Schema.Types.ObjectId,
          ref: 'Lab',
          required: true,
        },
        site: {
          type: Schema.Types.ObjectId,
          ref: 'Site',
          required: true,
        },
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          required: true,
        },
        durationHours: {
          type: Number,
          required: true,
          min: 0,
        },
        rateSnapshot: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
        notes: String,
      },
    ],

    // Component items
    components: [
      {
        component: {
          type: Schema.Types.ObjectId,
          ref: 'Component',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        startDate: Date, // Optional: for rentals
        endDate: Date, // Optional: for rentals
        rentalDays: Number, // Optional: calculated duration
        priceSnapshot: {
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

    // Assistance items
    assistanceItems: [
      {
        staff: {
          type: Schema.Types.ObjectId,
          ref: 'Staff',
        },
        hours: {
          type: Number,
          required: true,
          min: 0,
        },
        rateSnapshot: {
          type: Number,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
        notes: String,
      },
    ],

    // Project details
    projectDetails: {
      projectName: String,
      projectDescription: String,
      missionObjective: String,
    },

    // Status
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      required: true,
      default: RequestStatus.DRAFT,
      index: true,
    },

    // Pricing breakdown
    machinerySubtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    componentsSubtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    assistanceSubtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      default: 18, // 18% GST
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

    // Documents
    documents: [
      {
        type: String,
      },
    ],

    // Review
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

    // Extensions
    extensionRequests: [
      {
        requestedHours: { type: Number, required: true },
        requestedEndTime: { type: Date, required: true },
        reason: { type: String, required: true },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        alternatives: [
          {
            startTime: Date,
            endTime: Date,
            confidence: {
              type: String,
              enum: ['high', 'medium', 'low'],
            },
          },
        ],
        priceDelta: Number,
        requestedAt: { type: Date, default: Date.now },
        respondedAt: Date,
        respondedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // Notes
    notes: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
RequestSchema.index({ organization: 1, status: 1 });
RequestSchema.index({ user: 1, status: 1 });
RequestSchema.index({ requestNumber: 1 });
RequestSchema.index({ createdAt: -1 });
RequestSchema.index({ 'machineryItems.lab': 1, 'machineryItems.startTime': 1 });
RequestSchema.index({ 'machineryItems.site': 1, status: 1 });

const Request: Model<IRequest> = mongoose.model<IRequest>('Request', RequestSchema);

export default Request;
