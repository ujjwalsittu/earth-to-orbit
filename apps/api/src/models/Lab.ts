import mongoose, { Schema, Document } from 'mongoose';
import { ILab } from '@e2o/types';

export interface LabDocument extends Omit<ILab, '_id'>, Document {}

const labSchema = new Schema<LabDocument>(
  {
    siteId: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    specifications: Schema.Types.Mixed,
    capabilities: [String],
    images: [String],
    capacity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    slotGranularityMinutes: {
      type: Number,
      required: true,
      default: 60,
      min: 15,
    },
    ratePerMinute: {
      type: Number,
      min: 0,
    },
    ratePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumBookingHours: {
      type: Number,
      min: 0,
    },
    maximumBookingHours: {
      type: Number,
      min: 1,
    },
    maintenanceWindows: [
      {
        start: Date,
        end: Date,
        reason: String,
      },
    ],
    blackoutDates: [Date],
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    requiresTraining: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

labSchema.index({ siteId: 1, isActive: 1 });
labSchema.index({ categoryId: 1, isActive: 1 });

export const Lab = mongoose.model<LabDocument>('Lab', labSchema);
