#!/bin/bash

# =============================================================================
# EARTH TO ORBIT - Automated Deployment Script
# =============================================================================
# This script automates the complete deployment process including:
# - Docker installation
# - SSL certificate setup with Let's Encrypt
# - Environment configuration
# - Service orchestration
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# =============================================================================
# Utility Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# =============================================================================
# Argument Parsing
# =============================================================================

DOMAIN=""
EMAIL=""

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Automated deployment script for Earth To Orbit platform.

OPTIONS:
    -d, --domain DOMAIN     Domain name (e.g., example.com)
    -e, --email EMAIL       Email for SSL certificates
    -h, --help              Show this help message

EXAMPLES:
    $0 --domain example.com --email admin@example.com
    $0 -d example.com -e admin@example.com

If domain and email are not provided, the script will prompt for them.

EOF
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -e|--email)
            EMAIL="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# =============================================================================
# Interactive Prompts
# =============================================================================

if [ -z "$DOMAIN" ]; then
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
fi

if [ -z "$EMAIL" ]; then
    read -p "Enter your email for SSL certificates: " EMAIL
fi

# Validate inputs
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    log_error "Domain and email are required!"
    exit 1
fi

log_info "Deployment Configuration:"
log_info "  Domain: $DOMAIN"
log_info "  Email: $EMAIL"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warn "Deployment cancelled"
    exit 0
fi

# =============================================================================
# System Requirements Check
# =============================================================================

log_info "Checking system requirements..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_warn "This script should be run as root or with sudo"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    log_error "Cannot detect operating system"
    exit 1
fi

log_info "Detected OS: $OS $VER"

# =============================================================================
# Docker Installation
# =============================================================================

if ! command_exists docker; then
    log_warn "Docker is not installed. Installing Docker..."

    case $OS in
        ubuntu|debian)
            apt-get update
            apt-get install -y ca-certificates curl gnupg lsb-release

            # Add Docker's official GPG key
            mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

            # Set up repository
            echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
                $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

            # Install Docker
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;

        centos|rhel|fedora)
            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            systemctl start docker
            systemctl enable docker
            ;;

        *)
            log_error "Unsupported operating system: $OS"
            log_info "Please install Docker manually: https://docs.docker.com/engine/install/"
            exit 1
            ;;
    esac

    log_success "Docker installed successfully"
else
    log_success "Docker is already installed"
fi

# Verify Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# =============================================================================
# Docker Compose Check
# =============================================================================

if ! command_exists docker-compose && ! docker compose version > /dev/null 2>&1; then
    log_warn "Docker Compose not found. Installing..."

    # Try Docker Compose plugin first
    if docker compose version > /dev/null 2>&1; then
        log_success "Docker Compose plugin is available"
        DOCKER_COMPOSE="docker compose"
    else
        # Install standalone docker-compose
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        DOCKER_COMPOSE="docker-compose"
    fi
else
    if command_exists docker-compose; then
        DOCKER_COMPOSE="docker-compose"
    else
        DOCKER_COMPOSE="docker compose"
    fi
    log_success "Docker Compose is available"
fi

# =============================================================================
# Environment Configuration
# =============================================================================

log_info "Configuring environment variables..."

ENV_FILE=".env"

# Create .env from template if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example "$ENV_FILE"
        log_success "Created .env from template"
    else
        log_error ".env.example not found"
        exit 1
    fi
fi

