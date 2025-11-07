# Earth To Orbit - Complete Deployment Guide

## 📋 Overview

This guide explains how to deploy the Earth To Orbit platform using the automated deployment script. The script supports both **local** and **SSH-based remote** deployment with complete configuration management.

---

## 🚀 Quick Start

### Prerequisites

**What you need:**
- Linux server - **Supports Ubuntu Server** (20.04+, 22.04, 24.04), Debian, CentOS, RHEL, or Fedora
- Root/sudo access
- Two domain names configured:
  - Web domain (e.g., `myapp.com`)
  - API domain (e.g., `api.myapp.com`)
- SMTP credentials for email notifications
- SSH access (for remote deployment)

### One-Command Deployment

```bash
sudo bash deploy.sh
```

The script will interactively guide you through all configuration steps.

### Save & Auto-Deploy Features

**Save configuration for reuse:**
```bash
sudo bash deploy.sh --with-save
```
Saves all your answers to `.deploy-config.env` for future deployments.

**Automatic deployment with saved config:**
```bash
sudo bash deploy.sh --auto-deploy
```
Uses the saved configuration file to deploy automatically without prompts.

**Use custom config file:**
```bash
sudo bash deploy.sh --auto-deploy --config /path/to/my-config.env
```

**⚠️ Security Note:** The `.deploy-config.env` file contains sensitive information (passwords, API keys). Keep it secure and never commit it to version control!

---

## 📝 Deployment Steps

### STEP 1: Deployment Mode Selection

**Choose your deployment type:**

```
Select deployment mode:
  1) Local deployment (deploy on this machine)
  2) Remote deployment (deploy via SSH to remote server)
```

- **Option 1 (Local)**: Deploy directly on the current machine
- **Option 2 (Remote)**: Deploy to a remote server via SSH

---

### STEP 2: SSH Configuration (Remote Only)

**If you selected remote deployment, provide SSH details:**

```
SSH Host (IP or hostname): 192.168.1.100
SSH Port [22]: 22
SSH User: root
```

**Authentication Method:**
```
SSH Authentication method:
  1) Password
  2) SSH Key
```

**For Password Authentication:**
```
SSH Password: ********
```

**For SSH Key Authentication:**
```
Path to SSH private key [~/.ssh/id_rsa]: /home/user/.ssh/mykey
```

The script will **test the SSH connection** before proceeding.

---

### STEP 3: Domain Configuration

**Configure separate domains for web and API:**

```
Web Frontend Domain (e.g., myapp.com): earthtoorbit.com
API Backend Domain (e.g., api.myapp.com): api.earthtoorbit.com
```

**Important:**
- Domains are validated for proper format
- Both domains must have DNS A records pointing to your server IP
- They can be subdomains or completely different domains

**Examples:**
- Web: `mycompany.com` | API: `api.mycompany.com`
- Web: `app.example.com` | API: `backend.example.com`
- Web: `satellite-testing.io` | API: `api-v2.satellite-testing.io`

---

### STEP 4: SSL Certificate Configuration

**Email for Let's Encrypt SSL certificates:**

```
SSL Certificate Email: admin@mycompany.com
```

This email receives:
- Certificate expiration notifications (30 days before expiry)
- Important security updates from Let's Encrypt

---

### STEP 5: Database Configuration

**MongoDB credentials:**

```
MongoDB Username [admin]: admin
MongoDB Password: ****************
Confirm MongoDB Password: ****************
```

