import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStaff extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  site: mongoose.Types.ObjectId;
  role: string;
  department?: string;
  expertise?: string[];
  ratePerHour?: number; // INR per hour for assistance
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
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
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    site: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    ratePerHour: {
      type: Number,
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
StaffSchema.index({ site: 1, isActive: 1 });
StaffSchema.index({ email: 1 });

const Staff: Model<IStaff> = mongoose.model<IStaff>('Staff', StaffSchema);

export default Staff;
