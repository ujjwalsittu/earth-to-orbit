import mongoose, { Schema, Document } from 'mongoose';
import { IOrganization } from '@e2o/types';

export interface OrganizationDocument extends Omit<IOrganization, '_id'>, Document {}

const organizationSchema = new Schema<OrganizationDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    legalName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    gstNumber: {
      type: String,
      sparse: true,
      index: true,
    },
    industry: {
      type: String,
      required: true,
    },
    description: String,
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      postalCode: { type: String, required: true },
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    website: String,
    logo: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    billingDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      upiId: String,
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model<OrganizationDocument>(
  'Organization',
  organizationSchema
);
