import { z } from 'zod';
import { objectIdSchema } from './common';

// Site (Physical centers)
export interface ISite {
  _id: string;
  name: string;
  code: string; // e.g., "BLR-01", "HYD-02"
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  timezone: string; // e.g., "Asia/Kolkata"
  operatingHours: {
    start: string; // "09:00"
    end: string; // "18:00"
  };
  contactPhone?: string;
  contactEmail?: string;
  facilities: string[]; // e.g., ["Cleanroom", "Power Backup", "Climate Control"]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const siteCreateSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(20).toUpperCase(),
  location: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).optional(),
  }),
  timezone: z.string().default('Asia/Kolkata'),
  operatingHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  facilities: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

// Category for machinery/labs
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentCategoryId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).toLowerCase(),
  description: z.string().max(1000).optional(),
  icon: z.string().optional(),
  parentCategoryId: objectIdSchema.optional(),
  isActive: z.boolean().default(true),
});

// Lab/Machinery
export interface ILab {
  _id: string;
  siteId: string;
  categoryId: string;
  name: string;
  code: string; // e.g., "TVAC-01", "VIB-TABLE-02"
  description: string;
  specifications: Record<string, any>; // Free-form JSON for specs
  capabilities: string[];
  images?: string[];
  capacity: number; // Max concurrent bookings
  slotGranularityMinutes: number; // e.g., 15, 30, 60
  ratePerMinute?: number; // INR
  ratePerHour: number; // INR
  minimumBookingHours?: number;
  maximumBookingHours?: number;
  maintenanceWindows?: {
    start: Date;
    end: Date;
    reason?: string;
  }[];
  blackoutDates?: Date[];
  requiresApproval: boolean;
  requiresTraining: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export const labCreateSchema = z.object({
  siteId: objectIdSchema,
  categoryId: objectIdSchema,
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(50).toUpperCase(),
  description: z.string().min(1),
  specifications: z.record(z.any()).default({}),
  capabilities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).optional(),
  capacity: z.number().int().min(1).default(1),
  slotGranularityMinutes: z.number().int().min(15).default(60),
  ratePerMinute: z.number().min(0).optional(),
  ratePerHour: z.number().min(0),
  minimumBookingHours: z.number().min(0).optional(),
  maximumBookingHours: z.number().min(1).optional(),
  requiresApproval: z.boolean().default(true),
  requiresTraining: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Component (parts/modules)
export interface IComponent {
  _id: string;
  categoryId: string;
  sku: string;
  name: string;
  description: string;
  manufacturer?: string;
  specifications: Record<string, any>;
  images?: string[];
  stockQuantity: number;
  leadTimeDays: number;
  pricePerUnit: number; // INR
  rentalRatePerDay?: number; // If component can be rented
  isRentable: boolean;
  isPurchaseable: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export const componentCreateSchema = z.object({
  categoryId: objectIdSchema,
  sku: z.string().min(1).max(100).toUpperCase(),
  name: z.string().min(2).max(200),
  description: z.string().min(1),
  manufacturer: z.string().optional(),
  specifications: z.record(z.any()).default({}),
  images: z.array(z.string().url()).optional(),
  stockQuantity: z.number().int().min(0).default(0),
  leadTimeDays: z.number().int().min(0).default(0),
  pricePerUnit: z.number().min(0),
  rentalRatePerDay: z.number().min(0).optional(),
  isRentable: z.boolean().default(false),
  isPurchaseable: z.boolean().default(true),
  requiresApproval: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

// Staff/Assistance
export interface IStaff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string[];
  certifications: string[];
  siteIds: string[]; // Sites where this staff works
  ratePerHour: number; // INR
  availability?: {
    daysOfWeek: number[]; // 0-6, 0=Sunday
    startTime: string; // "09:00"
    endTime: string; // "17:00"
  };
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export const staffCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string(),
  skills: z.array(z.string()).min(1),
  certifications: z.array(z.string()).default([]),
  siteIds: z.array(objectIdSchema).min(1),
  ratePerHour: z.number().min(0),
  availability: z.object({
    daysOfWeek: z.array(z.number().min(0).max(6)),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  }).optional(),
  isActive: z.boolean().default(true),
});

export type SiteCreateDTO = z.infer<typeof siteCreateSchema>;
export type CategoryCreateDTO = z.infer<typeof categoryCreateSchema>;
export type LabCreateDTO = z.infer<typeof labCreateSchema>;
export type ComponentCreateDTO = z.infer<typeof componentCreateSchema>;
export type StaffCreateDTO = z.infer<typeof staffCreateSchema>;