**Requirements:**
- Password must be **at least 8 characters**
- Passwords must match
- Avoid special characters that require escaping: `$ " ' \`

---

### STEP 6: Email Service Configuration (SMTP)

**Configure email service for notifications:**

```
SMTP Host (e.g., smtp.gmail.com): smtp.gmail.com
SMTP Port [587]: 587
SMTP Username/Email: noreply@mycompany.com
SMTP Password: ****************
SMTP From Name [Earth To Orbit]: My Company Testing Platform
```

**Common SMTP Providers:**

| Provider | Host | Port | Notes |
|----------|------|------|-------|
| Gmail | smtp.gmail.com | 587 | Requires [App Password](https://support.google.com/accounts/answer/185833) |
| SendGrid | smtp.sendgrid.net | 587 | Use API key as password |
| AWS SES | email-smtp.region.amazonaws.com | 587 | Requires SMTP credentials |
| Mailgun | smtp.mailgun.org | 587 | Use domain credentials |
| Outlook | smtp-mail.outlook.com | 587 | Use account password |

---

### STEP 7: Platform Admin Account

**Create the initial super admin:**

```
Admin First Name: John
Admin Last Name: Doe
Admin Email: admin@mycompany.com
Admin Phone: +1-555-0100
Admin Password: ****************
Confirm Admin Password: ****************
```

**This account has full access to:**
- All admin dashboards
- User management
- Organization management
- Finance & billing
- Catalog management (sites, labs, components, staff)
- Request approval/rejection

---

### STEP 8: Security Configuration

**JWT secrets are auto-generated:**

```
[SUCCESS] JWT secrets generated
```

Two cryptographically secure 32-character secrets are created:
- `JWT_SECRET` - For access tokens (24h validity)
- `JWT_REFRESH_SECRET` - For refresh tokens (7d validity)

---

### STEP 9: Optional Configuration

```
Enable database seeding with sample data? [y/n]: y
Setup automatic SSL certificate renewal? [y/n]: y
```

**Database Seeding** includes:
- Sample categories (TVAC, Vibration, EMI/EMC, etc.)
- Demo testing sites
- Example labs with pricing
- Sample components
- Staff members

**SSL Auto-Renewal:**
- Sets up daily cron job
- Automatically renews certificates 30 days before expiry
- Restarts Nginx after renewal

---

### Configuration Summary

**Review all settings before deployment:**

```
========================================
Configuration Summary
========================================

Deployment Configuration:
  Mode:               remote
  SSH Host:           root@192.168.1.100:22
  SSH Auth:           key

Domain Configuration:
  Web Domain:         https://earthtoorbit.com
  API Domain:         https://api.earthtoorbit.com
  SSL Email:          admin@earthtoorbit.com

Database:
  MongoDB User:       admin
  MongoDB Password:   ******* (hidden)

Email Service:
  SMTP Host:          smtp.gmail.com:587
  SMTP User:          noreply@earthtoorbit.com
  From Name:          Earth To Orbit

Platform Admin:
  Name:               John Doe
  Email:              admin@earthtoorbit.com
  Phone:              +1-555-0100

Security:
  JWT Secrets:        Auto-generated

Options:
  Seed Database:      y
  Auto SSL Renewal:   y

Proceed with deployment? [y/n]:
```

---

## 🔧 What Happens During Deployment

### 1. Environment File Creation
- Creates `.env` file with all configurations
- Generates secure JWT secrets
- Sets up database connection strings
- Configures SMTP settings

### 2. Nginx Configuration
- Updates reverse proxy settings
- Configures web domain → frontend
- Configures API domain → backend API
- Prepares SSL certificate paths

### 3. System Requirements Check
- Detects operating system
- Verifies compatibility

### 4. Docker Installation (if needed)
**For Ubuntu/Debian:**
```bash
- Adds Docker official repository
- Installs Docker Engine, CLI, Compose
- Starts Docker service
```

**For CentOS/RHEL/Fedora:**
```bash
- Adds Docker repository
- Installs Docker packages
- Enables Docker service
```

### 5. Firewall Configuration
**Opens required ports:**
- Port 80 (HTTP) - for Let's Encrypt verification
- Port 443 (HTTPS) - for secure web traffic

### 6. DNS Verification
```
[INFO] Checking DNS for earthtoorbit.com...
[SUCCESS] DNS for earthtoorbit.com: 123.45.67.89
[INFO] Checking DNS for api.earthtoorbit.com...
[SUCCESS] DNS for api.earthtoorbit.com: 123.45.67.89
```

**Warnings if:**
- DNS not configured
- DNS points to wrong IP
- Allows you to continue (SSL will fail without proper DNS)

### 7. Docker Build
```
[INFO] Building Docker images (this may take 5-10 minutes)...
```

**Builds 4 containers:**
- **mongodb** - Database (Mongo 7.0)
- **api** - Backend API (Node.js/Express)
- **web** - Frontend (Next.js 14)
- **nginx** - Reverse proxy + SSL termination

### 8. Service Startup
```
[INFO] Starting services...
[INFO] Waiting for services to be healthy...
```

**Health checks** (max 5 minutes):
- Waits for containers to report "healthy"
- Verifies API endpoints responding
- Confirms database connectivity

### 9. SSL Certificate Setup
```
[INFO] Obtaining SSL certificates from Let's Encrypt...
```

**Uses Certbot to:**
- Request certificates for both domains
- Validate domain ownership (HTTP-01 challenge)
- Install certificates
- Restart Nginx with SSL

### 10. Database Seeding (if selected)
```
[INFO] Seeding database with sample data...
```

**Creates:**
- 6 testing categories
- 2 demo sites
- 5 sample labs with hour-based pricing
- 10 components
- 3 staff members
- Platform admin account

### 11. SSL Auto-Renewal Setup (if selected)
```
[SUCCESS] SSL auto-renewal configured
```

**Cron job created:**
```bash
0 0 * * * cd /path/to/project && docker compose run --rm certbot renew && docker compose restart nginx
```

---

## ✅ Post-Deployment

### Success Message

```
========================================
🎉 Deployment Complete!
========================================

