import mongoose, { Schema, Document } from 'mongoose';
import { ISite } from '@e2o/types';

export interface SiteDocument extends Omit<ISite, '_id'>, Document {}

const siteSchema = new Schema<SiteDocument>(
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
      uppercase: true,
      index: true,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    timezone: {
      type: String,
      required: true,
      default: 'Asia/Kolkata',
    },
    operatingHours: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    contactPhone: String,
    contactEmail: String,
    facilities: [String],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Site = mongoose.model<SiteDocument>('Site', siteSchema);
