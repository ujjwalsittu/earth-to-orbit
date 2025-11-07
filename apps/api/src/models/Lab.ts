import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILab extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string; // Unique code like "TVAC-001"
  category: mongoose.Types.ObjectId;
  site: mongoose.Types.ObjectId;
  description: string;
  specifications: Map<string, string>;
  images?: string[];

  // Capacity and technical specs
  capacity: {
    maxPayloadSize?: string;
    maxPayloadWeight?: string;
    temperatureRange?: string;
    vacuumLevel?: string;
    frequency?: string;
    [key: string]: string | undefined;
  };

  // Time-based pricing (per hour/minute)
  ratePerHour: number; // INR per hour
  ratePerMinute?: number; // Optional minute-level pricing

  // Slot configuration
  slotGranularityMinutes: number; // 15, 30, or 60 minutes

  // Operating hours
  operatingWindow: {
    start: string; // "09:00"
    end: string; // "18:00"
  };

  // Timezone for this site
  timezone: string; // "Asia/Kolkata"

  // Capacity management
  capacityUnits: number; // 1 = exclusive booking, >1 = can be shared

  // Maintenance windows
  maintenanceWindows?: Array<{
    start: Date;
    end: Date;
    reason?: string;
    recurring?: boolean;
  }>;

  // Availability
  availability: boolean;
  leadTimeDays: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const LabSchema = new Schema<ILab>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    site: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    specifications: {
      type: Map,
      of: String,
    },
    images: [
      {
        type: String,
      },
    ],
    capacity: {
      type: Schema.Types.Mixed,
    },
    ratePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    ratePerMinute: {
      type: Number,
      min: 0,
    },
    slotGranularityMinutes: {
      type: Number,
      required: true,
      enum: [15, 30, 60],
      default: 60,
    },
    operatingWindow: {
      start: {
        type: String,
        required: true,
        default: '09:00',
      },
      end: {
        type: String,
        required: true,
        default: '18:00',
      },
    },
    timezone: {
      type: String,
      required: true,
      default: 'Asia/Kolkata',
    },
    capacityUnits: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    maintenanceWindows: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        reason: String,
        recurring: { type: Boolean, default: false },
      },
    ],
    availability: {
      type: Boolean,
      default: true,
    },
    leadTimeDays: {
      type: Number,
      default: 7,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
LabSchema.index({ code: 1 });
LabSchema.index({ category: 1, site: 1 });
LabSchema.index({ availability: 1, isActive: 1 });
LabSchema.index({ site: 1, isActive: 1 });
LabSchema.index({ name: 'text', description: 'text' });

// Virtual for full code with site
LabSchema.virtual('fullCode').get(function () {
  return `${this.site}-${this.code}`;
});

const Lab: Model<ILab> = mongoose.model<ILab>('Lab', LabSchema);

export default Lab;