Your Earth To Orbit platform is now running!

Access URLs:
  🌐 Web:  https://earthtoorbit.com
  🔌 API:  https://api.earthtoorbit.com

Platform Admin Login:
  📧 Email:    admin@earthtoorbit.com
  🔑 Password: your-password

Useful Commands:
  📋 View logs:        docker compose logs -f
  🔄 Restart:          docker compose restart
  🛑 Stop:             docker compose down
  📊 Status:           docker compose ps

⚠️  IMPORTANT SECURITY NOTES:
  • Keep your .env file secure
  • Change admin password after first login
  • Configure backup strategy
  • Review firewall rules
```

---

## 🔍 Verification

### 1. Check Services
```bash
docker compose ps
```

**Expected output:**
```
NAME                STATUS              PORTS
e2o-mongodb         Up (healthy)        27017/tcp
e2o-api             Up (healthy)        5000/tcp
e2o-web             Up (healthy)        3000/tcp
e2o-nginx           Up                  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 2. Test Web Access
```bash
curl -I https://earthtoorbit.com
```

**Should return:**
```
HTTP/2 200
server: nginx
```

### 3. Test API Access
```bash
curl https://api.earthtoorbit.com/health
```

**Should return:**
```json
{"status": "ok", "timestamp": "2024-01-15T10:30:00.000Z"}
```

### 4. Test SSL Certificates
```bash
echo | openssl s_client -connect earthtoorbit.com:443 2>/dev/null | openssl x509 -noout -dates
```

**Shows certificate validity:**
```
notBefore=Jan 15 00:00:00 2024 GMT
notAfter=Apr 14 23:59:59 2024 GMT
```

---

## 🛠️ Useful Commands

### View Logs

**All services:**
```bash
docker compose logs -f
```

**Specific service:**
```bash
docker compose logs -f api
docker compose logs -f web
docker compose logs -f mongodb
docker compose logs -f nginx
```

### Restart Services

**All services:**
```bash
docker compose restart
```

**Specific service:**
```bash
docker compose restart api
docker compose restart nginx
```

### Stop/Start

```bash
# Stop all
docker compose down

# Start all
docker compose up -d

# Rebuild and restart
docker compose up -d --build
```

### Database Access

```bash
# Connect to MongoDB
docker exec -it e2o-mongodb mongosh -u admin -p your-password

# Backup database
docker exec e2o-mongodb mongodump --authenticationDatabase admin -u admin -p your-password --out /backup

# Restore database
docker exec e2o-mongodb mongorestore --authenticationDatabase admin -u admin -p your-password /backup
```

### SSL Certificate Management

```bash
# Renew certificates manually
docker compose run --rm certbot renew

# Check certificate expiry
docker compose run --rm certbot certificates

# Force certificate renewal
docker compose run --rm certbot renew --force-renewal
```

---

## 🔒 Security Best Practices

### 1. Change Default Passwords
```bash
# Login to admin panel
# Go to Profile → Change Password
# Use strong password (12+ characters, mixed case, numbers, symbols)
```

