# Earth To Orbit - Deployment Guide

## 🚀 Production Deployment Guide

This guide will help you deploy the Earth To Orbit platform to production.

## Prerequisites

- Node.js 18+ and pnpm
- MongoDB Atlas account or MongoDB server
- Resend account (for emails)
- Razorpay account (for payments)
- AWS S3 bucket (for file uploads)
- Domain name and SSL certificate

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd earth-to-orbit
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

**Use a single `.env` file at the root** - both API and Web applications read from this unified configuration.

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure the following variables for production:

```env
# Environment
NODE_ENV=production
PORT=4000

# URLs (Update with your domain)
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Database (Use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/earth-to-orbit?retryWrites=true&w=majority

# JWT Secrets (MUST generate secure random strings!)
JWT_SECRET=<generate-a-secure-random-string-min-32-chars>
JWT_REFRESH_SECRET=<generate-another-secure-random-string-min-32-chars>

# Payment Gateway - Razorpay (Use LIVE keys for production)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx

# Email Service - Resend
RESEND_API_KEY=re_xxxxx

# AWS S3 for file uploads
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your-production-bucket

# Company/Branding
COMPANY_NAME=Your Company Name
COMPANY_EMAIL=contact@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
COMPANY_WEBSITE=https://yourdomain.com
COMPANY_PHONE=+91-80-XXXX-XXXX
COMPANY_ADDRESS=Your Address

# Frontend Public Variables
NEXT_PUBLIC_COMPANY_NAME=Your Company Name
NEXT_PUBLIC_COMPANY_EMAIL=contact@yourdomain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
NEXT_PUBLIC_DEVELOPER_NAME=Your Name
NEXT_PUBLIC_DEVELOPER_COUNTRY=🇮🇳
NEXT_PUBLIC_ENV=production

# Disable demo credentials in production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Tax Configuration
GST_PERCENT=18

# Admin Defaults
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecurePassword123!
```

#### Frontend (.env.local)

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Company/Branding
NEXT_PUBLIC_COMPANY_NAME=Your Company Name
NEXT_PUBLIC_COMPANY_EMAIL=contact@yourdomain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
NEXT_PUBLIC_COMPANY_WEBSITE=https://yourdomain.com
NEXT_PUBLIC_COMPANY_PHONE=+91-80-XXXX-XXXX
NEXT_PUBLIC_DEVELOPER_NAME=Your Name
NEXT_PUBLIC_DEVELOPER_COUNTRY=🇮🇳

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Environment
NEXT_PUBLIC_ENV=production
```

### 4. Database Setup

#### Seed Initial Data

```bash
cd apps/api
pnpm run seed
```

This creates:
- Platform admin account
- Sample facilities (TVAC chambers, vibration tables, etc.)
- Sample components and categories

### 5. Build Applications

```bash
# From root directory
pnpm run build
```

This builds:
- Backend API
- Frontend Next.js app
- Email templates

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Build Docker Images

```bash
# Build API
docker build -f infra/docker/Dockerfile.api -t earth-to-orbit-api .

# Build Web
docker build -f infra/docker/Dockerfile.web -t earth-to-orbit-web .
```

#### Run with Docker Compose

```bash
docker-compose -f infra/docker/docker-compose.yml up -d
```

### Option 2: Manual Deployment

#### Backend Deployment

```bash
cd apps/api
pnpm run build
pnpm start
```

Backend runs on port 4000 by default.

#### Frontend Deployment

```bash
cd apps/web
pnpm run build
pnpm start
```

Frontend runs on port 3000 by default.

### Option 3: Platform-Specific

#### Vercel (Frontend)

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

#### Railway/Render (Backend)

1. Connect repository
2. Set environment variables
3. Set build command: `cd apps/api && pnpm install && pnpm run build`
4. Set start command: `cd apps/api && pnpm start`

## Post-Deployment

### 1. Verify Health

```bash
# Check API health
curl https://api.yourdomain.com/health

# Should return: { "status": "ok", "timestamp": "..." }
```

### 2. Create Admin Account

First login will create the admin account using credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### 3. Configure Razorpay Webhooks

Add webhook URL in Razorpay Dashboard:
```
https://api.yourdomain.com/api/payment/razorpay/webhook
```

Events to subscribe:
- payment.captured
- payment.failed
- order.paid

### 4. Set up SSL/TLS

Use Let's Encrypt or your cloud provider's SSL certificate.

### 5. Configure CORS

Ensure `FRONTEND_URL` in backend .env matches your actual frontend URL.

## Monitoring

### Logs

```bash
# API logs
pm2 logs api

# Frontend logs
pm2 logs web
```

### Database

Monitor MongoDB Atlas metrics for:
- Connection count
- Query performance
- Storage usage

### Uptime Monitoring

Set up monitoring for:
- https://yourdomain.com (Frontend)
- https://api.yourdomain.com/health (Backend health check)

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use environment variables (never commit secrets)
- [ ] Set up rate limiting (already configured)
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Use Razorpay live keys (not test keys)

## Scaling

### Horizontal Scaling

1. Deploy multiple API instances behind a load balancer
2. Use Redis for session storage (currently using JWT - stateless)
3. Scale MongoDB with replica sets

### Vertical Scaling

Increase server resources based on:
- API response times
- Database query performance
- Concurrent user count

## Backup Strategy

### Database Backups

```bash
# Daily automated backup
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d)
```

### File Backups

Backup S3 bucket regularly or enable versioning.

## Troubleshooting

### API Not Starting

1. Check MongoDB connection
2. Verify all environment variables are set
3. Check port 4000 is available
4. Review logs for errors

### Frontend Not Connecting to API

1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check CORS settings in backend
3. Verify API is running and healthy

### Payment Issues

1. Verify Razorpay keys are correct
2. Check webhook URL is configured
3. Review payment logs in Razorpay dashboard

## Support

For issues or questions:
- Email: ${SUPPORT_EMAIL}
- Documentation: /docs/API.md

## Updates

To update the production deployment:

```bash
git pull origin fix
pnpm install
pnpm run build
pm2 restart all
```

---

**Built with ❤️ in India 🇮🇳**
