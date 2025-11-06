# Earth To Orbit - Complete Project Structure

This document provides a comprehensive overview of all files in the repository.

## 📁 Root Structure

```
earth-to-orbit/
├── apps/               # Application workspaces
│   ├── api/           # Backend Express API
│   └── web/           # Frontend Next.js app
├── packages/          # Shared packages
│   └── emails/        # React Email templates
├── scripts/           # Utility scripts
├── infra/            # Infrastructure configs
│   └── docker/       # Docker configs
├── docs/             # Documentation
├── .gitignore
├── package.json      # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json        # Turborepo config
├── README.md
├── DEPLOYMENT.md
└── PROJECT_STRUCTURE.md (this file)
```

## 🔧 Backend API (`apps/api/`)

### Configuration
```
apps/api/
├── .env.example                    # Environment variables template
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts                   # Entry point
    ├── app.ts                      # Express app setup
    └── config/
        ├── database.ts             # MongoDB connection
        └── env.ts                  # Environment validation (Zod)
```

### Database Models (12 models)
```
src/models/
├── User.ts                         # User authentication
├── Organization.ts                 # Customer organizations
├── Request.ts                      # Booking requests
├── Lab.ts                          # Testing facilities
├── Component.ts                    # Bookable equipment
├── Category.ts                     # Equipment categories
├── Site.ts                         # Facility locations
├── Staff.ts                        # Site staff
├── Invoice.ts                      # Billing invoices
├── Payment.ts                      # Payment records
├── Notification.ts                 # User notifications
└── AuditLog.ts                     # Activity logging
```

### Routes (8 route files)
```
src/routes/
├── auth.routes.ts                  # POST /auth/register, /login, /refresh
├── request.routes.ts               # CRUD for booking requests
├── catalog.routes.ts               # GET facilities, components
├── billing.routes.ts               # Invoice management
├── payment.routes.ts               # Razorpay integration
├── admin.routes.ts                 # Admin operations
├── availability.routes.ts          # Calendar availability
└── notification.routes.ts          # User notifications
```

### Services (5 services)
```
src/services/
├── email.service.ts                # Resend email integration
├── billing.service.ts              # Invoice generation
├── payment.service.ts              # Razorpay payment processing
├── notification.service.ts         # Notification delivery
└── scheduling.service.ts           # Booking conflict detection
```

### Middleware (5 middleware)
```
src/middleware/
├── auth.middleware.ts              # JWT authentication
├── rbac.middleware.ts              # Role-based access control
├── validation.middleware.ts        # Zod request validation
├── error.middleware.ts             # Global error handler
└── rate-limit.middleware.ts        # API rate limiting
```

### Utilities
```
src/utils/
├── logger.ts                       # Pino logger
├── api-error.ts                    # Custom error class
├── response.ts                     # Standard API responses
├── async-handler.ts                # Async route wrapper
├── request-id.ts                   # Request ID generation
└── generate-number.ts              # Invoice/request numbering
```

## 🎨 Frontend Web (`apps/web/`)

### Configuration
```
apps/web/
├── .env.example                    # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts              # Tailwind CSS config
├── next.config.js                  # Next.js config
└── app/
    ├── layout.tsx                  # Root layout
    ├── page.tsx                    # Landing page
    ├── loading.tsx                 # Loading state
    ├── error.tsx                   # Error boundary
    ├── not-found.tsx               # 404 page
    └── globals.css                 # Global styles + animations
```

### Library/Utils
```
lib/
├── api-client.ts                   # API fetch wrapper
├── store.ts                        # Zustand auth store
├── utils.ts                        # Utility functions (cn, etc.)
└── config.ts                       # Frontend configuration
```

### Public Pages (3 pages)
```
app/
├── page.tsx                        # Landing page (fully responsive)
├── login/page.tsx                  # Login page
└── register/page.tsx               # Registration (2-step form)
```

### Dashboard Pages (6 pages)
```
app/dashboard/
├── layout.tsx                      # Dashboard layout with nav
├── page.tsx                        # Dashboard home (stats)
├── requests/
│   ├── page.tsx                   # All requests list
│   ├── new/page.tsx               # Multi-step booking wizard
│   └── [id]/page.tsx              # Request details + payment
├── invoices/page.tsx              # Invoice list with PDF download
├── notifications/page.tsx         # Notification center
└── settings/page.tsx              # Profile & org settings (tabs)
```

### Admin Pages (5 pages)
```
app/admin/
├── layout.tsx                      # Admin layout with nav
├── page.tsx                        # Admin dashboard (stats)
├── requests/page.tsx              # Manage all requests
├── users/page.tsx                 # Manage users & orgs (tabs)
├── catalog/page.tsx               # Manage facilities
└── payments/page.tsx              # Bank transfer verification
```

### Components

