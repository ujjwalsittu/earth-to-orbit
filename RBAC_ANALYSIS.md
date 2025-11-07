# RBAC Analysis - Earth To Orbit Platform

## Current Role Structure

### 1. **PLATFORM_ADMIN** (Super Admin) ✅

**Purpose**: Platform owner/operator who manages the entire system

**Backend Access**:
- ✅ `/api/admin/*` - All admin routes protected by `isPlatformAdmin`
- ✅ Approve/reject booking requests
- ✅ Verify bank transfer payments
- ✅ View all organizations
- ✅ View all users
- ✅ Verify organizations
- ✅ Platform-wide statistics

**Frontend Access**:
- ✅ `/admin` - Dedicated admin dashboard
- ✅ `/admin/requests` - Review all requests
- ✅ `/admin/payments` - Verify payments
- ✅ `/admin/users` - View all users
- ✅ `/admin/catalog` - Manage catalog

**Status**: ✅ **FULLY IMPLEMENTED**

---

### 2. **ORG_ADMIN** (Organization Admin) ⚠️

**Purpose**: Organization owner who manages their team and organizational resources

**Backend Access**:
- ✅ Scoped to own organization data (via `req.user.organization`)
- ✅ Can create requests for organization
- ✅ Can view organization's requests
- ✅ Can view organization's invoices
- ❌ **MISSING**: No team management endpoints
- ❌ **MISSING**: Cannot invite/remove team members
- ❌ **MISSING**: Cannot view org-level analytics

**Frontend Access**:
- ✅ `/dashboard` - Standard dashboard (same as ORG_MEMBER)
- ❌ **MISSING**: No organization dashboard
- ❌ **MISSING**: No team management UI
- ❌ **MISSING**: No org settings page
- ❌ **MISSING**: No org-level analytics

**Status**: ⚠️ **PARTIALLY IMPLEMENTED - MISSING KEY FEATURES**

---

### 3. **ORG_MEMBER** (Team Member) ✅

**Purpose**: Team member who can create requests and view organization data

**Backend Access**:
- ✅ Scoped to own organization data
- ✅ Can create requests
- ✅ Can view organization's requests
- ✅ Can view organization's invoices

**Frontend Access**:
- ✅ `/dashboard` - Personal dashboard
- ✅ `/dashboard/requests` - View requests
- ✅ `/dashboard/requests/new` - Create requests
- ✅ `/dashboard/invoices` - View invoices

**Status**: ✅ **FULLY IMPLEMENTED**

---

## Critical Gaps Identified

### 🚨 Gap 1: Org Admin Has No Special Privileges

**Problem**: ORG_ADMIN and ORG_MEMBER have identical access and UI

**Impact**: Organizations cannot:
- Manage team members
- Control who joins/leaves
- View organization-level insights
- Update organization settings

**Required Features**:
1. Team management (invite/remove users)
2. Organization settings page
3. Org-level analytics dashboard
4. Budget/usage tracking

---

### 🚨 Gap 2: No Organization Routes

**Problem**: No `/api/organizations/:id` routes for org management

**Missing Endpoints**:
```
GET    /api/organizations/:id/members      # List team members
POST   /api/organizations/:id/members      # Invite member
DELETE /api/organizations/:id/members/:id  # Remove member
GET    /api/organizations/:id/stats        # Org analytics
PATCH  /api/organizations/:id              # Update org settings
```

---

### 🚨 Gap 3: No Frontend Differentiation

**Problem**: Dashboard doesn't change based on ORG_ADMIN role

**Missing UI Components**:
- Organization overview dashboard
- Team members list
- Invite team member form
- Organization settings
- Usage/budget tracking

---

## Recommended Implementation

### Phase 1: Backend Organization Routes ⭐ HIGH PRIORITY

**File**: `apps/api/src/routes/organization.routes.ts`

```typescript
// Required endpoints:
router.get('/:id', authenticate, sameOrganizationOrAdmin, getOrganization)
router.patch('/:id', authenticate, isOrgAdmin, updateOrganization)
router.get('/:id/members', authenticate, sameOrganizationOrAdmin, getMembers)
router.post('/:id/invite', authenticate, isOrgAdmin, inviteMember)
router.delete('/:id/members/:userId', authenticate, isOrgAdmin, removeMember)
router.get('/:id/stats', authenticate, isOrgAdmin, getOrgStats)
```

### Phase 2: Frontend Org Admin Dashboard ⭐ HIGH PRIORITY

**Files to Create**:
- `apps/web/app/dashboard/organization/page.tsx` - Org overview
- `apps/web/app/dashboard/team/page.tsx` - Team management
- `apps/web/components/organization/*` - Org components

**UI Features**:
- Organization details card
- Team members table with invite/remove
- Organization-level request statistics
- Budget tracking (if applicable)
- Usage analytics

### Phase 3: Enhanced Navigation

**Update**: `apps/web/components/dashboard/nav.tsx`

Add conditional nav items for ORG_ADMIN:
```typescript
const orgAdminItems = user?.role === 'ORG_ADMIN' ? [
  { href: '/dashboard/organization', label: 'Organization', icon: Building },
  { href: '/dashboard/team', label: 'Team', icon: Users },
] : [];
```

---

## Current Access Matrix

| Feature | PLATFORM_ADMIN | ORG_ADMIN | ORG_MEMBER |
|---------|----------------|-----------|------------|
| View all organizations | ✅ | ❌ | ❌ |
| Approve requests | ✅ | ❌ | ❌ |
| Verify payments | ✅ | ❌ | ❌ |
| Manage catalog | ✅ | ❌ | ❌ |
| View org dashboard | ✅ | ❌ | ❌ |
| Manage team members | N/A | ❌ | ❌ |
| Invite users | N/A | ❌ | ❌ |
| Remove users | N/A | ❌ | ❌ |
| View org analytics | N/A | ❌ | ❌ |
| Update org settings | N/A | ❌ | ❌ |
| Create requests | ❌ | ✅ | ✅ |
| View org requests | ✅ | ✅ | ✅ |
| View invoices | ✅ | ✅ | ✅ |

**Legend:**
- ✅ Implemented
- ❌ Not implemented
- N/A Not applicable

---

## Security Considerations

### Existing (Good):
1. ✅ Role-based middleware properly enforced
2. ✅ Organization scoping in backend queries
3. ✅ Frontend route protection with `ProtectedRoute`
4. ✅ JWT authentication

### To Implement:
1. ⚠️ Prevent ORG_ADMIN from removing themselves
2. ⚠️ Ensure at least one ORG_ADMIN per organization
3. ⚠️ Email verification for invited members
4. ⚠️ Audit log for team changes

---

## Next Steps

1. **Immediate**: Create organization routes (Backend)
2. **High Priority**: Add team management UI (Frontend)
3. **High Priority**: Create org admin dashboard
4. **Medium**: Add organization statistics
5. **Medium**: Implement invite workflow with emails
6. **Low**: Add audit logging

---

## Conclusion

**Current State**:
- ✅ Platform Admin fully functional
- ⚠️ Org Admin missing 80% of expected features
- ✅ Org Member fully functional

**Risk**: Organizations cannot effectively manage their teams, which is a critical business requirement for a B2B platform.

**Recommendation**: Implement Phase 1 (organization routes) and Phase 2 (team management UI) before production launch.
