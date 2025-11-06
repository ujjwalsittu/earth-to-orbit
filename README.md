# Earth To Orbit (E2O)

> **B2B Aerospace Platform for machinery and lab bookings with usage-based pricing**

A full-stack Turborepo monorepo featuring Next.js 14, Express API, MongoDB, Razorpay payments, and Docker deployment. Space-themed UI with agentic animations.

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
- **Email Notifications**: Resend integration with React Email templates
- **Audit Logs**: Complete activity tracking
- **Observability**: Structured logging with pino, request IDs, OTEL hooks

### Tech Stack

| Layer          | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| **Monorepo**   | Turborepo + pnpm workspaces                                 |
| **Frontend**   | Next.js 14 (App Router), shadcn/ui, Tailwind, Framer Motion |
| **Backend**    | Express, TypeScript, Zod validation                         |
| **Database**   | MongoDB Atlas + Mongoose                                    |
| **Auth**       | Custom JWT with bcrypt                                      |
| **Payments**   | Razorpay + Bank Transfer                                    |
| **Email**      | Resend                                                      |
| **Storage**    | AWS S3 (receipts)                                           |
| **Deployment** | Docker + docker-compose, Vercel (web), Railway (API)        |
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
│   │   │   ├── (dashboard)/      # Org dashboard
│   │   │   └── (admin)/          # Admin dashboard
│   │   ├── components/ui/        # shadcn components
│   │   └── lib/                  # Utils, API client
│   │
│   └── api/                      # Express API
│       ├── src/
│       │   ├── models/           # Mongoose schemas (User, Org, Site, Lab, etc.)
│       │   ├── routes/           # API endpoints
│       │   ├── services/         # Business logic (Scheduling, Billing, Payment, Email)
│       │   ├── middleware/       # Auth, RBAC, validation, rate limiting
│       │   └── server.ts
│       └── package.json
│
├── packages/
│   ├── types/                    # Shared TypeScript types + Zod schemas
│   │   └── src/
│   │       ├── user.ts
│   │       ├── organization.ts
│   │       ├── catalog.ts
│   │       ├── request.ts
│   │       ├── billing.ts
│   │       └── index.ts
│   │
│   ├── config/                   # Shared configs (ESLint, TypeScript, Tailwind)
│   └── emails/                   # React Email templates (future)
│
├── scripts/
│   └── seed-data.ts              # Database seeding with realistic aerospace data
│
├── infra/
│   └── docker/
│       ├── Dockerfile.api
│       ├── Dockerfile.web
│       └── docker-compose.yml
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- MongoDB Atlas account (or local MongoDB)
- Razorpay account (optional, for payments)
- Resend API key (optional, for emails)
- AWS S3 bucket (optional, for file uploads)

### 1. Clone & Install

```bash
git clone <your-repo-url> earth-to-orbit
cd earth-to-orbit
pnpm install
```

### 2. Configure Environment

**Single unified `.env` file** at the root - both API and Web read from this file.

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Environment
NODE_ENV=development
PORT=4000

# Database
MONGODB_URI=mongodb://localhost:27017/earth-to-orbit
# For MongoDB Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/earth-to-orbit

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Payment Gateway - Razorpay (optional)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Email Service - Resend (optional)
RESEND_API_KEY=re_xxxxx

# AWS S3 for file uploads (optional)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=earth-to-orbit-uploads

# Company Branding
COMPANY_NAME=Earth To Orbit
COMPANY_EMAIL=contact@earth-to-orbit.com
SUPPORT_EMAIL=support@earth-to-orbit.com

# Frontend public variables
NEXT_PUBLIC_COMPANY_NAME=Earth To Orbit
NEXT_PUBLIC_DEVELOPER_NAME=Ujjwal Sittu
NEXT_PUBLIC_DEVELOPER_COUNTRY=🇮🇳
```

> **Note:** All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
> Never put secrets in `NEXT_PUBLIC_` variables!

### 3. Seed Database

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

### 4. Run Development

#### Option A: Separate Terminals

```bash
# Terminal 1 - API
cd apps/api
pnpm dev

