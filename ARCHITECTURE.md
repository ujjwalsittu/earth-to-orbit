# Earth To Orbit - System Architecture

## Summary

Production-ready B2B aerospace equipment booking platform built with:
- **Frontend**: Next.js 14 (App Router) + shadcn/ui + Tailwind CSS
- **Backend**: Express.js + TypeScript + MongoDB (Mongoose ODM)
- **Monorepo**: Turborepo with pnpm workspaces
- **Payments**: Razorpay (INR) + Bank Transfer with admin verification
- **Email**: Resend with React Email templates
- **Auth**: Custom JWT (access + refresh tokens)
- **Deployment**: Vercel (frontend), Railway (backend), MongoDB Atlas

## Assumptions

1. **Database**: MongoDB Atlas for production; local MongoDB for development
2. **Package Manager**: pnpm v8.15.1 (strict)
3. **Node**: v18+ required
4. **Timezone**: IST (Asia/Kolkata) for sites; timezone-aware scheduling
5. **Currency**: INR only; GST @ 18% (configurable)
6. **Rate Limiting**: 100 req/min per IP for auth; 1000 req/min for API
7. **File Uploads**: Direct to cloud storage with signed URLs (S3-compatible)
8. **RBAC**: PLATFORM_ADMIN > ORG_ADMIN > ORG_MEMBER
9. **Slots**: Configurable granularity (15/30/60 min); no overbooking
10. **Extensions**: Hourly increments; show alternatives if unavailable

## Architecture Diagram

