import mongoose, { Schema, Document, Model } from 'mongoose';

export enum OrganizationType {
  STARTUP = 'startup',
  RESEARCH = 'research',
  ACADEMIC = 'academic',
  GOVERNMENT = 'government',
  CORPORATE = 'corporate',
}

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  legalName: string;
  type: OrganizationType;
  registrationNumber?: string;
  gst?: string;
  pan?: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    legalName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(OrganizationType),
      required: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    gst: {
      type: String,
      trim: true,
      uppercase: true,
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      postalCode: { type: String, required: true },
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ email: 1 });
OrganizationSchema.index({ gst: 1 });
OrganizationSchema.index({ pan: 1 });

const Organization: Model<IOrganization> = mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;
