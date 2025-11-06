# Railway Deployment Guide for Earth To Orbit API

This guide walks you through deploying the Earth To Orbit API backend to Railway.app.

## Prerequisites

- Railway.app account
- MongoDB database (Railway MongoDB plugin or MongoDB Atlas)
- GitHub repository connected to Railway

## Quick Start

### 1. Create New Railway Project

```bash
# Install Railway CLI (optional)
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init
```

Or use the Railway Dashboard at https://railway.app/new

### 2. Add MongoDB Database

**Option A: Railway MongoDB Plugin**
1. Go to your Railway project
2. Click "New" → "Database" → "Add MongoDB"
3. Copy the connection string from the MongoDB service variables

**Option B: MongoDB Atlas**
1. Create a cluster on MongoDB Atlas
2. Get your connection string
3. Add it as environment variable in Railway

### 3. Configure Environment Variables

In Railway Dashboard, add these environment variables:

```env
# Environment
NODE_ENV=production
PORT=4000

# Database (from Railway MongoDB or Atlas)
MONGODB_URI=mongodb://...

# URLs
FRONTEND_URL=https://yourdomain.com
API_URL=https://your-api.up.railway.app

# JWT Secrets (CRITICAL: Generate secure random strings!)
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-64-char-random-string>

# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Earth To Orbit

# Payment Gateway - Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=earth-to-orbit-production
AWS_REGION=ap-south-1

# Company Configuration
COMPANY_NAME=Earth To Orbit
COMPANY_EMAIL=contact@earth-to-orbit.com
SUPPORT_EMAIL=support@earth-to-orbit.com
COMPANY_WEBSITE=https://earth-to-orbit.com
COMPANY_PHONE=+91-80-XXXX-XXXX

# Developer Attribution
DEVELOPER_NAME=Ujjwal Sittu
DEVELOPER_COUNTRY=🇮🇳

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
```

### 4. Deploy the API

Railway will automatically detect the configuration and deploy:

```bash
# Using Railway CLI
railway up

# Or connect your GitHub repo in Railway Dashboard
# Railway will auto-deploy on every push to main branch
```

### 5. Run Database Seed Script

After initial deployment, seed the database with demo data:

**Option A: Using Railway CLI**
```bash
railway run pnpm seed
```

**Option B: Using Railway Dashboard**
1. Go to your project
2. Click on the API service
3. Go to "Settings" → "Deploy"
4. Add a one-time deployment command: `pnpm seed`
5. Or use the "Run Command" feature: `pnpm seed`

**Option C: Manual SSH**
```bash
# SSH into Railway container
railway shell

# Run seed script
pnpm seed
```

### 6. Verify Deployment

Check if the API is running:

```bash
curl https://your-api.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T...",
  "uptime": 123.456,
  "database": "connected"
}
```

## Configuration Files

Railway uses these configuration files (all included in the repository):

- **railway.json** - Railway-specific deployment configuration
- **nixpacks.toml** - Build configuration using Nixpacks
- **Procfile** - Process definitions (web server, seed script)

## Important Notes

### Security
- **NEVER** commit `.env` file to git
- Generate strong random JWT secrets (min 64 characters)
- Use Railway's environment variable encryption
- Enable Railway's "Lock Service" for production

### Database Seeding
- Run seed script **only once** after initial deployment
- Seed creates demo organizations, users, and equipment
- Check seed script output for demo credentials
- For production, disable or modify demo data creation

### Monitoring
- Enable Railway's built-in monitoring
- Set up health check endpoint: `/api/health`
- Configure alerts for service downtime
- Monitor MongoDB connection pool

### Scaling
- Railway automatically scales based on traffic
- Configure vertical scaling in service settings
- For high traffic, consider horizontal scaling (contact Railway support)

### Custom Domain
1. Go to Railway Dashboard → Your Service → Settings
2. Click "Generate Domain" for railway.app subdomain
3. Or add custom domain:
   - Click "Custom Domain"
   - Enter your domain (e.g., api.yourdomain.com)
   - Add CNAME record to your DNS: `CNAME api.yourdomain.com → your-service.up.railway.app`

## Troubleshooting

### Build Fails
```bash
# Check build logs in Railway Dashboard
railway logs --build

# Common issues:
# - Missing dependencies: Check package.json
# - TypeScript errors: Run `pnpm typecheck` locally
# - Out of memory: Increase Railway plan
```

### Database Connection Fails
```bash
# Verify MongoDB URI
railway variables

# Check MongoDB service status
railway status

# Test connection locally
MONGODB_URI=your_uri pnpm api:dev
```

### Seed Script Fails
```bash
# Check environment variables are set
railway variables

# Run with verbose logging
NODE_ENV=development railway run pnpm seed

# Common issues:
# - MongoDB not connected: Check MONGODB_URI
# - Missing environment variables: Check .env
# - Duplicate data: Drop database and re-seed
```

### API Returns 502/503
```bash
# Check service logs
railway logs

# Common issues:
# - PORT mismatch: Railway sets PORT automatically
# - Startup timeout: Increase in railway.json
# - Health check fails: Check /api/health endpoint
```

## Database Management

### Backup Database
```bash
# Using Railway CLI
railway run mongodump --uri=$MONGODB_URI --out=/tmp/backup

# Or use MongoDB Atlas automated backups
```

### Reset Database
```bash
# Drop all collections (DANGEROUS!)
railway run pnpm seed --reset

# Or manually:
railway shell
mongosh $MONGODB_URI
> use earth-to-orbit
> db.dropDatabase()
```

### View Database
```bash
# Connect to MongoDB
railway shell
mongosh $MONGODB_URI

# List all collections
> show collections

# Query data
> db.users.find().pretty()
> db.organizations.countDocuments()
```

## Cost Optimization

- Railway offers $5/month free credit
- API typically uses ~$5-15/month for low traffic
- MongoDB plugin: ~$5-10/month
- Monitor usage in Railway Dashboard
- Set up billing alerts

## Production Checklist

- [ ] All environment variables configured
- [ ] JWT secrets are strong random strings (min 64 chars)
- [ ] MongoDB connection string is production database
- [ ] Custom domain configured with SSL
- [ ] Database seeded with initial data
- [ ] Health check endpoint responding
- [ ] Email service (Resend) configured and tested
- [ ] Razorpay production keys configured
- [ ] S3 bucket created and configured
- [ ] Monitoring and alerts enabled
- [ ] Backup strategy in place
- [ ] CORS configured for frontend domain
- [ ] Rate limiting enabled
- [ ] Security headers configured

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/ujjwalsittu/earth-to-orbit/issues

---

**Deployment by:** Ujjwal Sittu 🇮🇳
**Platform:** Railway.app
**Framework:** Express.js + TypeScript + MongoDB
