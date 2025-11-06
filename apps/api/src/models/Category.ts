import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from '@e2o/types';

export interface CategoryDocument extends Omit<ICategory, '_id'>, Document {}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: String,
    icon: String,
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
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

export const Category = mongoose.model<CategoryDocument>('Category', categorySchema);
