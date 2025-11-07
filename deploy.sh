#!/bin/bash

# =============================================================================
# EARTH TO ORBIT - SSH-Based Automated Deployment Script
# =============================================================================
# This script automates the complete deployment process including:
# - Remote SSH deployment support
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
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

log_section() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# Generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate email format
validate_email() {
    local email=$1
    if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Validate domain format
validate_domain() {
    local domain=$1
    if [[ $domain =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# Welcome Banner
# =============================================================================

clear
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         EARTH TO ORBIT - Deployment Configuration            ║
║                                                               ║
║    Automated Docker deployment with SSL and SSH support       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

EOF

log_info "This script will guide you through the deployment process."
log_info "All required information will be collected upfront."
echo ""

# =============================================================================
# Deployment Mode Selection
# =============================================================================

log_section "STEP 1: Deployment Mode"

echo "Select deployment mode:"
echo "  1) Local deployment (deploy on this machine)"
echo "  2) Remote deployment (deploy via SSH to remote server)"
echo ""
read -p "Enter your choice [1-2]: " DEPLOY_MODE

case $DEPLOY_MODE in
    1)
        DEPLOYMENT_TYPE="local"
        log_success "Selected: Local deployment"
        ;;
    2)
        DEPLOYMENT_TYPE="remote"
        log_success "Selected: Remote deployment via SSH"
        ;;
    *)
        log_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# =============================================================================
# SSH Configuration (for remote deployment)
# =============================================================================

if [ "$DEPLOYMENT_TYPE" = "remote" ]; then
    log_section "STEP 2: SSH Configuration"

    echo "Enter SSH connection details:"
    echo ""

    read -p "SSH Host (IP or hostname): " SSH_HOST
    read -p "SSH Port [22]: " SSH_PORT
    SSH_PORT=${SSH_PORT:-22}

    read -p "SSH User: " SSH_USER

    echo ""
    echo "SSH Authentication method:"
    echo "  1) Password"
    echo "  2) SSH Key"
    read -p "Enter your choice [1-2]: " SSH_AUTH_METHOD

    if [ "$SSH_AUTH_METHOD" = "1" ]; then
        read -sp "SSH Password: " SSH_PASSWORD
        echo ""
        SSH_AUTH="password"
    else
        read -p "Path to SSH private key [~/.ssh/id_rsa]: " SSH_KEY_PATH
        SSH_KEY_PATH=${SSH_KEY_PATH:-~/.ssh/id_rsa}

        if [ ! -f "$SSH_KEY_PATH" ]; then
            log_error "SSH key not found at: $SSH_KEY_PATH"
            exit 1
        fi
        SSH_AUTH="key"
    fi

    # Test SSH connection
    log_info "Testing SSH connection..."

    if [ "$SSH_AUTH" = "password" ]; then
        if command_exists sshpass; then
            if sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "echo 'SSH connection successful'" > /dev/null 2>&1; then
                log_success "SSH connection test passed"
            else
                log_error "SSH connection failed. Please check your credentials."
                exit 1
            fi
        else
            log_warn "sshpass not installed. Skipping SSH connection test."
            log_info "Install sshpass: sudo apt-get install sshpass (Ubuntu/Debian)"
        fi
    else
        if ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "echo 'SSH connection successful'" > /dev/null 2>&1; then
            log_success "SSH connection test passed"
        else
            log_error "SSH connection failed. Please check your SSH key and credentials."
            exit 1
        fi
    fi
fi

# =============================================================================
# Domain Configuration
# =============================================================================

log_section "STEP 3: Domain Configuration"

echo "Configure your domain names:"
echo ""

# Web Domain
while true; do
    read -p "Web Frontend Domain (e.g., myapp.com): " WEB_DOMAIN
    if validate_domain "$WEB_DOMAIN"; then
        log_success "Web domain: $WEB_DOMAIN"
        break
    else
        log_error "Invalid domain format. Please enter a valid domain."
    fi
done

echo ""

# API Domain
while true; do
    read -p "API Backend Domain (e.g., api.myapp.com): " API_DOMAIN
    if validate_domain "$API_DOMAIN"; then
        log_success "API domain: $API_DOMAIN"
        break
    else
        log_error "Invalid domain format. Please enter a valid domain."
    fi
done

# =============================================================================
# SSL Certificate Configuration
# =============================================================================

log_section "STEP 4: SSL Certificate Configuration"

echo "Enter email for Let's Encrypt SSL certificates:"
echo "(Used for certificate expiration notifications)"
echo ""

while true; do
    read -p "SSL Certificate Email: " SSL_EMAIL
    if validate_email "$SSL_EMAIL"; then
        log_success "SSL email: $SSL_EMAIL"
        break
    else
        log_error "Invalid email format. Please enter a valid email."
    fi
done

# =============================================================================
# Database Configuration
# =============================================================================

log_section "STEP 5: Database Configuration"

echo "Configure MongoDB database credentials:"
echo ""

read -p "MongoDB Username [admin]: " MONGODB_USER
MONGODB_USER=${MONGODB_USER:-admin}

while true; do
    read -sp "MongoDB Password: " MONGODB_PASSWORD
    echo ""
    read -sp "Confirm MongoDB Password: " MONGODB_PASSWORD_CONFIRM
    echo ""

    if [ "$MONGODB_PASSWORD" = "$MONGODB_PASSWORD_CONFIRM" ]; then
        if [ ${#MONGODB_PASSWORD} -lt 8 ]; then
            log_error "Password must be at least 8 characters long"
        else
            log_success "MongoDB credentials configured"
            break
        fi
    else
        log_error "Passwords do not match. Please try again."
    fi
done

# =============================================================================
# Email Service Configuration (SMTP)
# =============================================================================

log_section "STEP 6: Email Service Configuration (SMTP)"

echo "Configure SMTP for sending emails (notifications, password resets, etc.):"
echo ""

read -p "SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST
read -p "SMTP Port [587]: " SMTP_PORT
SMTP_PORT=${SMTP_PORT:-587}

while true; do
    read -p "SMTP Username/Email: " SMTP_USER
    if validate_email "$SMTP_USER"; then
        break
    else
        log_error "Invalid email format for SMTP user"
    fi
done

read -sp "SMTP Password: " SMTP_PASSWORD
echo ""

read -p "SMTP From Name [Earth To Orbit]: " SMTP_FROM_NAME
SMTP_FROM_NAME=${SMTP_FROM_NAME:-Earth To Orbit}

log_success "SMTP configuration complete"

# =============================================================================
# Platform Admin Configuration
# =============================================================================

log_section "STEP 7: Platform Admin Account"

echo "Create the initial Platform Admin account:"
echo "(This account will have full system access)"
echo ""

read -p "Admin First Name: " ADMIN_FIRST_NAME
read -p "Admin Last Name: " ADMIN_LAST_NAME

while true; do
    read -p "Admin Email: " ADMIN_EMAIL
    if validate_email "$ADMIN_EMAIL"; then
        break
    else
        log_error "Invalid email format"
    fi
done

read -p "Admin Phone: " ADMIN_PHONE

while true; do
    read -sp "Admin Password: " ADMIN_PASSWORD
    echo ""
    read -sp "Confirm Admin Password: " ADMIN_PASSWORD_CONFIRM
    echo ""

    if [ "$ADMIN_PASSWORD" = "$ADMIN_PASSWORD_CONFIRM" ]; then
        if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
            log_error "Password must be at least 8 characters long"
        else
            log_success "Admin account configured"
            break
        fi
    else
        log_error "Passwords do not match. Please try again."
    fi
done

# =============================================================================
# JWT Secret Generation
# =============================================================================

log_section "STEP 8: Security Configuration"

log_info "Generating secure JWT secrets..."
JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)
log_success "JWT secrets generated"

# =============================================================================
# Optional Configuration
# =============================================================================

log_section "STEP 9: Optional Configuration"

echo "Additional configuration options:"
echo ""

read -p "Enable database seeding with sample data? [y/n]: " SEED_DATABASE
read -p "Setup automatic SSL certificate renewal? [y/n]: " AUTO_SSL_RENEWAL

# =============================================================================
# Configuration Summary
# =============================================================================

log_section "Configuration Summary"

cat << EOF
${CYAN}Deployment Configuration:${NC}
  Mode:               $DEPLOYMENT_TYPE
EOF

if [ "$DEPLOYMENT_TYPE" = "remote" ]; then
cat << EOF
  SSH Host:           $SSH_USER@$SSH_HOST:$SSH_PORT
  SSH Auth:           $SSH_AUTH
EOF
fi

cat << EOF

${CYAN}Domain Configuration:${NC}
  Web Domain:         https://$WEB_DOMAIN
  API Domain:         https://$API_DOMAIN
  SSL Email:          $SSL_EMAIL

${CYAN}Database:${NC}
  MongoDB User:       $MONGODB_USER
  MongoDB Password:   ******* (hidden)

${CYAN}Email Service:${NC}
  SMTP Host:          $SMTP_HOST:$SMTP_PORT
  SMTP User:          $SMTP_USER
  From Name:          $SMTP_FROM_NAME

${CYAN}Platform Admin:${NC}
  Name:               $ADMIN_FIRST_NAME $ADMIN_LAST_NAME
  Email:              $ADMIN_EMAIL
  Phone:              $ADMIN_PHONE

${CYAN}Security:${NC}
  JWT Secrets:        Auto-generated

${CYAN}Options:${NC}
  Seed Database:      $SEED_DATABASE
  Auto SSL Renewal:   $AUTO_SSL_RENEWAL

EOF

echo ""
read -p "Proceed with deployment? [y/n]: " CONFIRM_DEPLOY

if [[ ! $CONFIRM_DEPLOY =~ ^[Yy]$ ]]; then
    log_warn "Deployment cancelled by user"
    exit 0
fi

# =============================================================================
# Create Environment File
# =============================================================================

log_section "Creating Environment Configuration"

ENV_CONTENT="# Earth To Orbit - Environment Configuration
# Generated: $(date)

# ============================================
# DOMAIN CONFIGURATION
# ============================================
WEB_DOMAIN=$WEB_DOMAIN
API_DOMAIN=$API_DOMAIN
DOMAIN=$WEB_DOMAIN
SSL_EMAIL=$SSL_EMAIL

# ============================================
# APPLICATION URLS (Auto-configured)
# ============================================
FRONTEND_URL=https://$WEB_DOMAIN
API_URL=https://$API_DOMAIN
NEXT_PUBLIC_API_URL=https://$API_DOMAIN

# ============================================
# DATABASE CONFIGURATION
# ============================================
MONGODB_URI=mongodb://$MONGODB_USER:$MONGODB_PASSWORD@mongodb:27017/earth-to-orbit?authSource=admin
MONGODB_USER=$MONGODB_USER
MONGODB_PASSWORD=$MONGODB_PASSWORD
MONGODB_DATABASE=earth-to-orbit

# ============================================
# JWT SECRETS (Auto-generated)
# ============================================
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
SMTP_FROM_NAME=$SMTP_FROM_NAME
SMTP_FROM_EMAIL=$SMTP_USER

# ============================================
# PLATFORM ADMIN ACCOUNT
# ============================================
DEMO_PLATFORM_ADMIN_FIRST_NAME=$ADMIN_FIRST_NAME
DEMO_PLATFORM_ADMIN_LAST_NAME=$ADMIN_LAST_NAME
DEMO_PLATFORM_ADMIN_EMAIL=$ADMIN_EMAIL
DEMO_PLATFORM_ADMIN_PASSWORD=$ADMIN_PASSWORD
DEMO_PLATFORM_ADMIN_PHONE=$ADMIN_PHONE

# ============================================
# APPLICATION SETTINGS
# ============================================
NODE_ENV=production
PORT=5000
NEXT_PUBLIC_APP_NAME=Earth To Orbit

# ============================================
# PAYMENT GATEWAY (Optional - Configure later)
# ============================================
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
"

# Write .env file
echo "$ENV_CONTENT" > "$SCRIPT_DIR/.env"
log_success "Environment file created: .env"

# =============================================================================
# Update Nginx Configuration
# =============================================================================

log_info "Updating Nginx configuration..."

# Update nginx config with both domains
sed -i "s/\${DOMAIN}/$WEB_DOMAIN/g" "$SCRIPT_DIR/nginx/conf.d/default.conf"
sed -i "s/server_name.*;/server_name $WEB_DOMAIN;/g" "$SCRIPT_DIR/nginx/conf.d/default.conf"

# Create API domain configuration if not exists
if ! grep -q "$API_DOMAIN" "$SCRIPT_DIR/nginx/conf.d/default.conf"; then
    log_info "Adding API domain to nginx configuration..."
    # The nginx config should already have api domain setup, just update it
    sed -i "s/server_name api\.\${DOMAIN};/server_name $API_DOMAIN;/g" "$SCRIPT_DIR/nginx/conf.d/default.conf"
fi

log_success "Nginx configuration updated"

# =============================================================================
# Define Deployment Function
# =============================================================================

deploy_application() {
    local target=$1  # 'local' or ssh connection string

    if [ "$target" = "local" ]; then
        RUN_CMD=""
    else
        RUN_CMD="$target"
    fi

    # Function to execute commands
    exec_cmd() {
        if [ -z "$RUN_CMD" ]; then
            eval "$1"
        else
            $RUN_CMD "$1"
        fi
    }

    # =========================================================================
    # System Requirements Check
    # =========================================================================

    log_section "System Requirements Check"

    log_info "Detecting operating system..."
    OS_INFO=$(exec_cmd "cat /etc/os-release 2>/dev/null || echo 'unknown'")

    if [[ $OS_INFO == *"unknown"* ]]; then
        log_error "Cannot detect operating system"
        exit 1
    fi

    log_success "Operating system detected"

    # =========================================================================
    # Docker Installation
    # =========================================================================

    log_section "Docker Installation"

    if exec_cmd "command -v docker >/dev/null 2>&1"; then
        log_success "Docker is already installed"
    else
        log_warn "Docker is not installed. Installing Docker..."

        # Detect OS and install Docker
        if [[ $OS_INFO == *"ubuntu"* ]] || [[ $OS_INFO == *"debian"* ]]; then
            exec_cmd "apt-get update && apt-get install -y ca-certificates curl gnupg lsb-release"
            exec_cmd "mkdir -p /etc/apt/keyrings"
            exec_cmd "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg"
            exec_cmd "echo 'deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable' | tee /etc/apt/sources.list.d/docker.list > /dev/null"
            exec_cmd "apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"
            log_success "Docker installed successfully"
        elif [[ $OS_INFO == *"centos"* ]] || [[ $OS_INFO == *"rhel"* ]] || [[ $OS_INFO == *"fedora"* ]]; then
            exec_cmd "yum install -y yum-utils"
            exec_cmd "yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo"
            exec_cmd "yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"
            exec_cmd "systemctl start docker && systemctl enable docker"
            log_success "Docker installed successfully"
        else
            log_error "Unsupported operating system for automatic Docker installation"
            exit 1
        fi
    fi

    # =========================================================================
    # Firewall Configuration
    # =========================================================================

    log_section "Firewall Configuration"

    if exec_cmd "command -v ufw >/dev/null 2>&1"; then
        exec_cmd "ufw allow 80/tcp && ufw allow 443/tcp"
        log_success "UFW firewall configured"
    elif exec_cmd "command -v firewall-cmd >/dev/null 2>&1"; then
        exec_cmd "firewall-cmd --permanent --add-service=http && firewall-cmd --permanent --add-service=https && firewall-cmd --reload"
        log_success "firewalld configured"
    else
        log_warn "No firewall detected. Ensure ports 80 and 443 are open."
    fi

    # =========================================================================
    # DNS Verification
    # =========================================================================

    log_section "DNS Verification"

    WEB_IP=$(dig +short "$WEB_DOMAIN" | tail -n1)
    API_IP=$(dig +short "$API_DOMAIN" | tail -n1)

    if [ -z "$WEB_IP" ]; then
        log_warn "DNS for $WEB_DOMAIN is not configured"
    else
        log_success "DNS for $WEB_DOMAIN: $WEB_IP"
    fi

    if [ -z "$API_IP" ]; then
        log_warn "DNS for $API_DOMAIN is not configured"
    else
        log_success "DNS for $API_DOMAIN: $API_IP"
    fi

    if [ -z "$WEB_IP" ] || [ -z "$API_IP" ]; then
        log_warn "Please configure DNS records before SSL setup"
        read -p "Continue anyway? (SSL will fail) [y/n]: " DNS_CONTINUE
        if [[ ! $DNS_CONTINUE =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# =============================================================================
# Execute Deployment
# =============================================================================

if [ "$DEPLOYMENT_TYPE" = "local" ]; then
    cd "$SCRIPT_DIR"
    deploy_application "local"

    # Build and start services
    log_section "Building and Starting Services"

    log_info "Building Docker images..."
    docker compose build --no-cache

    log_info "Starting services..."
    docker compose up -d mongodb api web nginx

    log_info "Waiting for services to be healthy..."
    sleep 30

    # Check health
    RETRIES=0
    MAX_RETRIES=30
    while [ $RETRIES -lt $MAX_RETRIES ]; do
        if docker ps | grep -q "healthy"; then
            log_success "Services are healthy"
            break
        fi
        RETRIES=$((RETRIES + 1))
        if [ $RETRIES -eq $MAX_RETRIES ]; then
            log_error "Services did not become healthy"
            docker compose logs
            exit 1
        fi
        sleep 10
    done

    # SSL Setup
    log_section "SSL Certificate Setup"
    docker compose run --rm certbot || log_warn "SSL setup failed - configure manually later"
    docker compose restart nginx

    # Database seeding
    if [[ $SEED_DATABASE =~ ^[Yy]$ ]]; then
        log_section "Database Seeding"
        docker exec -it e2o-api node /app/scripts/seed-data.js || log_warn "Seeding failed"
    fi

    # SSL Auto-renewal
    if [[ $AUTO_SSL_RENEWAL =~ ^[Yy]$ ]]; then
        CRON_CMD="0 0 * * * cd $SCRIPT_DIR && docker compose run --rm certbot renew && docker compose restart nginx"
        (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
        log_success "SSL auto-renewal configured"
    fi

else
    # Remote deployment
    log_section "Remote Deployment"

    # Build SSH command
    if [ "$SSH_AUTH" = "password" ]; then
        SSH_CMD="sshpass -p '$SSH_PASSWORD' ssh -p $SSH_PORT $SSH_USER@$SSH_HOST"
        SCP_CMD="sshpass -p '$SSH_PASSWORD' scp -P $SSH_PORT"
    else
        SSH_CMD="ssh -i $SSH_KEY_PATH -p $SSH_PORT $SSH_USER@$SSH_HOST"
        SCP_CMD="scp -i $SSH_KEY_PATH -P $SSH_PORT"
    fi

    log_info "Copying files to remote server..."
    $SCP_CMD -r "$SCRIPT_DIR"/* "$SSH_USER@$SSH_HOST:/tmp/e2o-deploy/"

    log_info "Executing deployment on remote server..."
    $SSH_CMD "cd /tmp/e2o-deploy && bash deploy.sh --local-exec"
fi

# =============================================================================
# Deployment Complete
# =============================================================================

log_section "🎉 Deployment Complete!"

cat << EOF

${GREEN}Your Earth To Orbit platform is now running!${NC}

${CYAN}Access URLs:${NC}
  🌐 Web:  https://$WEB_DOMAIN
  🔌 API:  https://$API_DOMAIN

${CYAN}Platform Admin Login:${NC}
  📧 Email:    $ADMIN_EMAIL
  🔑 Password: $ADMIN_PASSWORD

${CYAN}Useful Commands:${NC}
  📋 View logs:        docker compose logs -f
  🔄 Restart:          docker compose restart
  🛑 Stop:             docker compose down
  📊 Status:           docker compose ps

${YELLOW}⚠️  IMPORTANT SECURITY NOTES:${NC}
  • Keep your .env file secure
  • Change admin password after first login
  • Configure backup strategy
  • Review firewall rules

EOF

log_success "Setup complete! 🚀"