\`\`\`mermaid
graph TB
    subgraph "Frontend - Vercel"
        WEB[Next.js App]
        LANDING[Landing Page<br/>Animated Earth]
        ORG_DASH[Org Dashboard<br/>Requests/Invoices]
        ADMIN_DASH[Admin Dashboard<br/>Approvals/Catalog]
    end

    subgraph "Backend - Railway"
        API[Express API<br/>:4000]
        AUTH[Auth Module<br/>JWT]
        ROUTES[Route Handlers]
        MIDDLEWARE[Middleware<br/>RBAC/Validation]
        SERVICES[Services<br/>Email/Payment]
    end

    subgraph "Data Layer - MongoDB Atlas"
        DB[(MongoDB)]
        COLLECTIONS[Collections:<br/>users, orgs, requests,<br/>labs, components, invoices,<br/>payments, notifications]
    end

    subgraph "External Services"
        RAZORPAY[Razorpay<br/>Payments]
        RESEND[Resend<br/>Emails]
        S3[S3/Cloudflare<br/>File Storage]
    end

    WEB -->|API Calls| API
    API -->|Queries| DB
    API -->|Send Emails| RESEND
    API -->|Process Payments| RAZORPAY
    API -->|Upload Files| S3
    RAZORPAY -->|Webhooks| API

    style WEB fill:#2563eb
    style API fill:#10b981
    style DB fill:#f59e0b
    style RAZORPAY fill:#8b5cf6
\`\`\`

## Project Tree

\`\`\`
earth-to-orbit/
├── apps/
│   ├── api/                          # Backend Express API
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts       # MongoDB connection
│   │   │   │   └── env.ts            # Environment validation (Zod)
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── rbac.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   ├── rate-limit.middleware.ts
│   │   │   │   └── error.middleware.ts
│   │   │   ├── models/               # Mongoose schemas
│   │   │   │   ├── User.ts
│   │   │   │   ├── Organization.ts
│   │   │   │   ├── Site.ts
│   │   │   │   ├── Lab.ts
│   │   │   │   ├── Component.ts
│   │   │   │   ├── Staff.ts
│   │   │   │   ├── Category.ts
│   │   │   │   ├── Request.ts
│   │   │   │   ├── Invoice.ts
│   │   │   │   ├── Payment.ts
│   │   │   │   ├── Notification.ts
│   │   │   │   └── AuditLog.ts
│   │   │   ├── routes/               # Route handlers (controllers inline)
│   │   │   │   ├── auth.routes.ts    # Register, login, refresh
│   │   │   │   ├── catalog.routes.ts # Labs, components, categories
│   │   │   │   ├── request.routes.ts # Booking CRUD, submit, extend
│   │   │   │   ├── availability.routes.ts
│   │   │   │   ├── billing.routes.ts # Invoices, PDFs
│   │   │   │   ├── payment.routes.ts # Razorpay, bank transfer
│   │   │   │   ├── notification.routes.ts
│   │   │   │   └── admin.routes.ts   # Approve, assign, CRUD catalog
│   │   │   ├── services/
│   │   │   │   ├── email.service.ts  # Resend integration
│   │   │   │   ├── payment.service.ts
│   │   │   │   ├── scheduling.service.ts
│   │   │   │   ├── billing.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts         # Pino structured logging
│   │   │   │   ├── api-error.ts
│   │   │   │   ├── response.ts
│   │   │   │   ├── async-handler.ts
│   │   │   │   ├── generate-number.ts
│   │   │   │   └── request-id.ts
│   │   │   ├── app.ts                # Express app setup
│   │   │   └── server.ts             # Entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Frontend Next.js
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── dashboard/
│       │   │   │   ├── page.tsx      # Overview, stats
│       │   │   │   ├── requests/     # List, create, detail
│       │   │   │   ├── invoices/
│       │   │   │   ├── notifications/
│       │   │   │   └── settings/
│       │   │   └── layout.tsx        # Dashboard nav
│       │   ├── (admin)/
│       │   │   └── admin/
│       │   │       ├── page.tsx      # Admin overview
│       │   │       ├── requests/     # Approve/reject
│       │   │       ├── catalog/      # CRUD labs/components
│       │   │       ├── users/
│       │   │       └── payments/
│       │   ├── page.tsx              # Landing page
│       │   ├── layout.tsx            # Root layout
│       │   ├── globals.css
│       │   ├── error.tsx
│       │   ├── loading.tsx
│       │   └── not-found.tsx
│       ├── components/
│       │   ├── ui/                   # shadcn/ui components
│       │   ├── auth/
│       │   ├── admin/
│       │   └── dashboard/
│       ├── lib/
│       │   ├── api-client.ts         # Axios wrapper
│       │   ├── config.ts
│       │   ├── store.ts              # Zustand
│       │   └── utils.ts
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       └── tsconfig.json
│
├── packages/
│   ├── emails/                       # React Email templates
│   │   ├── templates/
│   │   │   ├── registration.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   ├── request-submitted.tsx
│   │   │   ├── request-approved.tsx
│   │   │   ├── request-rejected.tsx
│   │   │   ├── request-resubmit.tsx
│   │   │   ├── payment-received.tsx
│   │   │   └── extension-request.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                       # Shared configs
│       └── typescript/
│
├── scripts/
│   └── seed-data.ts                  # Database seeding
│
├── infra/
│   └── docker/
│       ├── Dockerfile.api
│       ├── Dockerfile.web
│       └── docker-compose.yml
│
├── docs/
│   └── API.md                        # API documentation
│
├── .env.example                      # Environment template
├── package.json                      # Root workspace
├── pnpm-workspace.yaml
├── turbo.json                        # Turborepo config
├── vercel.json                       # Vercel deployment
├── netlify.toml                      # Netlify deployment
├── railway.json                      # Railway deployment
├── nixpacks.toml                     # Railway build
├── Procfile                          # Process definition
├── .gitignore
└── README.md
\`\`\`

## Core Collections (MongoDB)

### users
\`\`\`typescript
{
  _id: ObjectId
  email: string (unique, indexed)
  password: string (bcrypt hashed)
  firstName: string
  lastName: string
  phone?: string
  role: 'PLATFORM_ADMIN' | 'ORG_ADMIN' | 'ORG_MEMBER'
  organization: ObjectId (ref: organizations)
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### organizations
\`\`\`typescript
{
  _id: ObjectId
  name: string (unique, indexed)
  legalName: string
  type: 'startup' | 'research' | 'academic' | 'government' | 'corporate'
  registrationNumber?: string
  gst?: string
  pan?: string
  email: string
  phone: string
  website?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  isActive: boolean
  createdAt: Date
}
\`\`\`

### sites
\`\`\`typescript
{
  _id: ObjectId
  name: string
  code: string (unique, e.g., "BLR-01")
  address: {...}
  timezone: string ("Asia/Kolkata")
  operatingHours: {
    start: string ("09:00")
    end: string ("18:00")
  }
  isActive: boolean
}
\`\`\`

### labs (machinery)
\`\`\`typescript
{
  _id: ObjectId
  name: string
  code: string (unique, e.g., "TVAC-001")
  site: ObjectId (ref: sites)
  category: ObjectId (ref: categories)
  description: string
  specifications: object
  capacity: number (1 for exclusive, >1 for shared)
  slotGranularityMinutes: number (15, 30, 60)
  ratePerHour: number (INR)
  maintenanceWindows?: Array<{start: Date, end: Date}>
  availability: boolean
  images?: string[]
  isActive: boolean
}
\`\`\`

### components
\`\`\`typescript
{
  _id: ObjectId
  sku: string (unique)
  name: string
  category: ObjectId
  unitPrice: number (INR)
  rentalRatePerDay?: number
  stockQuantity: number
  leadTimeDays: number
  specifications: object
  isActive: boolean
}
\`\`\`

### requests
\`\`\`typescript
{
  _id: ObjectId
  requestNumber: string (auto, "REQ-2024-0001")
  organization: ObjectId
  createdBy: ObjectId (ref: users)
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'PAID'

  // Items requested
  machineryItems: [{
    lab: ObjectId
    site: ObjectId
    startTime: Date
    endTime: Date
    rateSnapshot: number
    durationHours: number
  }]

  components: [{
    component: ObjectId
    quantity: number
    priceSnapshot: number
  }]

  assistanceHours?: number
  assistanceRate?: number
  assignedStaff?: ObjectId[]

  // Pricing
  subtotal: number (INR)
  tax: number
  total: number

  // Admin fields
  reviewedBy?: ObjectId
  reviewedAt?: Date
  rejectionReason?: string

  // Audit trail
  statusHistory: [{
    status: string
    timestamp: Date
    user: ObjectId
    notes?: string
  }]

  createdAt: Date
  updatedAt: Date
}
\`\`\`

### invoices
\`\`\`typescript
{
  _id: ObjectId
  invoiceNumber: string ("INV-2024-0001")
  request: ObjectId
  organization: ObjectId

  lineItems: [{
    description: string
    quantity: number
    rate: number
    amount: number
  }]

  subtotal: number
  taxRate: number (18)
  taxAmount: number
  total: number
  currency: "INR"

  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate: Date
  paidAt?: Date

  createdAt: Date
}
\`\`\`

### payments
\`\`\`typescript
{
  _id: ObjectId
  paymentNumber: string
  invoice: ObjectId
  organization: ObjectId
  amount: number
  currency: "INR"
  method: 'RAZORPAY' | 'BANK_TRANSFER'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

  // Razorpay fields
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string

  // Bank transfer fields
  receiptUrl?: string
  bankReferenceNumber?: string
  verifiedBy?: ObjectId
  verifiedAt?: Date

  events: [{
    type: string
    timestamp: Date
    data: object
  }]

  createdAt: Date
}
\`\`\`

## API Endpoints

### Auth (`/api/auth`)
- `POST /register` - Register organization + admin user
- `POST /login` - Login with email/password
- `POST /refresh` - Refresh access token
- `POST /logout` - Invalidate tokens
- `POST /forgot-password` - Send reset link
- `POST /reset-password` - Reset with token

### Catalog (`/api/catalog`)
- `GET /categories` - List categories
- `GET /sites` - List sites
- `GET /labs` - List labs (filters: category, site, price range, availability)
- `GET /labs/:id` - Lab details
- `GET /components` - List components
- `GET /components/:id` - Component details

### Requests (`/api/requests`)
- `GET /` - List org requests (paginated)
- `POST /` - Create draft request
- `GET /:id` - Request details
- `PATCH /:id` - Update draft
- `POST /:id/submit` - Submit for review
- `POST /:id/extend` - Request extension (returns alternatives if unavailable)
- `GET /:id/invoice` - Get invoice PDF

### Availability (`/api/availability`)
- `POST /check` - Check time slots for labs
- `GET /calendar` - Calendar view by site/lab

### Admin (`/api/admin`)
- `GET /requests` - All requests queue
- `POST /requests/:id/review` - Approve/reject/request-resubmit
- `POST /requests/:id/assign` - Assign schedule + staff
- CRUD endpoints for:
  - `/categories`
  - `/sites`
  - `/labs`
  - `/components`
  - `/staff`
- `GET /organizations` - List orgs
- `PATCH /organizations/:id` - Update/disable org
- `GET /users` - List users
- `PATCH /users/:id` - Update/disable user

### Billing (`/api/billing`)
- `GET /invoices` - List org invoices
- `GET /invoices/:id` - Invoice details
- `GET /invoices/:id/pdf` - Download PDF

### Payments (`/api/payments`)
- `POST /razorpay/create-order` - Create Razorpay order
- `POST /razorpay/verify` - Verify payment signature
- `POST /razorpay/webhook` - Handle Razorpay webhooks
- `POST /bank-transfer` - Upload receipt
- `POST /bank-transfer/:id/verify` - Admin verify (approve/reject)

### Notifications (`/api/notifications`)
- `GET /` - List user notifications
- `PATCH /:id/read` - Mark as read
- `DELETE /:id` - Delete

## Technology Justifications

### Express vs Fastify
**Choice: Express**
- Mature ecosystem with extensive middleware
- Better TypeScript support out-of-box
- Team familiarity reduces onboarding time
- Razorpay SDK has better Express examples
- Performance difference negligible for B2B workload

### Custom JWT vs NextAuth
**Choice: Custom JWT**
- Full control over token structure (access + refresh)
- Simpler RBAC integration
- No session storage overhead
- Better for mobile API clients (future)
- Refresh token rotation built-in

### Mongoose vs Raw MongoDB
**Choice: Mongoose**
- Schema validation at ODM level
- Middleware hooks for audit logs
- Virtual fields for computed properties
- Better TypeScript typing with proper schemas
- Population for refs simplifies joins

## Security Measures

1. **Input Validation**: Zod schemas on all endpoints
2. **Rate Limiting**:
   - Auth: 5 req/min per IP
   - API: 100 req/min per IP
3. **CORS**: Whitelist frontend origin only
4. **Helmet**: CSP, HSTS, X-Frame-Options
5. **Password**: bcrypt with cost 12
6. **JWT**: HS256, 1h access, 7d refresh
7. **File Uploads**: Signed URLs, max 10MB
8. **Audit Logs**: All state changes tracked
9. **RBAC**: Middleware enforces permissions
10. **SQL Injection**: N/A (NoSQL + Mongoose sanitization)

## Deployment Architecture

### Frontend (Vercel)
\`\`\`bash
# Environment Variables (Vercel Dashboard)
NEXT_PUBLIC_API_URL=https://api.earth-to-orbit.com/api
NEXT_PUBLIC_SITE_URL=https://earth-to-orbit.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx

# Auto-deploys on git push to main
# Build: next build
# Output: .next/
\`\`\`

### Backend (Railway)
\`\`\`bash
# Environment Variables (Railway Dashboard)
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char-random>
JWT_REFRESH_SECRET=<64-char-random>
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RESEND_API_KEY=re_xxx
FRONTEND_URL=https://earth-to-orbit.com

# Start: node dist/server.js
# Health: GET /health
\`\`\`

### Database (MongoDB Atlas)
\`\`\`bash
# Cluster: M10+ (production)
# Region: Mumbai (ap-south-1)
# Backups: Enabled (daily snapshots)
# Network: IP Whitelist + VPC peering (optional)
\`\`\`

## Performance Optimizations

1. **Database Indexing**:
   - `users.email` (unique)
   - `organizations.name` (unique)
   - `labs.code` (unique)
   - `requests.requestNumber` (unique)
   - `requests.organization + status` (compound)
   - `invoices.invoiceNumber` (unique)

2. **Caching**: None initially; add Redis for session/catalog if needed

3. **Pagination**: Default 20 items; max 100

4. **Connection Pooling**: MongoDB pool (min: 5, max: 10)

5. **Compression**: gzip middleware enabled

## Observability

### Logging (Pino)
\`\`\`typescript
// Structured JSON logs
logger.info({ requestId, userId, method, path }, 'Request processed')
logger.error({ err, requestId }, 'Payment verification failed')
\`\`\`

### Metrics (Future: OpenTelemetry)
- Request latency (p50, p95, p99)
- Error rate by endpoint
- DB query time
- Active connections

### Monitoring
- Railway: Built-in metrics + logs
- Uptime: UptimeRobot or Pingdom
- Alerts: Email on 5xx errors, DB disconnects

## Next Steps (Post-MVP)

1. **Email Verification**: Verify email on registration
2. **2FA**: TOTP for admins
3. **Webhooks**: Allow orgs to receive events
4. **Mobile App**: React Native with same API
5. **Analytics**: Plausible or Umami
6. **Advanced Scheduling**: Recurring bookings
7. **Multi-currency**: USD, EUR support
8. **Internationalization**: i18n for UI
9. **GraphQL**: Optional for frontend flexibility
10. **Kubernetes**: Migrate from Railway for scaling
