# Earth To Orbit - API Documentation

Base URL: `http://localhost:4000/api` (Development)

All API responses follow this format:

```json
{
  "success": true | false,
  "data": { ... },
  "error": { "message": "...", "code": "..." }
}
```

---

## Authentication

### POST /auth/register

Register a new organization with an admin user.

**Request Body:**
```json
{
  "organization": {
    "name": "SpaceTech Industries",
    "legalName": "SpaceTech Industries Private Limited",
    "registrationNumber": "U12345KA2024PTC123456",
    "gstNumber": "29ABCDE1234F1Z5",
    "industry": "Satellite Manufacturing",
    "address": {
      "street": "123 Tech Park",
      "city": "Bangalore",
      "state": "Karnataka",
      "postalCode": "560001",
      "country": "India"
    },
    "contactEmail": "contact@spacetech.in",
    "contactPhone": "+91-80-12345678"
  },
  "user": {
    "email": "admin@spacetech.in",
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
    "user": {
      "_id": "...",
      "email": "admin@spacetech.in",
      "role": "ORG_ADMIN",
      "organizationId": "..."
    },
    "organization": {
      "_id": "...",
      "name": "SpaceTech Industries"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### POST /auth/login

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "admin@spacetech.in",
  "password": "SecurePass@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "admin@spacetech.in",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ORG_ADMIN",
      "organizationId": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### GET /auth/me

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "admin@spacetech.in",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ORG_ADMIN",
    "organizationId": {...}
  }
}
```

---

## Catalog

### GET /catalog/sites

List all sites.

**Response:**
```json
{
  "success": true,
  "data": {
    "sites": [
      {
        "_id": "...",
        "name": "Bangalore Aerospace Center",
        "code": "BLR-01",
        "address": {...},
        "operatingHours": {...},
        "timezone": "Asia/Kolkata"
      }
    ]
  }
}
```

### GET /catalog/labs

List labs/machinery. Optionally filter by site or category.

**Query Parameters:**
- `siteId` (optional): Filter by site
- `categoryId` (optional): Filter by category

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
        "siteId": {...},
        "categoryId": {...},
        "ratePerHour": 15000,
        "capacity": 1,
        "specifications": {
          "temperatureRange": "-180°C to +150°C",
          "pressure": "10^-6 Torr",
          "chamberSize": "2m x 2m x 3m"
        }
      }
    ]
  }
}
```

### GET /catalog/components

List available components for purchase/rental.

**Response:**
```json
{
  "success": true,
  "data": {
    "components": [
      {
        "_id": "...",
        "name": "On-Board Computer (OBC)",
        "code": "OBC-RAD750",
        "category": "Avionics",
        "pricing": {
          "type": "PURCHASE",
          "amount": 185000
        },
        "specifications": {...}
      }
    ]
  }
}
```

---

## Requests

### POST /requests

Create a new booking request (DRAFT status).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "TVAC Testing for CubeSat",
  "description": "Thermal vacuum testing for 3U CubeSat prototype",
  "machineryItems": [
    {
      "labId": "...",
      "siteId": "...",
      "requestedStart": "2024-12-01T10:00:00.000Z",
      "requestedEnd": "2024-12-01T16:00:00.000Z",
      "durationHours": 6
    }
  ],
  "componentItems": [
    {
      "componentId": "...",
      "quantity": 1,
      "purpose": "PURCHASE"
    }
  ],
  "assistanceItems": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "requestNumber": "REQ-2024-00001",
    "status": "DRAFT",
    "totals": {
      "machinerySubtotal": 90000,
      "componentsSubtotal": 185000,
      "subtotal": 275000,
      "taxAmount": 49500,
      "total": 324500
    }
  }
}
```

### POST /requests/:id/submit

Submit a draft request for admin approval. Performs availability check.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "SUBMITTED",
    "submittedAt": "2024-11-06T12:00:00.000Z"
  }
}
```

### GET /requests

List user's requests with pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [...],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

### GET /requests/:id

Get request details including invoices.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "requestNumber": "REQ-2024-00001",
    "title": "...",
    "status": "APPROVED",
    "machineryItems": [...],
    "componentItems": [...],
    "totals": {...},
    "invoices": [...]
  }
}
```

