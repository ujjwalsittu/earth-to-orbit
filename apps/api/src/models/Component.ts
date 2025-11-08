import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComponent extends Document {
  _id: mongoose.Types.ObjectId;
  sku: string;
  name: string;
  category: mongoose.Types.ObjectId;
  site: mongoose.Types.ObjectId;
  description: string;
  specifications: Map<string, string>;
  images?: string[];

  // Pricing
  unitPrice: number; // INR per unit (for purchase/one-time use)
  rentalRatePerDay?: number; // INR per day (for rental)

  // Stock management
  stockQuantity: number;
  availableQuantity: number; // stockQuantity - reserved
  leadTimeDays: number;
  minimumOrderQuantity: number;

  // Metadata
  manufacturer?: string;
  partNumber?: string;
  hsn?: string; // HSN/SAC code for GST

  availability: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ComponentSchema = new Schema<IComponent>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
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
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    rentalRatePerDay: {
      type: Number,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    leadTimeDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    partNumber: {
      type: String,
      trim: true,
    },
    hsn: {
      type: String,
      trim: true,
    },
    availability: {
      type: Boolean,
      default: true,
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
ComponentSchema.index({ sku: 1 });
ComponentSchema.index({ category: 1 });
ComponentSchema.index({ site: 1 });
ComponentSchema.index({ availability: 1, isActive: 1 });
ComponentSchema.index({ availableQuantity: 1 });
ComponentSchema.index({ name: 'text', description: 'text' });

// Update availableQuantity when stockQuantity changes
ComponentSchema.pre('save', function (next) {
  if (this.isModified('stockQuantity') && !this.isModified('availableQuantity')) {
    this.availableQuantity = this.stockQuantity;
  }
  next();
});

const Component: Model<IComponent> = mongoose.model<IComponent>('Component', ComponentSchema);

export default Component;
