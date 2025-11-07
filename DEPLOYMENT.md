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

### Automated CLI Deployment (Recommended) 🚀

We provide automated deployment scripts for easy deployment to Vercel and Railway:

```bash
# 1. Install CLI tools
npm install -g vercel @railway/cli

# 2. Login to both platforms
vercel login
railway login

# 3. Deploy API to Railway
./scripts/deployment/deploy-railway.sh production

# 4. Get Railway API URL
railway domain

# 5. Set NEXT_PUBLIC_API_URL in Vercel dashboard
# Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
# Add: NEXT_PUBLIC_API_URL = https://your-railway-api.railway.app/api

# 6. Deploy Web to Vercel
./scripts/deployment/deploy-vercel.sh production
```

That's it! Your application is now deployed. 🎉

### Manual Setup

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

### Option 3: Platform-Specific Deployment

This is the recommended approach for production deployments. We provide pre-configured deployment files for major platforms.

#### 🔷 Vercel (Frontend - Next.js)

**Quick Deploy:**

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration

2. **Configure Project**
   - Root Directory: `apps/web`
   - Framework Preset: Next.js
   - Build Command: Auto-detected
   - Output Directory: Auto-detected

3. **Set Environment Variables**

   Add these in Vercel Dashboard → Project Settings → Environment Variables:

   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXT_PUBLIC_COMPANY_NAME=Earth To Orbit
   NEXT_PUBLIC_COMPANY_EMAIL=contact@earth-to-orbit.com
   NEXT_PUBLIC_SUPPORT_EMAIL=support@earth-to-orbit.com
   NEXT_PUBLIC_COMPANY_WEBSITE=https://earth-to-orbit.com
   NEXT_PUBLIC_COMPANY_PHONE=+91-80-XXXX-XXXX
   NEXT_PUBLIC_DEVELOPER_NAME=Ujjwal Sittu
   NEXT_PUBLIC_DEVELOPER_COUNTRY=🇮🇳
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   NEXT_PUBLIC_ENABLE_CHAT_SUPPORT=false
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get your URL: `https://your-project.vercel.app`

5. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

**Configuration File:** `vercel.json` (included in repository)

**Using Vercel CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy using our automated script (Recommended)
./scripts/deployment/deploy-vercel.sh preview
./scripts/deployment/deploy-vercel.sh production

# Or deploy manually
cd apps/web
vercel

# Deploy to production manually
vercel --prod
```

**Our deployment script includes:**
- ✅ Pre-deployment typecheck
- ✅ Configuration validation
- ✅ Production confirmation prompts
- ✅ Colorized progress output

---

#### 🟩 Netlify (Frontend - Alternative to Vercel)

**Quick Deploy:**

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com/start)
   - Click "New site from Git"
   - Choose your repository

2. **Configure Build Settings**
   - Base directory: `apps/web`
   - Build command: `pnpm install && pnpm build`
   - Publish directory: `.next`

3. **Install Next.js Plugin**

   Netlify automatically detects and installs `@netlify/plugin-nextjs`

4. **Set Environment Variables**

   Add these in Netlify Dashboard → Site Settings → Environment Variables:

   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXT_PUBLIC_COMPANY_NAME=Earth To Orbit
   NEXT_PUBLIC_COMPANY_EMAIL=contact@earth-to-orbit.com
   NEXT_PUBLIC_SUPPORT_EMAIL=support@earth-to-orbit.com
   NEXT_PUBLIC_COMPANY_WEBSITE=https://earth-to-orbit.com
   NEXT_PUBLIC_COMPANY_PHONE=+91-80-XXXX-XXXX
   NEXT_PUBLIC_DEVELOPER_NAME=Ujjwal Sittu
   NEXT_PUBLIC_DEVELOPER_COUNTRY=🇮🇳
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   NEXT_PUBLIC_ENABLE_CHAT_SUPPORT=false
   ```

5. **Deploy**
   - Click "Deploy site"
   - Netlify builds and deploys
   - Get your URL: `https://your-site.netlify.app`

6. **Custom Domain (Optional)**
   - Go to Site Settings → Domain Management
   - Add custom domain
   - Update DNS records

**Configuration File:** `netlify.toml` (included in repository)

**Using Netlify CLI:**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Link to existing site or create new
netlify link

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

---

#### 🚂 Railway (Backend - API + Database)

**Comprehensive Railway deployment guide available in [`RAILWAY.md`](./RAILWAY.md)**

**Quick Deploy:**

