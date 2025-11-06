import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // URLs
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // Database
  MONGODB_URI: z.string().min(1),

  // JWT Authentication
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),

  // Payment Gateway - Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // Email Service - Resend
  RESEND_API_KEY: z.string().optional(),

  // Company/Branding
  COMPANY_NAME: z.string().default('Earth To Orbit'),
  COMPANY_EMAIL: z.string().email().default('contact@earth-to-orbit.com'),
  SUPPORT_EMAIL: z.string().email().default('support@earth-to-orbit.com'),
  COMPANY_WEBSITE: z.string().url().default('https://earth-to-orbit.com'),
  COMPANY_PHONE: z.string().default('+91-80-XXXX-XXXX'),
  COMPANY_ADDRESS: z.string().default('Bangalore, Karnataka, India'),

  // AWS S3 (Optional)
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().default('earth-to-orbit-uploads'),

  // Demo/Seed Data Credentials
  DEMO_PLATFORM_ADMIN_EMAIL: z.string().email().default('admin@earth-to-orbit.com'),
  DEMO_PLATFORM_ADMIN_PASSWORD: z.string().default('Admin@123456'),
  DEMO_ORG_ADMIN_EMAIL: z.string().email().default('admin@spacetech.in'),
  DEMO_ORG_ADMIN_PASSWORD: z.string().default('OrgAdmin@123'),
  DEMO_ORG_MEMBER_EMAIL: z.string().email().default('engineer@spacetech.in'),
  DEMO_ORG_MEMBER_PASSWORD: z.string().default('Member@123'),
  DEMO_ORG_EMAIL: z.string().email().default('contact@spacetech.in'),
});

export const env = envSchema.parse(process.env);

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