#### UI Components (14 components - shadcn/ui)
```
components/ui/
├── button.tsx                      # Button component
├── input.tsx                       # Input field
├── textarea.tsx                    # Textarea
├── label.tsx                       # Form label
├── card.tsx                        # Card container
├── badge.tsx                       # Status badge
├── select.tsx                      # Dropdown select
├── dialog.tsx                      # Modal dialog
├── tabs.tsx                        # Tab navigation
├── table.tsx                       # Data table
├── skeleton.tsx                    # Loading skeleton
├── toast.tsx                       # Toast notification
├── toaster.tsx                     # Toast container
└── use-toast.ts                    # Toast hook
```

#### Feature Components (3 components)
```
components/
├── auth/
│   └── protected-route.tsx        # HOC for route protection
├── dashboard/
│   └── nav.tsx                    # Dashboard navigation
├── admin/
│   └── nav.tsx                    # Admin navigation
└── extension-request-dialog.tsx   # Booking extension dialog
```

## 📧 Email Templates (`packages/emails/`)

```
packages/emails/
├── package.json
├── templates/
│   ├── registration.tsx            # Welcome email
│   ├── forgot-password.tsx         # Password reset
│   ├── request-submitted.tsx       # Request confirmation
│   ├── request-approved.tsx        # Request approved + invoice
│   ├── request-rejected.tsx        # Request rejected
│   ├── request-resubmit.tsx        # Resubmission required
│   ├── payment-received.tsx        # Payment confirmation
│   └── extension-request.tsx       # Extension notification
└── index.ts                        # Export all templates
```

## 🗄️ Database Seed (`scripts/`)

```
scripts/
└── seed-data.ts                    # Seed script
    ├── Creates platform admin
    ├── Creates 2 facility sites
    ├── Creates 23+ facilities (TVAC, Vibration, etc.)
    ├── Creates 30+ components
    ├── Creates 4 staff members
    └── Creates demo organization + users
```

## 🐳 Infrastructure (`infra/docker/`)

```
infra/docker/
├── Dockerfile.api                  # Backend Docker image
├── Dockerfile.web                  # Frontend Docker image
├── docker-compose.yml              # Full stack compose
└── .dockerignore
```

## 📚 Documentation (`docs/`)

```
docs/
└── API.md                          # Complete API documentation
    ├── Authentication endpoints
    ├── Catalog endpoints
    ├── Request endpoints
    ├── Billing endpoints
    ├── Payment endpoints
    ├── Admin endpoints
    └── Request/response examples
```

## 🎯 Key Features Implemented

### Backend Features
✅ JWT Authentication with refresh tokens
✅ Role-Based Access Control (3 roles)
✅ Request booking workflow (7 states)
✅ Razorpay + Bank Transfer payments
✅ Invoice generation with GST
✅ Email notifications (8 templates)
✅ Calendar availability checking
✅ Conflict detection
✅ File uploads to S3
✅ Rate limiting
✅ Request validation (Zod)
✅ Audit logging
✅ Error handling

### Frontend Features
✅ Responsive design (mobile/tablet/desktop)
✅ Mobile hamburger menu
✅ Landing page with animations
✅ Multi-step booking wizard
✅ Payment integration (Razorpay)
✅ Invoice PDF download
✅ Real-time search & filters
✅ Loading skeletons
✅ Toast notifications
✅ Protected routes
✅ Admin dashboard with stats
✅ User settings (profile + org)
✅ Extension request dialog
✅ Error pages (404, 500)

### Security Features
✅ Password hashing (bcrypt)
✅ JWT authentication
✅ CORS configuration
✅ Rate limiting
✅ Input validation
✅ SQL injection prevention (MongoDB)
✅ XSS protection
✅ Environment variable validation

## 📊 Statistics

- **Total Files**: 100+ source files
- **Backend Routes**: 8 route files, 50+ endpoints
- **Database Models**: 12 models
- **Frontend Pages**: 15 pages
- **UI Components**: 17 components
- **Email Templates**: 8 templates
- **Lines of Code**: 15,000+ lines

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Setup Environment**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   # Edit .env files with your credentials
   ```

3. **Start Development**
   ```bash
   # Terminal 1 - Backend
   cd apps/api && pnpm dev

   # Terminal 2 - Frontend
   cd apps/web && pnpm dev
   ```

4. **Seed Database**
   ```bash
   cd apps/api && pnpm run seed
   ```

## 📝 Notes

- All environment variables are documented in `.env.example` files
- All endpoints are documented in `docs/API.md`
- Deployment guide available in `DEPLOYMENT.md`
- All code follows TypeScript strict mode
- Frontend uses Next.js 14 App Router
- Backend uses Express with TypeScript
- Database uses MongoDB with Mongoose
- Email templates use React Email
- Styling uses Tailwind CSS + shadcn/ui

---

**Complete, Production-Ready E2O Platform** 🚀
