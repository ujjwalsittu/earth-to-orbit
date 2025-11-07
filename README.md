# Earth To Orbit (E2O)

> **B2B Aerospace Platform for machinery and lab bookings with usage-based pricing**

A full-stack Turborepo monorepo featuring Next.js 14, Express API, MongoDB, Razorpay payments, and Docker deployment. Space-themed UI with agentic animations.

[![GitHub Repository](https://img.shields.io/badge/GitHub-ujjwalsittu%2Fearth--to--orbit-blue?logo=github)](https://github.com/ujjwalsittu/earth-to-orbit)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Repository:** https://github.com/ujjwalsittu/earth-to-orbit

---

## 🚀 Features

### Core Platform

- **Multi-Tenant Organizations**: Companies register with org admins and members
- **RBAC**: Platform Admin, Org Admin, Org Member roles with granular permissions
- **Catalog Management**: Sites, Labs/Machinery, Components, and Assistance Staff
- **Request Workflow**: Draft → Submit → Approve → Schedule → Invoice → Pay
- **Dynamic Scheduling**: Time-zone aware with availability checking and conflict resolution
- **Extension Requests**: Hourly increments with alternative slot suggestions
- **Usage-Based Pricing**: Per-minute/hour machinery rates, component purchases/rentals, staff hourly rates
- **Dual Payment Methods**:
  - **Razorpay**: Card/UPI/NetBanking with signature verification
  - **Bank Transfer**: Receipt upload with admin approval
- **Invoice Generation**: Auto-generated PDFs with GST calculations
- **Email Notifications**: SMTP or Resend integration with React Email templates
- **Audit Logs**: Complete activity tracking
- **Observability**: Structured logging with pino, request IDs, OTEL hooks

### Admin Features (PLATFORM_ADMIN)

- **Request Management**: Approve/reject requests with lab assignment during approval
- **Organizations Management**: View all organizations with activity stats
- **Finance Dashboard**: Revenue analytics, invoices, payments with period filtering
- **Catalog CRUD**: Create/manage sites, labs, components, and staff
- **User Management**: View all users and organizations
- **Team Management (ORG_ADMIN)**: Invite members, manage roles, view org statistics

### Tech Stack

| Layer          | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| **Monorepo**   | Turborepo + pnpm workspaces                                 |
| **Frontend**   | Next.js 14 (App Router), shadcn/ui, Tailwind, Framer Motion |
| **Backend**    | Express, TypeScript, Zod validation                         |
| **Database**   | MongoDB + Mongoose                                    |
| **Auth**       | Custom JWT with bcrypt                                      |
| **Payments**   | Razorpay + Bank Transfer                                    |
| **Email**      | SMTP or Resend                                                      |
| **Storage**    | AWS S3 (receipts)                                           |
| **Deployment** | Docker + docker-compose with automated deployment script (Ubuntu Server supported) |
| **Security**   | Helmet, rate limiting, CORS, input validation               |

---

## 📁 Project Structure

```
earth-to-orbit/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page with Earth animation
│   │   │   ├── (auth)/           # Login, register
│   │   │   ├── dashboard/        # Org dashboard (requests, team, org)
│   │   │   └── admin/            # Admin dashboard (catalog, requests, finance, orgs)
│   │   ├── components/
│   │   │   ├── ui/               # shadcn components
│   │   │   ├── admin/            # Admin components (dialogs, approval)
│   │   │   └── dashboard/        # Dashboard components
│   │   └── lib/                  # Utils, API client
│   │
│   └── api/                      # Express API
│       ├── src/
│       │   ├── models/           # Mongoose schemas (User, Org, Site, Lab, etc.)
│       │   ├── routes/           # API endpoints
│       │   │   ├── auth.routes.ts
│       │   │   ├── organization.routes.ts
│       │   │   ├── catalog-admin.routes.ts
│       │   │   ├── request.routes.ts
│       │   │   └── payment.routes.ts
│       │   ├── services/         # Business logic (Scheduling, Billing, Payment, Email)
│       │   ├── middleware/       # Auth, RBAC, validation, rate limiting
│       │   └── server.ts
│       └── package.json
│
├── packages/
│   ├── types/                    # Shared TypeScript types + Zod schemas
│   ├── config/                   # Shared configs (ESLint, TypeScript, Tailwind)
│   └── emails/                   # React Email templates (future)
│
├── scripts/
│   └── seed-data.ts              # Database seeding with realistic aerospace data
│
├── nginx/                        # Nginx reverse proxy configuration
│   ├── nginx.conf
│   └── conf.d/default.conf
│
├── deploy.sh                     # Interactive deployment script (SSH-based)
├── docker-compose.yml            # Docker orchestration
├── DEPLOYMENT_GUIDE.md           # Comprehensive deployment documentation
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 🛠️ Quick Start

### Development Setup

#### Prerequisites

- Node.js 18+
- pnpm 8+
- MongoDB (local or Atlas)
- Razorpay account (optional, for payments)
- SMTP credentials or Resend API key (optional, for emails)
- AWS S3 bucket (optional, for file uploads)

#### 1. Clone Repository

```bash
git clone https://github.com/ujjwalsittu/earth-to-orbit.git
cd earth-to-orbit
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Configure Environment

**Single unified `.env` file** at the root - both API and Web read from this file.

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Environment
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/earth-to-orbit
# For MongoDB Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/earth-to-orbit

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this

# URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000

# Email Service - Choose one:
# Option 1: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=Earth To Orbit

# Option 2: Resend
# RESEND_API_KEY=re_xxxxx

# Company Branding
COMPANY_NAME=Earth To Orbit
COMPANY_EMAIL=contact@earth-to-orbit.com
SUPPORT_EMAIL=support@earth-to-orbit.com

# Platform Admin Account
DEMO_PLATFORM_ADMIN_EMAIL=admin@earth-to-orbit.com
DEMO_PLATFORM_ADMIN_PASSWORD=Admin@123456

# Payment Gateway - Razorpay (optional)
# RAZORPAY_KEY_ID=rzp_test_xxxxx
# RAZORPAY_KEY_SECRET=your_secret

# AWS S3 for file uploads (optional)
# AWS_REGION=ap-south-1
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
# AWS_S3_BUCKET=earth-to-orbit-uploads
```

> **Note:** All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
> Never put secrets in `NEXT_PUBLIC_` variables!

#### 4. Seed Database

```bash
pnpm seed
```

This creates:

- **2 Sites**: Bangalore (BLR-01), Hyderabad (HYD-01)
- **9 Categories**: Environmental Testing, Vibration, EMC, Thermal, Cleanrooms, etc.
- **5 Labs**: TVAC Chamber, Vibration Table, RF Anechoic Chamber, Thermal Cycler, Cleanroom
- **7 Components**: OBC, EPS, Solar Panels, UHF Radio, Reaction Wheel, Star Tracker, Antenna
- **4 Staff Members**: Technicians with various skills
- **Platform Admin**: admin@earth-to-orbit.com / Admin@123456
- **Sample Org Admin**: admin@spacetech.in / OrgAdmin@123
- **Sample Org Member**: engineer@spacetech.in / Member@123

#### 5. Run Development

**Option A: Turbo (Recommended)**

```bash
pnpm dev
```

**Option B: Separate Terminals**

```bash
# Terminal 1 - API
cd apps/api
pnpm dev

# Terminal 2 - Web
cd apps/web
pnpm dev
```

Access:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🚢 Production Deployment

### Automated Docker Deployment (Recommended)

We provide a comprehensive **interactive deployment script** that handles everything:

- ✅ SSH-based remote or local deployment
- ✅ Automatic Docker installation
- ✅ SSL certificate setup (Let's Encrypt)
- ✅ Separate web and API domain configuration
- ✅ Complete environment variable collection
- ✅ Database, email, payment gateway configuration
- ✅ Nginx reverse proxy setup
- ✅ Automatic SSL renewal

#### Quick Deploy

```bash
# Clone repository
git clone https://github.com/ujjwalsittu/earth-to-orbit.git
cd earth-to-orbit

# Run interactive deployment script
sudo bash deploy.sh
```

#### Save & Reuse Configuration

**Save configuration for future deployments:**
```bash
sudo bash deploy.sh --with-save
```
This saves all your answers to `.deploy-config.env` for reuse.

**Auto-deploy with saved configuration:**
```bash
sudo bash deploy.sh --auto-deploy
```
Deploys automatically using the saved configuration file (no prompts).

**Use custom config file:**
```bash
sudo bash deploy.sh --auto-deploy --config /path/to/my-config.env
```

**View all options:**
```bash
bash deploy.sh --help
```

---

The script will guide you through **13 steps** to configure:

1. **Deployment Mode** (Local/Remote via SSH)
2. **SSH Configuration** (if remote)
3. **Domain Configuration** (Web + API domains)
4. **SSL Certificate** (email for Let's Encrypt)
5. **Database** (MongoDB credentials)
6. **Email Service** (SMTP or Resend)
7. **Company Information** (branding, contact details)
8. **Platform Admin Account**
9. **Payment Gateway** (Razorpay - optional)
10. **AWS S3 Storage** (optional)
11. **Demo Organization** (optional)
12. **Security** (JWT secrets auto-generated)
13. **Additional Options** (database seeding, SSL renewal)

After configuration review and confirmation, the script will:

- Create `.env` file with all settings
- Install Docker (if needed)
- Configure firewall rules
- Verify DNS configuration
- Build Docker images
- Start services (MongoDB, API, Web, Nginx)
- Obtain SSL certificates
- Setup SSL auto-renewal cron job

#### Example Deployment

```bash
sudo bash deploy.sh

# Follow the prompts:
# - Web Domain: mycompany.com
# - API Domain: api.mycompany.com
# - SSL Email: admin@mycompany.com
# - MongoDB Password: ********
# - SMTP or Resend? [1-2]: 1
# - SMTP Host: smtp.gmail.com
# - ... (continue through all steps)

# Review configuration summary
# Confirm deployment
# ✅ Done! Access your platform at https://mycompany.com
```

📖 **For detailed deployment documentation**, see [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)

---

### Manual Docker Deployment

If you prefer manual deployment:

#### 1. Update Environment Variables

Edit `.env` with production values:

```env
NODE_ENV=production
WEB_DOMAIN=myapp.com
API_DOMAIN=api.myapp.com
FRONTEND_URL=https://myapp.com
API_URL=https://api.myapp.com
NEXT_PUBLIC_API_URL=https://api.myapp.com
# ... other production values
```

#### 2. Build and Start Services

```bash
docker compose build --no-cache
docker compose up -d mongodb api web nginx
```

#### 3. Setup SSL

```bash
docker compose run --rm certbot
docker compose restart nginx
```

#### 4. Verify Deployment

```bash
docker compose ps
curl -I https://myapp.com
curl https://api.myapp.com/health
```

---

## 📚 API Documentation

### Base URL

```
Production: https://api.your-domain.com
Development: http://localhost:5000
```

### Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

#### POST /api/auth/register

Register organization and admin user.

**Request:**

```json
{
  "organization": {
    "name": "My Aerospace Co",
    "email": "contact@myaerospace.com",
    "phone": "+91-80-12345678"
  },
  "user": {
    "email": "admin@myaerospace.com",
    "password": "SecurePass@123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+91-9876543210"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "ORG_ADMIN" },
    "organization": { "id": "...", "name": "..." },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### POST /api/auth/login

**Request:**

```json
{
  "email": "admin@myaerospace.com",
  "password": "SecurePass@123"
}
```

### Catalog

#### GET /api/catalog/labs

Query labs/machinery.

**Query Params:**

- `siteId` (optional)
- `categoryId` (optional)

#### GET /api/catalog/components

Get available components.

#### GET /api/catalog/staff

Get available staff members.

### Requests

#### POST /api/requests

Create draft request with machinery, components, and assistance.

#### POST /api/requests/:id/submit

Submit request for admin approval. Checks availability first.

#### GET /api/requests

List user's requests (paginated).

#### GET /api/requests/:id

Get request details with invoices.

### Admin Endpoints (Platform Admin Only)

#### GET /api/admin/requests/pending

List all pending requests for review.

#### POST /api/admin/requests/:id/approve

Approve request and generate invoice.

**Request:**

```json
{
  "scheduledStart": "2024-01-15T10:00:00Z",
  "scheduledEnd": "2024-01-15T16:00:00Z",
  "labAssignments": {
    "machineryItemId1": "labId1",
    "machineryItemId2": "labId2"
  }
}
```

#### POST /api/admin/requests/:id/reject

Reject request with reason.

**Request:**

```json
{
  "reason": "Requested equipment not available"
}
```

#### POST /api/admin/catalog/sites

Create new testing site (PLATFORM_ADMIN).

#### POST /api/admin/catalog/labs

Create new lab/machinery (PLATFORM_ADMIN).

#### POST /api/admin/catalog/components

Create new component (PLATFORM_ADMIN).

#### POST /api/admin/catalog/staff

Create new staff member (PLATFORM_ADMIN).

#### GET /api/admin/organizations

View all organizations.

#### GET /api/admin/invoices

View all invoices with filtering.

#### GET /api/admin/finance/stats

Get revenue analytics.

### Organization Management (ORG_ADMIN)

#### GET /api/organizations/:id

Get organization details.

#### PATCH /api/organizations/:id

Update organization information.

#### GET /api/organizations/:id/members

Get team members.

#### POST /api/organizations/:id/members

Invite new team member.

#### DELETE /api/organizations/:id/members/:userId

Remove team member.

#### GET /api/organizations/:id/stats

Get organization statistics.

### Payments

#### POST /api/payments/razorpay/order

Create Razorpay order.

#### POST /api/payments/razorpay/verify

Verify Razorpay payment after successful transaction.

#### POST /api/payments/bank-transfer/upload

Upload bank transfer receipt.

#### POST /api/admin/payments/:id/verify

Verify bank transfer payment (PLATFORM_ADMIN).

### Availability

#### POST /api/availability/check

Check if time slot is available with conflict detection and alternative suggestions.

#### GET /api/availability/calendar

Get calendar view of bookings.

---

## 🔐 Security Features

- **Helmet**: HTTP security headers
- **CORS**: Configured for frontend origin
- **Rate Limiting**: 100 req/15min (general), 5 req/15min (auth)
- **Input Validation**: Zod schemas on all endpoints
- **RBAC**: Role-based access control with middleware guards
- **JWT**: Stateless authentication with configurable expiry
- **Password Hashing**: bcrypt with salt rounds
- **Audit Logging**: Track all state changes
- **SSL/TLS**: Automatic HTTPS with Let's Encrypt
- **Environment Variables**: Sensitive data in .env (not in code)
- **Docker Isolation**: Services run in isolated containers

---

## 🎨 Frontend Pages

### Public Pages

- **Landing (/)**: Space-themed with animated Earth sphere, features showcase
- **Login (/login)**: User authentication
- **Register (/register)**: Organization and admin registration

### Dashboard (/dashboard) - ORG_ADMIN & ORG_MEMBER

- **Overview**: Quick stats and recent activity
- **Requests**: Create, view, manage booking requests
- **My Requests**: List with status filters
- **Invoices**: View and download invoices
- **Organization** (ORG_ADMIN): Organization overview and stats
- **Team** (ORG_ADMIN): Invite members, manage roles

### Admin Dashboard (/admin) - PLATFORM_ADMIN

- **Overview**: Platform-wide statistics
- **Requests**: Approve/reject requests with lab assignment
- **Organizations**: View all organizations with activity stats
- **Finance**: Revenue analytics, invoices, payments dashboard
- **Catalog**: CRUD for sites, labs, components, staff
- **Users**: View all users and organizations
- **Payments**: Bank transfer verification

---

## 📊 Database Schema

### Key Collections

- **users**: Email, password, role, organizationId, profile
- **organizations**: Company details, billing info, members
- **sites**: Physical centers with operating hours/timezone
- **categories**: Equipment categories
- **labs**: Machinery/equipment with hour-based rates and capacity
- **components**: Parts/modules with pricing and stock
- **staff**: Technicians with skills and hourly rates
- **requests**: Bookings with items (machinery, components, assistance), status, totals
- **invoices**: Line items, tax, payment status
- **payments**: Razorpay/bank transfer records
- **notifications**: User notifications
- **auditLogs**: Change tracking

---

## 🧪 Testing

### Run Tests

```bash
# API tests
cd apps/api
pnpm test

# Web tests
cd apps/web
pnpm test

# E2E tests
pnpm test:e2e
```

### Test Credentials

After running `pnpm seed`:

- **Platform Admin**: admin@earth-to-orbit.com / Admin@123456
- **Org Admin**: admin@spacetech.in / OrgAdmin@123
- **Org Member**: engineer@spacetech.in / Member@123

---

## 🛠️ Useful Commands

### Development

```bash
pnpm dev              # Run all apps in dev mode
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm format           # Format code with Prettier
pnpm seed             # Seed database
```

### Docker

```bash
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose logs -f            # View logs
docker compose ps                 # View service status
docker compose restart nginx      # Restart specific service
docker exec -it e2o-api bash      # Access API container
```

### Database

```bash
# Backup
docker exec e2o-mongodb mongodump --out /backup

# Restore
docker exec e2o-mongodb mongorestore /backup

# Connect to MongoDB
docker exec -it e2o-mongodb mongosh -u admin -p your-password
```

---

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)**: Comprehensive production deployment instructions
- **[API Documentation](#-api-documentation)**: Complete API endpoint reference
- **[Environment Variables](.env.example)**: All configuration options

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ujjwal Sittu** 🇮🇳

- GitHub: [@ujjwalsittu](https://github.com/ujjwalsittu)
- Repository: [earth-to-orbit](https://github.com/ujjwalsittu/earth-to-orbit)

---

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Next.js** team for the amazing framework
- **MongoDB** for the flexible database
- **Docker** for containerization
- **Let's Encrypt** for free SSL certificates

---

**Built with ❤️ for the aerospace community**

🚀 **Star this repo** if you find it helpful!
