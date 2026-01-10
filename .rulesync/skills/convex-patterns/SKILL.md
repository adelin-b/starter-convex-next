---
name: convex-patterns
description: >-
  Use when working with Convex backend code. Covers zodTable schemas, indexing,
  authentication, authorization helpers, error handling with AppErrors.
targets:
  - '*'
---
# Convex Backend Patterns

This skill documents Convex patterns for VroomMarket: schema validation, indexing, authentication, and query patterns.

## Patterns

### 1. zodTable Schema Validation

Use `zodTable` with Zod validators for schema definitions. zodTable provides runtime validation on insert/update, type inference for TypeScript, and consistent validation rules.

```typescript
// Improvement needed - raw defineTable without validation
export default defineSchema({
  vehicles: defineTable({
    make: v.string(),     // No min/max
    year: v.number(),     // No range check
    status: v.string(),   // Should be enum
  }),
});

// Recommended approach - zodTable with validation
import { z } from "zod";
import { zodTable } from "zodvex";

export const Vehicles = zodTable("vehicles", {
  make: z.string().min(1, "Make required").max(255),
  year: z.number().min(1900).max(2026),
  status: z.enum(vehicleStatuses),  // Uses const array
  fuelType: z.enum(fuelTypes),
});

export default defineSchema({
  vehicles: Vehicles.table,
});
```

### 2. Index Definitions

Define indexes for all fields used in queries. Queries without indexes scan entire tables - O(n) vs O(log n).

```typescript
// Improvement needed - querying without index
const vehicle = await ctx.db.query("vehicles")
  .filter(q => q.eq(q.field("licensePlate"), plate)) // Full table scan
  .first();

// Recommended approach - using index
const vehicle = await ctx.db.query("vehicles")
  .withIndex("by_license_plate", q => q.eq("licensePlate", plate))
  .first();
```

Schema should define indexes:
```typescript
export default defineSchema({
  vehicles: defineTable({...})
    .index("by_license_plate", ["licensePlate"])
    .index("by_status", ["status"])
    .index("by_owner", ["ownerId"]),
});
```

### 3. Authentication Pattern

Check auth at the START of every mutation/query that requires it.

```typescript
export const createVehicle = mutation({
  args: { data: Vehicles.zodValidator },
  handler: async (ctx, args) => {
    // FIRST: Auth check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create vehicle");
    }

    // THEN: Get user from database
    const user = await ctx.db.query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    if (!user) {
      throw AppErrors.userNotFound(identity.tokenIdentifier);
    }

    // FINALLY: Business logic
    return await ctx.db.insert("vehicles", {
      ...args.data,
      ownerId: user._id,
    });
  },
});
```

### 4. Authorization Helpers

Use shared helpers from `packages/backend/convex/lib/authorization.ts`:

```typescript
import { isSystemAdmin, requireAdminAccess, requireAuth } from "./lib/authorization";

// Admin-only queries/mutations - throws if not admin
export const adminOnlyQuery = query({
  args: { ... },
  handler: async (ctx, args) => {
    await requireAdminAccess(ctx); // Throws if not authenticated or not admin
    // ... business logic
  },
});

// Authenticated-only (any logged-in user) - throws if not logged in
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx, "view profile");
    // userId guaranteed to exist
  },
});

// Conditional admin features - check without throwing
export const listMembers = query({
  args: { agencyId: v.id("agencies") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const isAdmin = await isSystemAdmin(ctx, identity.subject);
    // Show different data based on admin status
  },
});
```

### 5. User Fetching with Graceful Degradation

Use `fetchUserById` from `packages/backend/convex/lib/users.ts` when user references may be stale:

```typescript
import { fetchUserById } from "./lib/users";

export const listMembers = query({
  args: { agencyId: v.id("agencies") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("agencyMembers")
      .withIndex("by_agency", (q) => q.eq("agencyId", args.agencyId))
      .collect();

    return Promise.all(
      members.map(async (member) => {
        const user = await fetchUserById(ctx, member.userId); // Returns null if not found
        return { ...member, user }; // Frontend handles null gracefully
      })
    );
  },
});
```

