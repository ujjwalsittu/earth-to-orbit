import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComponent extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: mongoose.Types.ObjectId;
  site: mongoose.Types.ObjectId;
  description: string;
  specifications: Map<string, string>;
  images?: string[];
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  currency: string;
  quantity: number;
  availableQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ComponentSchema = new Schema<IComponent>(
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
    manufacturer: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    availableQuantity: {
      type: Number,
      required: true,
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
ComponentSchema.index({ category: 1, site: 1 });
ComponentSchema.index({ availableQuantity: 1, isActive: 1 });
ComponentSchema.index({ name: 'text', description: 'text' });

const Component: Model<IComponent> = mongoose.model<IComponent>('Component', ComponentSchema);

export default Component;