# Terminal 2 - Web
cd apps/web
pnpm dev
```

#### Option B: Turbo (Recommended)

```bash
pnpm dev
```

Access:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

### 5. Run with Docker

```bash
cd infra/docker
docker-compose up --build
```

Ports:

- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **MongoDB**: localhost:27017

---

## 📚 API Documentation

### Base URL

```
http://localhost:4000/api
```

### Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

#### POST /auth/register

Register organization and admin user.

**Request:**

```json
{
  "organization": {
    "name": "My Aerospace Co",
    "legalName": "My Aerospace Private Limited",
    "registrationNumber": "U12345KA2024PTC123456",
    "gstNumber": "29ABCDE1234F1Z5",
    "industry": "Satellite Manufacturing",
    "address": {
      "street": "123 Main St",
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India",
      "postalCode": "560001"
    },
    "contactEmail": "contact@myaerospace.com",
    "contactPhone": "+91-80-12345678"
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

#### POST /auth/login

**Request:**

```json
{
  "email": "admin@myaerospace.com",
  "password": "SecurePass@123"
}
```

### Catalog

#### GET /catalog/labs

Query labs/machinery.

**Query Params:**

- `siteId` (optional)
- `categoryId` (optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "labs": [
      {
        "_id": "...",
        "name": "Thermal Vacuum (TVAC) Chamber",
        "code": "TVAC-01",
        "siteId": { "name": "Bangalore Aerospace Center", "code": "BLR-01" },
        "categoryId": { "name": "Environmental Testing" },
        "ratePerHour": 15000,
        "capacity": 1,
        "specifications": { ... }
      }
    ]
  }
}
```

### Requests

#### POST /requests

Create draft request with machinery, components, and assistance.

#### POST /requests/:id/submit

Submit request for admin approval. Checks availability first.

#### GET /requests

List user's requests (paginated).

#### GET /requests/:id

Get request details with invoices.

### Admin Endpoints (Platform Admin Only)

#### POST /requests/:id/approve

Approve request and generate invoice.

#### GET /admin/requests/pending

List all pending requests for review.

#### POST /admin/payments/:id/verify

Verify bank transfer payment.

### Payments

#### POST /payments/razorpay/order

Create Razorpay order.

#### POST /payments/razorpay/verify

Verify Razorpay payment after successful transaction.

#### POST /payments/bank-transfer/upload

Upload bank transfer receipt.

### Availability

#### POST /availability/check

Check if time slot is available with conflict detection and alternative suggestions.

#### GET /availability/calendar

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

---

## 🎨 Frontend Pages

### Landing Page (/)

- Space-themed with animated Earth sphere
- Orbiting satellite icons
- Features, services, CTA sections
- Responsive header/footer

### Auth Pages (/login, /register)

- Organization registration with validation
- User login with JWT
- Protected route redirects

### Dashboard (/dashboard)

- **Request Builder**: Multi-step form for creating bookings
- **My Requests**: List with status filters
- **Invoices**: List with PDF download
- **Extensions**: Request additional hours
- **Notifications**: Real-time updates

### Admin Dashboard (/admin)

- **Pending Requests**: Queue for approval
- **Calendar View**: Site/lab bookings visualization
- **Catalog Management**: CRUD for sites, labs, components, staff
- **Payment Verification**: Bank transfer approvals
- **User Management**: Org/user overview
- **Audit Logs**: Activity tracking

---

## 📊 Database Schema

### Key Collections

- **users**: Email, password, role, organizationId
- **organizations**: Company details, billing info
- **sites**: Physical centers with operating hours/timezone
- **categories**: Equipment categories
- **labs**: Machinery/equipment with rates and capacity
- **components**: Parts/modules with pricing
- **staff**: Technicians with skills and hourly rates
- **requests**: Bookings with items, status, totals
- **invoices**: Line items, tax, payment status
- **payments**: Razorpay/bank transfer records
- **notifications**: User notifications
- **auditLogs**: Change tracking

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd apps/web
vercel --prod
```

**Environment Variables:**

- `NEXT_PUBLIC_API_URL`: Production API URL

### Backend (Railway/Render)

1. Connect GitHub repo
2. Set root directory: `apps/api`
3. Build command: `pnpm install && pnpm build`
4. Start command: `node dist/server.js`
5. Add environment variables from `.env.example`

### Database (MongoDB Atlas)

1. Create cluster
2. Whitelist Railway/Render IP
3. Create database user
4. Get connection string
5. Run seed script: `pnpm seed`

---

## 📝 License

MIT

---

**Built with ❤️ for the aerospace community**
