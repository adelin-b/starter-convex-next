# Admin & Agency Management - BDD Feature Documentation

This directory contains Behavior-Driven Development (BDD) feature files for VroomMarket's admin and agency management functionality.

## Overview

The admin system allows agency owners to manage agencies, members, and role assignments. Access is controlled through role-based authorization where only users with the "owner" role can access admin features.

## Feature Files

### 1. admin-access.feature
**Purpose:** Tests authentication and authorization for admin dashboard access

**Key Scenarios:**
- Unauthenticated users are blocked from admin features
- Users with only "commercial" role cannot access admin
- Users with "owner" role can access admin dashboard
- Navigation between admin sections
- Session persistence and role revocation
- Multi-agency access scenarios

**Business Value:** Ensures only authorized users can access administrative functions, protecting sensitive operations.

---

### 2. agency-management.feature
**Purpose:** Tests CRUD operations for agencies

**Key Scenarios:**
- View empty and populated agency lists
- Create agencies with required and optional fields
- View agency details in cards
- Delete agencies with confirmation
- Validation for duplicate names, required fields, email format
- Navigation to member management
- Loading states and error handling

**Business Value:** Enables agency owners to effectively manage their agency portfolio and organizational structure.

---

### 3. member-management.feature
**Purpose:** Tests adding, viewing, and removing agency members

**Key Scenarios:**
- View empty and populated member lists
- Add members with single or multiple roles
- View member details with role badges
- Remove members with confirmation
- Validation for duplicate memberships, required fields
- Members overview across all agencies
- Cross-agency membership handling

**Business Value:** Allows agency owners to control team membership and access to agency resources.

---

### 4. role-assignment.feature
**Purpose:** Tests role assignment and role management functionality

**Key Scenarios:**
- View available role types and descriptions
- Assign single or multiple roles to members
- Update existing member roles (add/remove)
- Role toggle UI interactions
- Validation for minimum role requirement
- Roles are cumulative (not exclusive)
- Different roles across different agencies
- Visual badge styling and display

**Business Value:** Provides granular control over user permissions and responsibilities within agencies.

---

### 5. role-based-access.feature
**Purpose:** Tests comprehensive role-based access control (RBAC) enforcement

**Key Scenarios:**
- Commercial role permissions (restricted)
- Owner role permissions (full access)
- Combined roles (commercial + owner)
- API-level authorization enforcement
- Cross-agency permission scenarios
- Error messages for authorization failures
- Frontend AuthGuard protection
- Backend authorization helpers
- Real-time permission updates

**Business Value:** Ensures security and proper access control across the entire platform, preventing unauthorized operations.

---

## Domain Model

### Roles

#### Commercial
- **Purpose:** Sales representative role
- **Permissions:** Basic agency access, client relationship management
- **Access:** Cannot access admin features
- **Business Focus:** Managing leads and customer relationships

#### Owner
- **Purpose:** Agency owner/administrator role
- **Permissions:** Full agency management capabilities
- **Access:** Complete admin dashboard access
- **Business Focus:** Managing agency settings, members, and roles

### Key Concepts

#### Role Accumulation
Users can have multiple roles simultaneously (e.g., both "commercial" and "owner"). Roles are cumulative, meaning permissions are combined, not replaced.

#### Admin Access
Admin access is granted to any user who has the "owner" role in at least one agency. This grants platform-wide access to manage all agencies and members.

#### Cross-Agency Permissions
A user can be a member of multiple agencies with different roles in each. For example:
- Owner in "Agency A"
- Commercial in "Agency B"
- Both roles in "Agency C"

Having owner role in any agency grants access to manage all agencies.

#### Membership Lifecycle
1. User is added to agency with at least one role
2. Roles can be updated (added/removed) while maintaining minimum of one role
3. User can be removed from agency, losing all roles and access
4. Agency deletion cascades to remove all memberships

---

## Test Tags

Features are tagged for selective test execution:

- `@admin` - All admin-related features
- `@agencies` - Agency management features
- `@members` - Member management features
- `@roles` - Role assignment features
- `@rbac` - Role-based access control features
- `@authorization` - Authentication and authorization tests
- `@future` - Planned features not yet implemented

**Example usage:**
```bash
# Run all admin tests
npm run test:e2e -- --tags "@admin"

# Run only agency management tests
npm run test:e2e -- --tags "@agencies"

# Run RBAC tests
npm run test:e2e -- --tags "@rbac"

# Skip future features
npm run test:e2e -- --tags "not @future"
```

---

## Business Rules

### Agency Rules
1. Agency names must be globally unique
2. Agency name is required; all other fields are optional
3. Deleting an agency removes all its members (cascade delete)
4. Only agency owners can create, modify, or delete agencies

