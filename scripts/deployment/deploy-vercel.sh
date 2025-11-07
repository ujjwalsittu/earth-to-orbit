#!/bin/bash

###############################################################################
# Vercel Deployment Script for Earth To Orbit Web Frontend
###############################################################################
# This script deploys the web application to Vercel using the Vercel CLI
#
# Prerequisites:
# - Vercel CLI installed: npm install -g vercel
# - Logged in to Vercel: vercel login
# - Project linked: vercel link (run this once in the project root)
#
# Usage:
#   ./scripts/deployment/deploy-vercel.sh [production|preview]
#
# Examples:
#   ./scripts/deployment/deploy-vercel.sh preview     # Deploy to preview
#   ./scripts/deployment/deploy-vercel.sh production  # Deploy to production
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
echo -e "${BLUE}  Earth To Orbit - Vercel Deployment Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed${NC}"
    echo -e "${YELLOW}   Install it with: npm install -g vercel${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Vercel CLI is installed"

# Determine deployment environment
DEPLOY_ENV="${1:-preview}"

if [ "$DEPLOY_ENV" = "production" ] || [ "$DEPLOY_ENV" = "prod" ]; then
    DEPLOY_ARGS="--prod"
    ENV_NAME="production"
    echo -e "${YELLOW}🚀 Deploying to PRODUCTION${NC}"
else
    DEPLOY_ARGS=""
    ENV_NAME="preview"
    echo -e "${BLUE}🔍 Deploying to PREVIEW${NC}"
fi

echo ""
echo -e "${BLUE}📦 Project Root:${NC} $PROJECT_ROOT"
echo -e "${BLUE}🌍 Environment:${NC} $ENV_NAME"
echo ""

# Navigate to project root
cd "$PROJECT_ROOT"

# Check for required environment variables
echo -e "${BLUE}🔍 Checking environment configuration...${NC}"

if [ ! -f ".env" ] && [ "$ENV_NAME" = "production" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Make sure environment variables are set in Vercel dashboard.${NC}"
    echo ""
fi

# Verify vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ vercel.json not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Configuration files verified"
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
    pnpm --filter=@e2o/web typecheck || {
        echo -e "${RED}❌ Typecheck failed${NC}"
        exit 1
    }
    echo -e "${GREEN}✓${NC} Typecheck passed"
    echo ""
fi

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
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
vercel $DEPLOY_ARGS --yes

# Check deployment status
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ Deployment Successful!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if [ "$ENV_NAME" = "preview" ]; then
        echo -e "${BLUE}🔗 Your preview deployment is ready!${NC}"
        echo -e "${BLUE}   Check the URL above to access your deployment.${NC}"
    else
        echo -e "${GREEN}🌍 Your production site is now live!${NC}"
    fi

    echo ""
    echo -e "${BLUE}📊 Next steps:${NC}"
    echo -e "   • Visit the Vercel dashboard to view logs and analytics"
    echo -e "   • Make sure all environment variables are set correctly"
    echo -e "   • Test the deployment thoroughly"
    echo ""
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ Deployment Failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Please check the error messages above and try again.${NC}"
    echo ""
    exit 1
fi
