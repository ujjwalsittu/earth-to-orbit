# Earth To Orbit - Docker Deployment Guide

## Quick Start

Deploy the entire platform with a single command:

```bash
sudo ./deploy.sh --domain yourdomain.com --email admin@yourdomain.com
```

That's it! The script will:
- ✅ Install Docker if not present
- ✅ Configure environment variables
- ✅ Build Docker images
- ✅ Set up SSL certificates with Let's Encrypt
- ✅ Start all services with proper networking
- ✅ Configure Nginx reverse proxy
- ✅ Optionally seed the database

## Prerequisites

- A fresh Ubuntu 20.04+ / Debian 11+ / CentOS 8+ server
- Root or sudo access
- Domain name with DNS configured:
  - `yourdomain.com` → Your server IP
  - `api.yourdomain.com` → Your server IP
- Ports 80 and 443 open

## Manual Deployment

If you prefer manual control:

### 1. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit all REQUIRED fields
```

Required fields:
- `DOMAIN` - Your domain name
- `SSL_EMAIL` - Email for SSL certificates
- `MONGODB_PASSWORD` - Strong database password
- `SMTP_USER` / `SMTP_PASSWORD` - Email credentials
- `DEMO_PLATFORM_ADMIN_EMAIL` / `DEMO_PLATFORM_ADMIN_PASSWORD` - Initial admin

### 2. Update Nginx Configuration

```bash
sed -i "s/\${DOMAIN}/yourdomain.com/g" nginx/conf.d/default.conf
```

### 3. Build and Start

```bash
docker-compose build
docker-compose up -d
```

### 4. Obtain SSL Certificates

```bash
docker-compose run --rm certbot
docker-compose restart nginx
```

### 5. Seed Database (Optional)

```bash
docker exec -it e2o-api node /app/scripts/seed-data.js
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Nginx (Port 80/443)                │
│  ┌──────────────────────────────────────────────┐  │
│  │  SSL Termination & Reverse Proxy             │  │
│  │  - yourdomain.com → Web (3000)               │  │
│  │  - api.yourdomain.com → API (5000)           │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼────────┐              ┌────────▼─────────┐
│   Next.js Web  │              │   Express API    │
│   Port: 3000   │              │   Port: 5000     │
│                │              │                  │
│  - Dashboard   │              │  - REST API      │
│  - Auth Pages  │              │  - Business Logic│
│  - Catalog     │              │  - JWT Auth      │
└────────────────┘              └──────────┬───────┘
                                          │
                                ┌─────────▼────────┐
                                │   MongoDB 7.0    │
                                │   Port: 27017    │
                                │                  │
                                │  - User Data     │
                                │  - Bookings      │
                                │  - Transactions  │
                                └──────────────────┘
```

## Docker Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **nginx** | e2o-nginx | 80, 443 | Reverse proxy & SSL termination |
| **web** | e2o-web | 3000 (internal) | Next.js frontend application |
| **api** | e2o-api | 5000 (internal) | Express backend API |
| **mongodb** | e2o-mongodb | 27017 (internal) | MongoDB database |
| **certbot** | e2o-certbot | N/A | SSL certificate management |

All services communicate through the `e2o-network` Docker network.

## Environment Variables

### Auto-Generated Variables

These are automatically set by `deploy.sh`:

- `JWT_SECRET` - Random 32-character secret
- `JWT_REFRESH_SECRET` - Random 32-character secret
- `FRONTEND_URL` - `https://{DOMAIN}`
- `API_URL` - `https://api.{DOMAIN}`
- `NEXT_PUBLIC_API_URL` - `https://api.{DOMAIN}`

### Required Variables

You must set these in `.env`:

```bash
# Domain
DOMAIN=yourdomain.com
SSL_EMAIL=admin@yourdomain.com

# Database
MONGODB_PASSWORD=your-strong-password

# Email (For Gmail, use App Password)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Initial Admin
DEMO_PLATFORM_ADMIN_EMAIL=admin@yourdomain.com
DEMO_PLATFORM_ADMIN_PASSWORD=Admin@123456
```

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password (no spaces) as `SMTP_PASSWORD`

## SSL Certificates

### Automatic Renewal

The deployment script offers to set up auto-renewal via cron:

```bash
# Runs daily at midnight
0 0 * * * cd /path/to/earth-to-orbit && docker-compose run --rm certbot renew && docker-compose restart nginx
```

### Manual Renewal

```bash
docker-compose run --rm certbot renew
docker-compose restart nginx
```

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f nginx
```

### Service Management

```bash
# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Restart specific service
docker-compose restart api

# Rebuild and restart
docker-compose up -d --build
```

### Database Operations

```bash
# Access MongoDB shell
docker exec -it e2o-mongodb mongosh -u admin -p

# Backup database
docker exec e2o-mongodb mongodump --out /backup

# Restore database
docker exec e2o-mongodb mongorestore /backup
```

### Debugging

```bash
# Check service status
docker-compose ps

# Check service health
docker ps

# Execute command in container
docker exec -it e2o-api sh
docker exec -it e2o-web sh

# View API health endpoint
curl http://localhost:5000/health

# View environment variables
docker exec e2o-api env
```

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### SSL certificate issues

```bash
# Verify DNS
dig yourdomain.com
dig api.yourdomain.com

# Test certificate renewal
docker-compose run --rm certbot renew --dry-run

# Manual certificate request
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@yourdomain.com \
  --agree-tos \
  -d yourdomain.com \
  -d api.yourdomain.com
```

### Database connection issues

```bash
# Check MongoDB status
docker exec -it e2o-mongodb mongosh --eval "db.runCommand({ ping: 1 })"

# Verify connection string
docker exec e2o-api env | grep MONGODB_URI
```

### Port conflicts

```bash
# Check what's using port 80/443
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Stop conflicting services
sudo systemctl stop apache2  # If Apache is running
sudo systemctl stop nginx    # If system Nginx is running
```

## Production Best Practices

1. **Security**
   - Use strong passwords (20+ characters)
   - Keep JWT secrets secure
   - Never commit `.env` to version control
   - Use app-specific passwords for email
   - Regularly update Docker images

2. **Backups**
   - Schedule regular MongoDB backups
   - Store backups off-server
   - Test restore procedures

3. **Monitoring**
   - Set up log aggregation
   - Monitor disk space
   - Set up uptime monitoring
   - Track SSL expiry dates

4. **Updates**
   - Keep Docker images updated
   - Review security advisories
   - Test updates in staging first

## Performance Tuning

### MongoDB Optimization

```yaml
# In docker-compose.yml, add to mongodb service:
command: mongod --wiredTigerCacheSizeGB 1.5
```

### Nginx Caching

Already configured in `nginx.conf`:
- Static assets cached for 60 minutes
- Gzip compression enabled
- HTTP/2 enabled
- Proper security headers

### Docker Resources

Limit resource usage in `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

## Scaling

### Horizontal Scaling

Run multiple API instances:

```yaml
api:
  deploy:
    replicas: 3
```

Add load balancing in nginx:

```nginx
upstream api_backend {
    server api:5000;
    server api:5001;
    server api:5002;
}
```

### Vertical Scaling

Increase container resources:

```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2G
```

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review this guide
- Check GitHub issues
- Contact support

## License

Copyright © 2024 Earth To Orbit. All rights reserved.
