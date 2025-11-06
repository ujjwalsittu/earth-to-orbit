/**
 * Frontend environment configuration
 *
 * This file reads environment variables from the root .env file.
 * Next.js automatically loads .env files from the project root.
 *
 * All frontend environment variables must be prefixed with NEXT_PUBLIC_
 * to be exposed to the browser. Never put secrets here!
 */

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // Company/Branding
  company: {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Earth To Orbit',
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contact@earth-to-orbit.com',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@earth-to-orbit.com',
    website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE || 'https://earth-to-orbit.com',
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+91-80-XXXX-XXXX',
  },

  // Developer Attribution
  developer: {
    name: process.env.NEXT_PUBLIC_DEVELOPER_NAME || 'Ujjwal Sittu',
    country: process.env.NEXT_PUBLIC_DEVELOPER_COUNTRY || '🇮🇳',
  },

  // Payment
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  },

  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false', // Default true
  },

  // Environment
  env: process.env.NEXT_PUBLIC_ENV || 'development',
  isDevelopment: process.env.NEXT_PUBLIC_ENV === 'development' || process.env.NODE_ENV === 'development',
  isProduction: process.env.NEXT_PUBLIC_ENV === 'production' || process.env.NODE_ENV === 'production',

  // Demo Credentials (only for development)
  demo: {
    adminEmail: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || 'admin@earth-to-orbit.com',
    adminPassword: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || 'Admin@123456',
    orgAdminEmail: process.env.NEXT_PUBLIC_DEMO_ORG_ADMIN_EMAIL || 'admin@spacetech.in',
    orgAdminPassword: process.env.NEXT_PUBLIC_DEMO_ORG_ADMIN_PASSWORD || 'OrgAdmin@123',
  },
} as const;

// Type-safe config access
export type Config = typeof config;
