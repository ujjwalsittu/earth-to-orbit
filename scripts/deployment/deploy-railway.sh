#!/bin/bash

###############################################################################
# Railway Deployment Script for Earth To Orbit API Backend
###############################################################################
# This script deploys the API backend to Railway using the Railway CLI
#
# Prerequisites:
# - Railway CLI installed: npm install -g @railway/cli
# - Logged in to Railway: railway login
# - Project linked: railway link (run this once in the project root)
#
# Usage:
#   ./scripts/deployment/deploy-railway.sh [environment]
#
# Examples:
#   ./scripts/deployment/deploy-railway.sh           # Deploy to current environment
#   ./scripts/deployment/deploy-railway.sh production  # Deploy to production
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Earth To Orbit - Railway Deployment Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI is not installed${NC}"
    echo -e "${YELLOW}   Install it with: npm install -g @railway/cli${NC}"
    echo -e "${YELLOW}   Or with Homebrew: brew install railway${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Railway CLI is installed"

# Determine deployment environment
DEPLOY_ENV="${1:-current}"

if [ "$DEPLOY_ENV" != "current" ]; then
    ENV_ARGS="--environment $DEPLOY_ENV"
    ENV_NAME="$DEPLOY_ENV"
    echo -e "${YELLOW}🚀 Deploying to environment: ${DEPLOY_ENV}${NC}"
else
    ENV_ARGS=""
    ENV_NAME="current"
    echo -e "${BLUE}🚀 Deploying to current environment${NC}"
fi

echo ""
echo -e "${BLUE}📦 Project Root:${NC} $PROJECT_ROOT"
echo -e "${BLUE}🌍 Environment:${NC} $ENV_NAME"
echo ""

# Navigate to project root
cd "$PROJECT_ROOT"

# Verify railway.json exists
if [ ! -f "railway.json" ]; then
    echo -e "${RED}❌ railway.json not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Configuration files verified"
echo ""

# Check if project is linked
echo -e "${BLUE}🔍 Checking Railway project link...${NC}"

if ! railway status &> /dev/null; then
    echo -e "${RED}❌ Project is not linked to Railway${NC}"
    echo -e "${YELLOW}   Run: railway link${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Project is linked to Railway"
echo ""

# Display current status
echo -e "${BLUE}📊 Current Railway Status:${NC}"
railway status
echo ""

# Run pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed${NC}"
    echo -e "${YELLOW}   Install it with: npm install -g pnpm${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Package manager (pnpm) is available"
echo ""

# Optional: Run typecheck before deployment
read -p "$(echo -e ${YELLOW}Run typecheck before deployment? [y/N]:${NC} )" -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔍 Running typecheck...${NC}"
    pnpm --filter=@e2o/api typecheck || {
        echo -e "${RED}❌ Typecheck failed${NC}"
        exit 1
    }
    echo -e "${GREEN}✓${NC} Typecheck passed"
    echo ""
fi

# Optional: Build locally to verify
read -p "$(echo -e ${YELLOW}Run build locally to verify? [y/N]:${NC} )" -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔨 Building API locally...${NC}"
    pnpm --filter=@e2o/api build || {
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    }
    echo -e "${GREEN}✓${NC} Build successful"
    echo ""
fi

# Check environment variables
echo -e "${BLUE}🔍 Important environment variables to set in Railway:${NC}"
echo ""
echo -e "  ${YELLOW}Required:${NC}"
echo -e "    • NODE_ENV=production"
echo -e "    • MONGODB_URI=<your-mongodb-connection-string>"
echo -e "    • JWT_SECRET=<strong-random-secret>"
echo -e "    • JWT_REFRESH_SECRET=<strong-random-secret>"
echo -e "    • FRONTEND_URL=<your-vercel-url>"
echo ""
echo -e "  ${YELLOW}Optional (for full functionality):${NC}"
echo -e "    • RAZORPAY_KEY_ID=<razorpay-key>"
echo -e "    • RAZORPAY_KEY_SECRET=<razorpay-secret>"
echo -e "    • RESEND_API_KEY=<resend-api-key>"
echo -e "    • AWS credentials (if using S3)"
echo ""

read -p "$(echo -e ${YELLOW}Have you set all required environment variables in Railway? [y/N]:${NC} )" -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please set environment variables in Railway dashboard first${NC}"
    echo -e "${BLUE}   You can set them using: railway variables set KEY=value${NC}"
    echo -e "${BLUE}   Or via the Railway dashboard at: https://railway.app${NC}"
    echo ""
    read -p "$(echo -e ${YELLOW}Continue anyway? [y/N]:${NC} )" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Deploy to Railway
echo -e "${BLUE}🚀 Deploying to Railway...${NC}"
echo ""

if [ "$ENV_NAME" = "production" ]; then
    # Production deployment requires confirmation
    echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION${NC}"
    read -p "$(echo -e ${YELLOW}Are you sure? [y/N]:${NC} )" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Execute deployment
railway up $ENV_ARGS

# Check deployment status
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ Deployment Successful!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    echo -e "${GREEN}🚀 Your API is now deploying to Railway!${NC}"
    echo ""

    echo -e "${BLUE}📊 To view deployment logs:${NC}"
    echo -e "   railway logs"
    echo ""

    echo -e "${BLUE}📊 To check deployment status:${NC}"
    echo -e "   railway status"
    echo ""

    echo -e "${BLUE}🌍 To get the public URL:${NC}"
    echo -e "   railway domain"
    echo ""

    echo -e "${BLUE}💡 Next steps:${NC}"
    echo -e "   • Wait for the build to complete (check logs with 'railway logs')"
    echo -e "   • Get your API URL with 'railway domain'"
    echo -e "   • Update NEXT_PUBLIC_API_URL in Vercel to point to your Railway API"
    echo -e "   • Test the /health endpoint to verify deployment"
    echo -e "   • Monitor logs for any runtime errors"
    echo ""
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ Deployment Failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Please check the error messages above and try again.${NC}"
    echo -e "${BLUE}You can also check Railway logs with: railway logs${NC}"
    echo ""
    exit 1
fi
