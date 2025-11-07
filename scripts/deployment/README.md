# Deployment Scripts

Automated deployment scripts for Earth To Orbit platform.

## Overview

These scripts provide an easy, interactive way to deploy the Earth To Orbit platform to production environments.

## Available Scripts

### 1. `deploy-vercel.sh` - Deploy Web Frontend to Vercel

Deploys the Next.js web application to Vercel.

**Prerequisites:**
- Vercel CLI installed: `npm install -g vercel`
- Logged in to Vercel: `vercel login`
- Project linked: `vercel link` (run once)

**Usage:**

```bash
# Deploy to preview
./scripts/deployment/deploy-vercel.sh preview

# Deploy to production
./scripts/deployment/deploy-vercel.sh production

# Or use npm scripts
pnpm deploy:vercel         # Deploy to preview
pnpm deploy:vercel:prod    # Deploy to production
```

**Features:**
- ✅ Automatic CLI check and verification
- ✅ Optional pre-deployment typecheck
- ✅ Production deployment confirmation
- ✅ Colorized progress output
- ✅ Post-deployment instructions

---

### 2. `deploy-railway.sh` - Deploy API Backend to Railway

Deploys the Express/Node.js API backend to Railway.

**Prerequisites:**
- Railway CLI installed: `npm install -g @railway/cli` or `brew install railway`
- Logged in to Railway: `railway login`
- Project linked: `railway link` (run once)

**Usage:**

```bash
# Deploy to current environment
./scripts/deployment/deploy-railway.sh

# Deploy to production
./scripts/deployment/deploy-railway.sh production

# Or use npm scripts
pnpm deploy:railway        # Deploy to current environment
pnpm deploy:railway:prod   # Deploy to production
```

**Features:**
- ✅ Automatic CLI check and verification
- ✅ Railway project status check
- ✅ Optional pre-deployment typecheck
- ✅ Optional local build verification
- ✅ Environment variable checklist
- ✅ Production deployment confirmation
- ✅ Colorized progress output
- ✅ Post-deployment instructions with next steps

---

## Quick Start - Full Deployment

Deploy both frontend and backend in one go:

```bash
# 1. Deploy backend first
./scripts/deployment/deploy-railway.sh production

# 2. Get your Railway API URL
railway domain
# Output: https://your-api-name.railway.app

# 3. Set NEXT_PUBLIC_API_URL in Vercel
# Go to: https://vercel.com/dashboard → Project → Settings → Environment Variables
# Add: NEXT_PUBLIC_API_URL = https://your-api-name.railway.app/api

# 4. Deploy frontend
./scripts/deployment/deploy-vercel.sh production
```

---

## Environment Variables Setup

### Required for Railway (Backend)

Set these in Railway dashboard or via CLI:

```bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set JWT_SECRET="your-secret-key"
railway variables set JWT_REFRESH_SECRET="your-refresh-secret"
railway variables set FRONTEND_URL="https://your-vercel-app.vercel.app"
```

### Required for Vercel (Frontend)

Set these in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-api.railway.app/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` |

See `DEPLOYMENT.md` for the complete list of environment variables.

---

## Troubleshooting

### "Vercel CLI is not installed"

```bash
npm install -g vercel
```

### "Railway CLI is not installed"

```bash
# NPM
npm install -g @railway/cli

# Or Homebrew (macOS)
brew install railway
```

### "Project is not linked"

```bash
# For Vercel
vercel link

# For Railway
railway link
```

### Typecheck Fails

Fix TypeScript errors before deploying:

```bash
# Check web app
pnpm --filter=@e2o/web typecheck

# Check API
pnpm --filter=@e2o/api typecheck
```

---

## Post-Deployment

### Verify Deployment

**Check API health:**
```bash
curl https://your-api.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

**Check frontend:**
Visit `https://your-app.vercel.app` in your browser.

### Monitor Logs

**Railway logs:**
```bash
railway logs
```

**Vercel logs:**
Visit: https://vercel.com/dashboard → Your Project → Deployments → View Logs

---

## Advanced Usage

### Deploy to Specific Environment

```bash
# Railway supports custom environments
./scripts/deployment/deploy-railway.sh staging
./scripts/deployment/deploy-railway.sh production
```

### Skip Typecheck (Not Recommended)

When prompted "Run typecheck before deployment?", answer `N`.

### Automatic Deployment (CI/CD)

For automated deployments, use Vercel and Railway's GitHub integration:

**Vercel:**
1. Go to Vercel Dashboard → New Project
2. Connect GitHub repository
3. Vercel auto-deploys on push to main branch

**Railway:**
1. Go to Railway Dashboard → New Project
2. Deploy from GitHub repo
3. Railway auto-deploys on push to main branch

---

## Script Customization

Both scripts are written in Bash and can be customized:

- **Colors:** Modify color codes at the top of each script
- **Checks:** Add/remove pre-deployment checks
- **Prompts:** Customize confirmation prompts

---

## Related Documentation

- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Complete deployment guide
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

---

**Last Updated:** January 2025
