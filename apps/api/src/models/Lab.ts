import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILab extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: mongoose.Types.ObjectId;
  site: mongoose.Types.ObjectId;
  description: string;
  specifications: Map<string, string>;
  images?: string[];
  capacity?: {
    maxPayloadSize?: string;
    maxPayloadWeight?: string;
    temperatureRange?: string;
    vacuumLevel?: string;
    frequency?: string;
    [key: string]: string | undefined;
  };
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  currency: string;
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
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerWeek: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
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

// Index for performance
LabSchema.index({ category: 1, site: 1 });
LabSchema.index({ availability: 1, isActive: 1 });
LabSchema.index({ name: 'text', description: 'text' });

const Lab: Model<ILab> = mongoose.model<ILab>('Lab', LabSchema);

export default Lab;