### Membership Rules
1. A user can only have one membership per agency
2. Memberships must have at least one role assigned
3. The same user can be a member of multiple agencies
4. Removing the last role effectively removes the membership
5. Only agency owners can add/remove members

### Authorization Rules
1. Only authenticated users can access the platform
2. Only users with "owner" role can access admin features
3. Having "owner" role in any agency grants access to manage all agencies
4. Commercial role alone does not grant admin access
5. Roles can be cumulated (multiple roles per user per agency)

---

## Supporting Documentation

- **GLOSSARY.md** - Business terminology and definitions
- **DDD-MAPPING.md** - Domain-Driven Design model and relationships

---

## Implementation Notes

### Current Implementation Status

**Implemented:**
- ✅ Admin dashboard with sections
- ✅ Agency CRUD operations
- ✅ Member add/remove operations
- ✅ Role assignment and updates
- ✅ Authorization checks (owner role required)
- ✅ AuthGuard component for frontend protection
- ✅ Backend authorization helpers
- ✅ Error handling and validation
- ✅ Loading states
- ✅ Internationalization (react-intl)

**Partially Implemented:**
- ⚠️ Agency update functionality (schema exists, UI not fully implemented)

**Not Yet Implemented:**
- ❌ Role change audit trail
- ❌ Pagination for large lists
- ❌ Search/filter functionality

### Known Limitations

1. **Admin Definition:** "Admin access" means having the "owner" role in any agency. There is no separate platform-level "Admin" role.

2. **Update Operations:** While the backend supports updating agency details, the current UI implementation focuses on create and delete operations.

3. **No Audit Trail:** Role changes and member additions/removals are not currently logged or tracked historically.

4. **User Management:** The system works with user IDs from the authentication provider. There's no built-in user discovery or search functionality.

---

## Test Data Patterns

### User ID Format
Test scenarios use descriptive user IDs like:
- `user-001`, `user-002` (sequential)
- `user-commercial`, `user-owner` (role-based)
- `user-multi-agency` (scenario-based)

### Agency Names
Test scenarios use descriptive agency names:
- "Main Agency", "Test Agency" (generic)
- "Sales Pro", "Auto Dealers" (business-specific)
- "Agency A", "Agency B" (multi-agency tests)

### Test Organization
Each scenario follows the pattern:
1. **Given** - Setup preconditions
2. **When** - Perform action
3. **Then** - Assert expected outcome

---

## Integration Points

### Backend (Convex)
- **Schema:** `packages/backend/convex/schema.ts`
- **Agencies API:** `packages/backend/convex/agencies.ts`
- **Auth Integration:** `packages/backend/convex/auth.ts`
- **Error Handling:** `packages/backend/convex/lib/errors.ts`

### Frontend (Next.js)
- **Admin Pages:** `apps/web/src/app/admin/`
- **Components:** `apps/web/src/components/auth-guard.tsx`
- **UI Library:** `packages/ui/` (shadcn/ui components)

### Authentication
- **Provider:** Better-Auth
- **User Identity:** Retrieved via `ctx.auth.getUserIdentity()`
- **Session Management:** Handled by Better-Auth SDK

---

## Running the Tests

### Prerequisites
```bash
# Install dependencies
bun install

# Setup Convex backend
bun run dev:setup
```

### Execute Tests
```bash
# Run all E2E tests
bun run test:e2e

# Run with UI for debugging
bun run test:e2e:ui

# Run specific feature
bun run test:e2e -- apps/e2e/tests/features/admin/admin-access.feature

# Run tests with specific tag
bun run test:e2e -- --tags "@admin"
```

### Coverage
```bash
# Generate E2E coverage report
bun run coverage:e2e

# View combined coverage (unit + E2E)
bun run coverage:report
```

---

## Contributing

When adding new admin features:

1. **Update feature files** - Add scenarios to appropriate feature file
2. **Update glossary** - Add new terms to GLOSSARY.md
3. **Update DDD mapping** - Document new entities/relationships in DDD-MAPPING.md
4. **Implement step definitions** - Add/update steps in `apps/e2e/tests/step-definitions/`
5. **Run tests** - Verify all scenarios pass
6. **Update this README** - Document changes and new features

---

## Related Documentation

- [Project CLAUDE.md](../../../../../CLAUDE.md) - Overall project documentation
- [Better-T-Stack](https://github.com/better-auth/better-auth) - Authentication framework
- [Convex Docs](https://docs.convex.dev) - Backend platform documentation
- [Playwright BDD](https://github.com/vitalets/playwright-bdd) - Testing framework

---

## Questions & Support

For questions about:
- **Test implementation:** See step definitions in `apps/e2e/tests/step-definitions/`
- **Backend logic:** Check `packages/backend/convex/agencies.ts`
- **Frontend components:** Review files in `apps/web/src/app/admin/`
- **Authorization:** See `packages/backend/convex/lib/errors.ts` and AuthGuard component