# Function to update or add environment variable
update_env() {
    local key=$1
    local value=$2

    if grep -q "^${key}=" "$ENV_FILE"; then
        # Update existing
        sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
        # Add new
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

# Set domain and email
update_env "DOMAIN" "$DOMAIN"
update_env "SSL_EMAIL" "$EMAIL"

# Auto-generate URLs
update_env "FRONTEND_URL" "https://${DOMAIN}"
update_env "API_URL" "https://api.${DOMAIN}"
update_env "NEXT_PUBLIC_API_URL" "https://api.${DOMAIN}"

# Auto-generate JWT secrets if not set
if ! grep -q "^JWT_SECRET=.\+" "$ENV_FILE"; then
    JWT_SECRET=$(generate_secret)
    update_env "JWT_SECRET" "$JWT_SECRET"
    log_success "Generated JWT_SECRET"
fi

if ! grep -q "^JWT_REFRESH_SECRET=.\+" "$ENV_FILE"; then
    JWT_REFRESH_SECRET=$(generate_secret)
    update_env "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET"
    log_success "Generated JWT_REFRESH_SECRET"
fi

# Check for required variables
log_info "Checking required environment variables..."

REQUIRED_VARS=(
    "MONGODB_PASSWORD"
    "SMTP_USER"
    "SMTP_PASSWORD"
    "DEMO_PLATFORM_ADMIN_EMAIL"
    "DEMO_PLATFORM_ADMIN_PASSWORD"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=.\+" "$ENV_FILE"; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    log_error "The following required environment variables are not set:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    log_info "Please edit .env file and set these variables before continuing."
    exit 1
fi

log_success "Environment configuration complete"

# =============================================================================
# Nginx Configuration
# =============================================================================

log_info "Configuring Nginx with domain..."

# Replace ${DOMAIN} placeholders in nginx config
sed -i "s/\${DOMAIN}/${DOMAIN}/g" nginx/conf.d/default.conf

log_success "Nginx configured for domain: $DOMAIN"

# =============================================================================
# DNS Verification
# =============================================================================

log_info "Verifying DNS configuration..."

DOMAIN_IP=$(dig +short "$DOMAIN" | tail -n1)
API_DOMAIN_IP=$(dig +short "api.$DOMAIN" | tail -n1)
SERVER_IP=$(curl -s ifconfig.me)

if [ -z "$DOMAIN_IP" ]; then
    log_warn "DNS for $DOMAIN is not configured"
    log_info "Please add an A record pointing $DOMAIN to $SERVER_IP"
fi

if [ -z "$API_DOMAIN_IP" ]; then
    log_warn "DNS for api.$DOMAIN is not configured"
    log_info "Please add an A record pointing api.$DOMAIN to $SERVER_IP"
fi

if [ -n "$DOMAIN_IP" ] && [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    log_warn "DNS $DOMAIN points to $DOMAIN_IP but server IP is $SERVER_IP"
fi

if [ -n "$API_DOMAIN_IP" ] && [ "$API_DOMAIN_IP" != "$SERVER_IP" ]; then
    log_warn "DNS api.$DOMAIN points to $API_DOMAIN_IP but server IP is $SERVER_IP"
fi

if [ -z "$DOMAIN_IP" ] || [ -z "$API_DOMAIN_IP" ]; then
    log_warn "DNS configuration may not be complete"
    read -p "Continue anyway? SSL setup will fail without proper DNS. (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# =============================================================================
# Firewall Configuration
# =============================================================================

log_info "Checking firewall configuration..."

if command_exists ufw; then
    log_info "Configuring UFW firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    log_success "Firewall rules added for HTTP (80) and HTTPS (443)"
elif command_exists firewall-cmd; then
    log_info "Configuring firewalld..."
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    log_success "Firewall rules added for HTTP and HTTPS"
else
    log_warn "No supported firewall detected. Make sure ports 80 and 443 are open."
fi

# =============================================================================
# Docker Build and Deployment
# =============================================================================

log_info "Building and starting Docker containers..."

# Stop existing containers
$DOCKER_COMPOSE down 2>/dev/null || true

# Build images
log_info "Building Docker images (this may take several minutes)..."
$DOCKER_COMPOSE build --no-cache

# Start services
log_info "Starting services..."
$DOCKER_COMPOSE up -d mongodb api web nginx

# Wait for services to be healthy
log_info "Waiting for services to start..."
sleep 30

# Check service health
log_info "Checking service health..."

RETRIES=0
MAX_RETRIES=30

while [ $RETRIES -lt $MAX_RETRIES ]; do
    if docker ps | grep -q "e2o-api.*healthy" && docker ps | grep -q "e2o-web.*healthy"; then
        log_success "All services are healthy"
        break
    fi

    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -eq $MAX_RETRIES ]; then
        log_error "Services did not become healthy in time"
        log_info "Check logs with: $DOCKER_COMPOSE logs"
        exit 1
    fi

    log_info "Waiting for services... ($RETRIES/$MAX_RETRIES)"
    sleep 10
done

# =============================================================================
# SSL Certificate Setup
# =============================================================================

log_info "Setting up SSL certificates..."

# First, start nginx without SSL to get certificates
log_info "Obtaining SSL certificates from Let's Encrypt..."

# Run certbot
$DOCKER_COMPOSE run --rm certbot || {
    log_warn "SSL certificate generation failed"
    log_info "You can manually run: $DOCKER_COMPOSE run --rm certbot"
    log_info "Make sure DNS is properly configured and ports 80/443 are accessible"
}

# Restart nginx to apply SSL
log_info "Restarting Nginx with SSL..."
$DOCKER_COMPOSE restart nginx

# =============================================================================
# Database Seeding
# =============================================================================

log_info "Would you like to seed the database with sample data? (recommended for first-time setup)"
read -p "Seed database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Seeding database..."
    docker exec -it e2o-api node /app/scripts/seed-data.js || {
        log_warn "Database seeding failed. You can manually run:"
        log_info "  docker exec -it e2o-api node /app/scripts/seed-data.js"
    }
fi

# =============================================================================
# Completion
# =============================================================================

log_success "=========================================="
log_success "Deployment completed successfully!"
log_success "=========================================="
echo ""
log_info "Your application is now running at:"
log_info "  Web: https://${DOMAIN}"
log_info "  API: https://api.${DOMAIN}"
echo ""
log_info "Platform Admin Credentials:"
log_info "  Email: $(grep DEMO_PLATFORM_ADMIN_EMAIL .env | cut -d'=' -f2)"
log_info "  Password: $(grep DEMO_PLATFORM_ADMIN_PASSWORD .env | cut -d'=' -f2)"
echo ""
log_info "Useful commands:"
log_info "  View logs: $DOCKER_COMPOSE logs -f"
log_info "  Stop services: $DOCKER_COMPOSE down"
log_info "  Restart services: $DOCKER_COMPOSE restart"
log_info "  View status: $DOCKER_COMPOSE ps"
echo ""
log_warn "IMPORTANT: Keep your .env file secure and never commit it to version control!"
echo ""

# =============================================================================
# SSL Renewal Cron Job
# =============================================================================

log_info "Would you like to set up automatic SSL certificate renewal? (recommended)"
read -p "Setup auto-renewal? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    CRON_CMD="0 0 * * * cd $SCRIPT_DIR && $DOCKER_COMPOSE run --rm certbot renew && $DOCKER_COMPOSE restart nginx"
    (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
    log_success "SSL auto-renewal cron job added"
fi

log_success "Setup complete! 🚀"
