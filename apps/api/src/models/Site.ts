import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISite extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  facilities: string[];
  contactEmail: string;
  contactPhone: string;
  operatingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSchema = new Schema<ISite>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      address: { type: String, required: true },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    operatingHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
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
SiteSchema.index({ 'location.city': 1, 'location.state': 1 });
SiteSchema.index({ isActive: 1 });

const Site: Model<ISite> = mongoose.model<ISite>('Site', SiteSchema);

export default Site;
