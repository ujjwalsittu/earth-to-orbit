import { z } from 'zod';
import { emailSchema, phoneSchema, objectIdSchema, urlSchema } from './common';

export interface IOrganization {
  _id: string;
  name: string;
  legalName: string;
  registrationNumber: string; // CIN/Registration number
  gstNumber?: string;
  industry: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contactEmail: string;
  contactPhone: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  isVerified: boolean;
  billingDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationPublic = Omit<IOrganization, 'billingDetails'>;

// Zod schemas
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1).default('India'),
  postalCode: z.string().regex(/^\d{6}$/),
});

const billingDetailsSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(),
  upiId: z.string().optional(),
});

export const organizationCreateSchema = z.object({
  name: z.string().min(2).max(200),
  legalName: z.string().min(2).max(200),
  registrationNumber: z.string().min(1),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  industry: z.string().min(1),
  description: z.string().max(1000).optional(),
  address: addressSchema,
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  website: urlSchema.optional(),
  billingDetails: billingDetailsSchema.optional(),
});

export const organizationUpdateSchema = organizationCreateSchema.partial();

export type OrganizationCreateDTO = z.infer<typeof organizationCreateSchema>;
export type OrganizationUpdateDTO = z.infer<typeof organizationUpdateSchema>;