**Why graceful**: Better-auth users may be deleted but agency members remain (soft delete scenario). Return null instead of throwing to allow frontend to show partial data.

### 6. Query vs Mutation vs Action

Use correct function type:

| Type       | Use For         | Characteristics                      |
|------------|-----------------|--------------------------------------|
| `query`    | Read-only ops   | Cached, reactive, no side effects    |
| `mutation` | Database writes | Transactional, no external calls     |
| `action`   | External APIs   | Can call mutations, has side effects |

```typescript
// Improvement needed - mutation calling external API
export const sendEmail = mutation({
  handler: async (ctx, args) => {
    await fetch("https://api.email.com/send", {...}); // Not allowed in mutation
  },
});

// Recommended approach - action for external calls
export const sendEmail = action({
  handler: async (ctx, args) => {
    // Action can call external APIs
    await fetch("https://api.email.com/send", {...});
    // And then call mutations
    await ctx.runMutation(internal.emails.markSent, { id: args.id });
  },
});
```

### 7. Argument Validation with Zod

Use zodValidator for complex argument validation.

```typescript
// Simple args - use v.xxx()
export const getVehicle = query({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {...},
});

// Complex args - use zodValidator
export const createVehicle = mutation({
  args: { data: Vehicles.zodValidator },
  handler: async (ctx, args) => {
    // args.data is fully validated and typed
  },
});
```

### 8. Error Handling with AppErrors

Use `AppErrors` factories, not raw throws:

```typescript
import { AppErrors } from "./lib/errors";

// Correct
throw AppErrors.notAuthenticated("view vehicles");
throw AppErrors.vehicleNotFound(vehicleId);
throw AppErrors.duplicateValue("licensePlate", plate);
throw AppErrors.agencyNotFound(agencyId);
throw AppErrors.agencyMemberNotFound(memberId);
throw AppErrors.insufficientPermissions("admin", "create agency");

// Wrong
throw new Error("Not authenticated");
throw new Error("Vehicle not found");
```

### 9. Template: Admin Query with User Data

Complete template for admin-only queries that include user data:

```typescript
import { query } from "./_generated/server";
import { requireAdminAccess } from "./lib/authorization";
import { fetchUserById } from "./lib/users";

export const listAgencyMembers = query({
  args: { agencyId: v.id("agencies") },
  handler: async (ctx, args) => {
    await requireAdminAccess(ctx); // Admin only

    const members = await ctx.db
      .query("agencyMembers")
      .withIndex("by_agency", (q) => q.eq("agencyId", args.agencyId))
      .collect();

    // Add user data with graceful degradation
    return Promise.all(
      members.map(async (m) => {
        const user = await fetchUserById(ctx, m.userId);
        return { ...m, user };
      })
    );
  },
});
```

## Error Handling Guidelines

**Throw errors when**:
- User should be authenticated but isn't → `AppErrors.notAuthenticated()`
- User lacks required permissions → `AppErrors.insufficientPermissions()`
- Required data is missing → `AppErrors.notFound()`

**Return null when**:
- Optional data may be missing → `fetchUserById()` returning null
- Frontend can gracefully degrade → show userId instead of user name

## Project Context

**Schema location**: `packages/backend/convex/schema.ts`

**Helper locations**:
- `packages/backend/convex/lib/authorization.ts` - Auth helpers
- `packages/backend/convex/lib/users.ts` - User fetching
- `packages/backend/convex/lib/errors.ts` - AppErrors factory

**Common patterns**:
- `zodTable` from `zodvex` package
- `AppErrors` for error throwing
- Better-Auth integration in `auth.ts`
- HTTP routes in `http.ts`

**Convex docs**: <https://docs.convex.dev>
