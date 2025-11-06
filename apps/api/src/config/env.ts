import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_BASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),

  MONGODB_URI: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@earth-to-orbit.com'),
  FROM_NAME: z.string().default('Earth To Orbit'),

  COMPANY_NAME: z.string().default('Earth To Orbit'),
  COMPANY_EMAIL: z.string().email().default('contact@earth-to-orbit.com'),
  SUPPORT_EMAIL: z.string().email().default('support@earth-to-orbit.com'),
  COMPANY_WEBSITE: z.string().url().default('https://earth-to-orbit.com'),
  COMPANY_PHONE: z.string().default('+91-80-XXXX-XXXX'),
  COMPANY_ADDRESS: z.string().default('Bangalore, Karnataka, India'),

  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default('e2o-receipts'),

  GST_PERCENT: z.coerce.number().default(18),

  ADMIN_EMAIL: z.string().email().default('admin@earth-to-orbit.com'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin@123456'),

  DEMO_ORG_ADMIN_EMAIL: z.string().email().default('admin@spacetech.in'),
  DEMO_ORG_ADMIN_PASSWORD: z.string().default('OrgAdmin@123'),
  DEMO_ORG_MEMBER_EMAIL: z.string().email().default('engineer@spacetech.in'),
  DEMO_ORG_MEMBER_PASSWORD: z.string().default('Member@123'),
});

export const env = envSchema.parse(process.env);

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