### POST /requests/:id/extension

Request additional hours for an approved booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "additionalHours": 2,
  "requestedEnd": "2024-12-01T18:00:00.000Z",
  "reason": "Additional testing required due to unexpected results"
}
```

---

## Admin Endpoints

**All admin endpoints require Platform Admin role.**

### POST /requests/:id/approve

Approve a submitted request. Automatically generates invoice.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "scheduledStart": "2024-12-01T10:00:00.000Z",
  "scheduledEnd": "2024-12-01T16:00:00.000Z",
  "notes": "Approved. Please arrive 30 minutes early for briefing."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {...},
    "invoice": {
      "_id": "...",
      "invoiceNumber": "INV-2024-00001",
      "totalAmount": 324500
    }
  }
}
```

### POST /requests/:id/reject

Reject a submitted request.

**Request Body:**
```json
{
  "reason": "Requested time slot is not available. Please select an alternative date."
}
```

### GET /admin/requests/pending

List all pending requests awaiting approval.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [...]
  }
}
```

---

## Payments

### POST /payments/razorpay/order

Create a Razorpay order for invoice payment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "invoiceId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_...",
    "amount": 324500,
    "currency": "INR",
    "key": "rzp_test_..."
  }
}
```

### POST /payments/razorpay/verify

Verify Razorpay payment after checkout.

**Request Body:**
```json
{
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "...",
  "invoiceId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "_id": "...",
      "status": "COMPLETED",
      "transactionId": "pay_..."
    }
  }
}
```

### POST /payments/bank-transfer

Submit bank transfer payment for admin verification.

**Request Body:**
```json
{
  "invoiceId": "...",
  "bankName": "HDFC Bank",
  "transactionId": "UTR123456789",
  "receiptUrl": "https://s3.amazonaws.com/..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "_id": "...",
      "status": "PENDING_VERIFICATION"
    }
  }
}
```

### POST /admin/payments/:id/approve-bank-transfer

Approve a bank transfer payment (Admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "_id": "...",
      "status": "COMPLETED"
    }
  }
}
```

### GET /admin/payments/pending-verification

List all bank transfer payments awaiting verification.

---

## Invoices

### GET /invoices

List user's invoices.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "_id": "...",
        "invoiceNumber": "INV-2024-00001",
        "requestId": {...},
        "totalAmount": 324500,
        "paymentStatus": "PENDING",
        "dueDate": "2024-12-08T00:00:00.000Z"
      }
    ]
  }
}
```

### GET /invoices/:id/download

Download invoice as PDF.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** PDF file download

---

## Availability

### POST /availability/check

Check if a time slot is available and get alternatives if not.

**Request Body:**
```json
{
  "labId": "...",
  "siteId": "...",
  "requestedStart": "2024-12-01T10:00:00.000Z",
  "requestedEnd": "2024-12-01T16:00:00.000Z",
  "excludeRequestId": "..." // Optional: for rescheduling
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isAvailable": false,
    "conflicts": [
      {
        "requestNumber": "REQ-2024-00005",
        "start": "2024-12-01T14:00:00.000Z",
        "end": "2024-12-01T18:00:00.000Z"
      }
    ],
    "alternatives": [
      {
        "start": "2024-12-01T07:00:00.000Z",
        "end": "2024-12-01T13:00:00.000Z"
      },
      {
        "start": "2024-12-02T10:00:00.000Z",
        "end": "2024-12-02T16:00:00.000Z"
      }
    ]
  }
}
```

---

## Notifications

### GET /notifications

List user's notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "...",
        "title": "Request Approved",
        "message": "Your request REQ-2024-00001 has been approved",
        "type": "REQUEST_APPROVED",
        "isRead": false,
        "createdAt": "2024-11-06T12:00:00.000Z"
      }
    ]
  }
}
```

### PUT /notifications/:id/read

Mark notification as read.

### PUT /notifications/mark-all-read

Mark all notifications as read.

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Request validation failed |
| `CONFLICT` | Resource conflict (e.g., time slot unavailable) |
| `PAYMENT_FAILED` | Payment verification failed |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limits

- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- Returns `429 Too Many Requests` when exceeded

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```