1. **Create Railway Project**
   - Go to [Railway Dashboard](https://railway.app/new)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"

2. **Add MongoDB Database**
   - In your project, click "New" → "Database" → "MongoDB"
   - Railway creates a MongoDB instance
   - Copy connection string from MongoDB service variables

3. **Configure API Service**

   Railway auto-detects the configuration from `railway.json` and `nixpacks.toml`

   **Add Environment Variables:**

   ```env
   NODE_ENV=production
   PORT=4000

   # Database (from Railway MongoDB service)
   MONGODB_URI=mongodb://...  # Auto-populated by Railway

   # URLs
   FRONTEND_URL=https://yourdomain.com
   API_URL=https://your-api.up.railway.app

   # JWT Secrets (Generate 64-char random strings!)
   JWT_SECRET=<64-char-random-string>
   JWT_REFRESH_SECRET=<64-char-random-string>

   # Email - Resend
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   EMAIL_FROM_NAME=Earth To Orbit

   # Payment - Razorpay
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_live_razorpay_secret_key
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

   # AWS S3 (Optional)
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=earth-to-orbit-production
   AWS_REGION=ap-south-1

   # Company
   COMPANY_NAME=Earth To Orbit
   COMPANY_EMAIL=contact@earth-to-orbit.com
   SUPPORT_EMAIL=support@earth-to-orbit.com
   COMPANY_WEBSITE=https://earth-to-orbit.com
   COMPANY_PHONE=+91-80-XXXX-XXXX

   # Developer
   DEVELOPER_NAME=Ujjwal Sittu
   DEVELOPER_COUNTRY=🇮🇳

   # Features
   ENABLE_EMAIL_NOTIFICATIONS=true
   ENABLE_SMS_NOTIFICATIONS=false
   ```

4. **Deploy**
   - Railway automatically builds and deploys
   - Monitor deployment in logs
   - Get your API URL: `https://your-service.up.railway.app`

5. **Run Database Seed Script**

   After initial deployment, seed the database:

   **Option A: Using Railway CLI**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli

   # Login
   railway login

   # Link to project
   railway link

   # Run seed script
   railway run pnpm seed
   ```

   **Option B: Using Railway Dashboard**
   - Go to your API service
   - Click "Settings" → "Deploy"
   - Use "Run Command" feature: `pnpm seed`

   **Option C: SSH into container**
   ```bash
   railway shell
   pnpm seed
   ```

6. **Verify Deployment**
   ```bash
   curl https://your-api.up.railway.app/api/health
   ```

7. **Custom Domain (Optional)**
   - Go to API Service → Settings
   - Click "Generate Domain" or add custom domain
   - For custom domain (e.g., `api.yourdomain.com`):
     - Add CNAME record: `api.yourdomain.com → your-service.up.railway.app`

**Using Railway CLI:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy using our automated script (Recommended)
./scripts/deployment/deploy-railway.sh production

# Or deploy manually
railway up --environment production
```

**Our deployment script includes:**
- ✅ Pre-deployment typecheck
- ✅ Optional local build verification
- ✅ Environment variable checklist
- ✅ Production confirmation prompts
- ✅ Colorized progress output
- ✅ Post-deployment instructions

**Configuration Files:**
- `railway.json` - Railway deployment config (fixed for pnpm monorepo)
- `nixpacks.toml` - Build configuration
- `Procfile` - Process definitions (web, seed)

**Cost:** Railway offers $5/month free credit. API + MongoDB typically costs $10-20/month.

**See [`RAILWAY.md`](./RAILWAY.md) for detailed Railway deployment guide including:**
- Database management
- Seed script usage
- Monitoring and logging
- Troubleshooting
- Production checklist

---

#### 🎯 Recommended Platform Combinations

**Option 1: Vercel + Railway (Recommended)**
- ✅ Frontend on Vercel (excellent Next.js support)
- ✅ Backend on Railway (easy database management)
- ✅ Auto-deploys on git push
- ✅ Built-in SSL/CDN
- **Cost:** ~$15-25/month

**Option 2: Netlify + Railway**
- ✅ Frontend on Netlify (alternative to Vercel)
- ✅ Backend on Railway
- ✅ Similar features to Option 1
- **Cost:** ~$15-25/month

**Option 3: All-in-One Railway**
- ✅ Both frontend and backend on Railway
- ✅ Simpler management, single platform
- ✅ Unified billing
- **Cost:** ~$20-30/month

---

#### 📋 Platform Comparison

| Feature | Vercel | Netlify | Railway |
|---------|--------|---------|---------|
| **Best For** | Next.js Frontend | Static Sites / Next.js | Backend APIs / Full-stack |
| **Free Tier** | Yes (Generous) | Yes | $5/month credit |
| **Auto Scaling** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Custom Domains** | ✅ Free SSL | ✅ Free SSL | ✅ Free SSL |
| **Database** | ❌ No | ❌ No | ✅ Built-in MongoDB |
| **Build Minutes** | Unlimited | 300/month | Unlimited |
| **Bandwidth** | 100GB/month | 100GB/month | Unlimited |
| **Deploy Time** | ~1-2 min | ~2-3 min | ~3-5 min |
| **Logs Retention** | 1 day (free) | 1 day (free) | 7 days |
| **Best Docs** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

#### 🔐 Platform Security Best Practices

**For All Platforms:**
- ✅ Use environment variables (never commit secrets)
- ✅ Enable automatic HTTPS/SSL (enabled by default)
- ✅ Set up 2FA for platform accounts
- ✅ Use strong, unique JWT secrets (64+ characters)
- ✅ Rotate API keys regularly
- ✅ Monitor deployment logs for errors
- ✅ Set up status page / uptime monitoring

**Railway Specific:**
- ✅ Use Railway's "Lock Service" for production
- ✅ Enable MongoDB authentication
- ✅ Set up database backups
- ✅ Use Railway's private networking for DB connections

**Vercel/Netlify Specific:**
- ✅ Use environment variable encryption
- ✅ Enable branch previews for testing
- ✅ Set up deployment protection for production
- ✅ Configure security headers (included in configs)

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