### 2. Configure Firewall Rules
```bash
# Ubuntu/Debian (UFW)
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Secure .env File
```bash
chmod 600 .env
chown root:root .env
```

### 4. Enable Automatic Updates
```bash
# Ubuntu/Debian
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# CentOS/RHEL
sudo yum install yum-cron
sudo systemctl enable yum-cron
sudo systemctl start yum-cron
```

### 5. Setup Database Backups
```bash
# Create backup script
cat > /root/backup-e2o.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/e2o"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
docker exec e2o-mongodb mongodump --authenticationDatabase admin -u admin -p your-password --out /tmp/backup
docker cp e2o-mongodb:/tmp/backup $BACKUP_DIR/backup_$DATE
# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x /root/backup-e2o.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-e2o.sh
```

### 6. Monitor System Resources
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs  # Ubuntu/Debian
sudo yum install htop iotop  # CentOS/RHEL

# Check resource usage
docker stats
```

---

## 🐛 Troubleshooting

### Issue: SSL Certificate Failed

**Symptoms:**
```
[WARNING] SSL setup failed - configure manually later
```

**Solutions:**
1. **Check DNS configuration:**
   ```bash
   dig +short earthtoorbit.com
   dig +short api.earthtoorbit.com
   ```
   Both should return your server IP.

2. **Verify ports are open:**
   ```bash
   netstat -tlnp | grep ':80\|:443'
   ```

3. **Check firewall:**
   ```bash
   sudo ufw status  # Ubuntu
   sudo firewall-cmd --list-all  # CentOS
   ```

4. **Manually request certificates:**
   ```bash
   docker compose run --rm certbot certonly --webroot \
     -w /var/www/certbot \
     -d earthtoorbit.com \
     -d api.earthtoorbit.com \
     --email admin@earthtoorbit.com \
     --agree-tos
   ```

### Issue: Services Not Healthy

**Symptoms:**
```
[ERROR] Services did not become healthy
```

**Solutions:**
1. **Check logs:**
   ```bash
   docker compose logs api
   docker compose logs web
   ```

2. **Verify environment variables:**
   ```bash
   cat .env | grep -v PASSWORD
   ```

3. **Check MongoDB connection:**
   ```bash
   docker exec e2o-api node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(err => console.error(err))"
   ```

4. **Rebuild services:**
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

### Issue: Cannot Access Website

**Symptoms:**
- Browser shows "Connection refused" or "Site can't be reached"

**Solutions:**
1. **Check Nginx is running:**
   ```bash
   docker compose ps nginx
   ```

2. **Test locally:**
   ```bash
   curl localhost:80
   curl localhost:443 -k
   ```

3. **Check Nginx configuration:**
   ```bash
   docker exec e2o-nginx nginx -t
   ```

4. **View Nginx logs:**
   ```bash
   docker compose logs nginx
   ```

### Issue: Email Not Sending

**Symptoms:**
- Users not receiving password reset emails
- No notification emails

**Solutions:**
1. **Test SMTP connection:**
   ```bash
   docker exec e2o-api node -e "const nodemailer = require('nodemailer'); const transporter = nodemailer.createTransporter({host: process.env.SMTP_HOST, port: process.env.SMTP_PORT, auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD}}); transporter.verify().then(console.log).catch(console.error)"
   ```

2. **Check SMTP credentials in .env:**
   ```bash
   grep SMTP .env
   ```

3. **For Gmail, use App Password:**
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate password and use in SMTP_PASSWORD

### Issue: Database Connection Failed

**Symptoms:**
```
MongooseError: Failed to connect to MongoDB
```

**Solutions:**
1. **Check MongoDB is running:**
   ```bash
   docker compose ps mongodb
   ```

2. **Test connection:**
   ```bash
   docker exec -it e2o-mongodb mongosh -u admin -p your-password --authenticationDatabase admin
   ```

3. **Check MongoDB logs:**
   ```bash
   docker compose logs mongodb
   ```

4. **Verify credentials in .env:**
   ```bash
   grep MONGODB .env
   ```

---

## 🔄 Updating the Application

### Pull Latest Code

```bash
cd /path/to/earth-to-orbit
git pull origin main
```

### Rebuild and Redeploy

```bash
# Backup database first
docker exec e2o-mongodb mongodump --authenticationDatabase admin -u admin -p your-password --out /backup

# Rebuild images
docker compose build --no-cache

# Restart services with zero downtime
docker compose up -d
```

---

## 📞 Support

For issues or questions:
- Check logs: `docker compose logs -f`
- Review documentation in `/docs` folder
- Check GitHub Issues
- Contact system administrator

---

## 📄 License

Earth To Orbit Platform - All Rights Reserved
