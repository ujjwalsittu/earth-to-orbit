import mongoose, { Schema, Document } from 'mongoose';
import { IStaff } from '@e2o/types';

export interface StaffDocument extends Omit<IStaff, '_id'>, Document {}

const staffSchema = new Schema<StaffDocument>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
      validate: [arrayMinLength, 'At least one skill required'],
    },
    certifications: [String],
    siteIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Site' }],
      required: true,
      validate: [arrayMinLength, 'At least one site required'],
    },
    ratePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    availability: {
      daysOfWeek: [Number],
      startTime: String,
      endTime: String,
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

function arrayMinLength(val: any[]) {
  return val && val.length > 0;
}

staffSchema.index({ siteIds: 1, isActive: 1 });

export const Staff = mongoose.model<StaffDocument>('Staff', staffSchema);
