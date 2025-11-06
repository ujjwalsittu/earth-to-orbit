import { z } from 'zod';
import { UserRole, userRoleSchema, emailSchema, objectIdSchema, phoneSchema } from './common';

export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublic = Omit<IUser, 'passwordHash'>;
export type UserCreateInput = Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'lastLogin'>;

// Zod validation schemas
export const userCreateSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: phoneSchema.optional(),
  role: userRoleSchema,
  organizationId: objectIdSchema,
});

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true });

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).max(100),
});

export type UserCreateDTO = z.infer<typeof userCreateSchema>;
export type UserUpdateDTO = z.infer<typeof userUpdateSchema>;
export type UserLoginDTO = z.infer<typeof userLoginSchema>;
