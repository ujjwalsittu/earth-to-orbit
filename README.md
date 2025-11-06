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

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Frontend** | Next.js 14 (App Router), shadcn/ui, Tailwind, Framer Motion |
| **Backend** | Express, TypeScript, Zod validation |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | Custom JWT with bcrypt |
| **Payments** | Razorpay + Bank Transfer |
| **Email** | Resend |
| **Storage** | AWS S3 (receipts) |
| **Deployment** | Docker + docker-compose, Vercel (web), Railway (API) |
| **Security** | Helmet, rate limiting, CORS, input validation |

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
│   │
│   └── emails/                   # React Email templates
│       └── templates/
│           ├── registration.tsx          # Welcome email
│           ├── forgot-password.tsx       # Password reset
│           ├── request-submitted.tsx     # Booking confirmation
│           ├── request-approved.tsx      # Approval with invoice
│           ├── request-rejected.tsx      # Rejection with reason
│           ├── request-resubmit.tsx      # Admin feedback
│           ├── payment-received.tsx      # Payment confirmation
│           └── extension-request.tsx     # Extension pending/approved
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

#### API (apps/api/.env)

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
# Server
NODE_ENV=development
PORT=4000
API_BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/earth-to-orbit?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Razorpay (optional)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx

# Resend Email (optional)
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@earth-to-orbit.com

# AWS S3 (optional)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=e2o-receipts

# Tax
GST_PERCENT=18

# Admin Defaults
ADMIN_EMAIL=admin@earth-to-orbit.com
ADMIN_PASSWORD=Admin@123456
```

#### Web (apps/web/.env.local)

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

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

✅ **Fully Implemented:**
- Login page with demo credentials display
- Multi-step organization registration (org details → admin user)
- Form validation with real-time feedback
- Toast notifications for success/error
- Auto-redirect based on user role
- Zustand state persistence

### Dashboard (/dashboard)

✅ **Fully Implemented:**
- **Overview**: Stats cards (total/pending/approved/invoices), quick actions, recent requests
- **My Requests**:
  - Search by request number or title
  - Filter by status (Draft, Submitted, Approved, etc.)
  - Real-time filtering with results counter
  - Table with status badges and pagination
- **New Request** (Multi-Step Wizard):
  - Step 1: Basic Info (title, description)
  - Step 2: Labs & Machinery (site filtering, date/time pickers, duration calc)
  - Step 3: Components (optional, dynamic add/remove)
  - Step 4: Review with real-time cost estimation + GST
- **Request Detail**:
  - Equipment lists with subtotals and pricing breakdown
  - Invoice cards with PDF download
  - Razorpay payment integration (opens checkout modal)
  - Bank transfer dialog with receipt upload
  - Extension request button (for scheduled bookings)
- **Invoices**:
  - Stats cards (total, paid, pending, total amount)
  - Request # column with links
  - "Pay Now" button for pending invoices
  - Loading skeletons
- **Notifications**:
  - List with read/unread states (blue highlight)
  - Mark as read (individual/bulk)
  - Unread count badge
- **Settings**:
  - **Profile Tab**: Personal info, change password
  - **Organization Tab**: Full org details (role-based editing)
  - Loading skeletons and toast notifications
- **Protected Routes**: Role-based access with automatic redirects
- **Navigation**: Responsive header with Settings link

### Admin Dashboard (/admin)

✅ **Fully Implemented:**
- **Dashboard**:
  - 6 stats cards (pending requests, total requests, orgs, users, pending payments, total revenue)
  - Quick Actions card (Review Requests, Verify Payments, Manage Catalog)
  - Recent Activity section (latest 5 requests with status badges)
  - Loading skeletons for all sections
- **Requests**: Pending requests queue with one-click approve/reject
- **Payments**:
  - Pending bank transfer verifications table
  - View receipt URLs and transaction details
  - Approve/Reject payments with one click
  - Statistics cards (pending count, total amount)
- **Catalog Management**: View/edit sites, labs, components with pricing
- **User Management**:
  - 6 stats cards (total users, admins breakdown, orgs breakdown)
  - **Users Tab**: Search by name/email/org, filter by role, color-coded badges
  - **Organizations Tab**: Search, display joined date, status badges
  - Loading skeletons and empty states
- **Dark Theme Navigation**: Professional admin interface with Payments link
- **RBAC**: Platform Admin only access

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
