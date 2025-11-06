import mongoose, { Schema, Document } from 'mongoose';
import { IComponent } from '@e2o/types';

export interface ComponentDocument extends Omit<IComponent, '_id'>, Document {}

const componentSchema = new Schema<ComponentDocument>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    manufacturer: String,
    specifications: Schema.Types.Mixed,
    images: [String],
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    leadTimeDays: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    rentalRatePerDay: {
      type: Number,
      min: 0,
    },
    isRentable: {
      type: Boolean,
      default: false,
    },
    isPurchaseable: {
      type: Boolean,
      default: true,
    },
    requiresApproval: {
      type: Boolean,
      default: true,
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

export const Component = mongoose.model<ComponentDocument>('Component', componentSchema);
