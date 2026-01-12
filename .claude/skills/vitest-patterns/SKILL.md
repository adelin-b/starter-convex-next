---
name: vitest-patterns
description: >-
  Use for Vitest/convex-test patterns. Covers test structure, AAA pattern,
  convex-test helpers, test.each, edge cases, isolation.
---
# Vitest Testing Patterns for Convex Backend

This skill documents testing patterns for Starter SaaS's Convex backend tests using Vitest and convex-test.

## Core Patterns

### 1. Test Structure with convex-test

Every Convex test file follows this structure:

```typescript
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

describe("feature", () => {
  test("describes expected behavior", async () => {
    const t = convexTest(schema, modules);
    // ... test code
  });
});
```

**Key points**:
- `import.meta.glob` loads all modules for Convex runtime
- Each test creates fresh `convexTest` instance for isolation
- Use `describe` blocks to group related tests

### 2. AAA Pattern (Arrange-Act-Assert)

Every test should have clear sections:

```typescript
test("creates item with equipment", async () => {
  // Arrange - setup test data
  const t = convexTest(schema, modules);
  const asUser = t.withIdentity({ name: "Test User", subject: "user-123" });
  const agencyId = await createTestAgency(t);

  // Act - perform the action
  const { id } = await asUser.mutation(api.items.createDraft, { agencyId });
  await asUser.mutation(api.items.updateItem, {
    id,
    updates: { equipment: ["bluetooth", "gps"] as const },
  });

  // Assert - verify results
  const item = await asUser.query(api.items.getById, { id });
  expect(item?.equipment).toEqual(["bluetooth", "gps"]);
});
```

### 3. Setup Helpers

Create reusable helpers for common test data:

```typescript
async function setupTestData(
  t: ReturnType<typeof convexTest>,
  options: {
    withMembership?: boolean;
    roles?: ("agency-manager" | "commercial")[];
    itemCount?: number;
  } = {},
) {
  const userId = "test-user-123";
  const asUser = t.withIdentity({ name: "Test User", subject: userId });

  // Create agency
  const agencyId = await t.run(async (ctx) => {
    const now = Date.now();
    return await ctx.db.insert("agencies", {
      name: "Test Agency",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  });

  // Create membership if needed
  if (options.withMembership !== false) {
    await t.run(async (ctx) => {
      await ctx.db.insert("agencyMembers", {
        agencyId,
        userId,
        roles: options.roles ?? ["agency-manager"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
  }

  return { asUser, userId, agencyId };
}
```

**Key points**:
- Options have sensible defaults (membership = true)
- Returns all artifacts needed for assertions
- Uses `t.run()` for direct DB manipulation

### 4. test.each for Enum/Mapping Tests

Use `test.each` when testing multiple similar cases:

```typescript
// Improvement needed - many assertions in one test
test("maps all fuel types", () => {
  expect(mapCategory("basic")).toBe("1");
  expect(mapCategory("premium")).toBe("2");
  expect(mapCategory("enterprise")).toBe("4");
  // ... more
});

// Recommended approach - each case is a separate test
test.each([
  ["basic", "1"],
  ["premium", "2"],
  ["enterprise", "4"],
  ["hybrid", "5"],
] as const)("maps %s to LBC code %s", (input, expected) => {
  expect(mapCategory(input)).toBe(expected);
});
```

**Benefits**:
- Each case runs independently
- Failures show which specific case failed
- Better test isolation

### 5. Authentication Testing

Test both authenticated and unauthenticated scenarios:

```typescript
test("requires authentication", async () => {
  const t = convexTest(schema, modules);
  const { agencyId } = await setupTestData(t);

  // Anonymous user (no identity)
  await expect(t.query(api.items.getByAgency, { agencyId })).rejects.toThrow(
    /NOT_AUTHENTICATED/i,
  );
});

test("requires agency membership", async () => {
  const t = convexTest(schema, modules);
  const { agencyId } = await setupTestData(t);

  // Different user without membership
  const otherUser = t.withIdentity({ name: "Other", subject: "other-456" });

  await expect(otherUser.query(api.items.getByAgency, { agencyId })).rejects.toThrow(
    /INSUFFICIENT_PERMISSIONS/i,
  );
});
```

### 6. Edge Cases

Always test boundaries and edge cases:

```typescript
describe("mapDoors", () => {
  // Normal cases
  test.each([
    [1, "1"], [2, "1"], [3, "2"], [4, "3"], [5, "4"], [6, "5"],
  ])("maps %d doors to code %s", (input, expected) => {
    expect(mapDoors(input)).toBe(expected);
  });

  // Edge cases
  test("returns undefined for undefined input", () => {
    expect(mapDoors(undefined)).toBeUndefined();
  });

  test("treats 0 as undefined (falsy)", () => {
    expect(mapDoors(0)).toBeUndefined();
  });

  test("caps at maximum (7+ doors)", () => {
    expect(mapDoors(10)).toBe("5");
  });
});
```

### 7. Testing Non-Existent IDs

Convex validates ID format. Use create-then-delete pattern:

```typescript
// Improvement needed - fake IDs don't work
test("throws for non-existent agency", async () => {
  const t = convexTest(schema, modules);
  const asUser = t.withIdentity({ name: "Test User" });

  // This fails: Convex validates ID format
  await expect(
    asUser.query(api.agencies.get, { id: "fake-id" }),
  ).rejects.toThrow();
});

// Recommended approach - create then delete
test("throws for non-existent agency", async () => {
  const t = convexTest(schema, modules);
  const asUser = t.withIdentity({ name: "Test User" });

  // Create then delete to get valid but non-existent ID
  const deletedId = await t.run(async (ctx) => {
    const id = await ctx.db.insert("agencies", {
      name: "To Delete",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await ctx.db.delete(id);
    return id;
  });

  await expect(
    asUser.query(api.agencies.get, { id: deletedId }),
  ).rejects.toThrow(/not found|AGENCY_NOT_FOUND/i);
});
```

### 8. Test Data with Literal Types

Preserve literal types in test data:

```typescript
// Improvement needed - types widen to string
const item = { status: "available", category: "basic" };

// Recommended approach - preserve literal types
const item = {
  status: "available" as const,
  category: "basic" as const,
};

// Or use typed arrays
const equipment: EquipmentKey[] = ["bluetooth", "gps"];
```

### 9. Testing Orphaned Data

Test graceful handling of inconsistent data:

```typescript
test("filters out orphaned memberships", async () => {
  const t = convexTest(schema, modules);
  const { asUser, userId, agencyId } = await setupTestData(t);

  // Create orphaned membership (agency deleted after membership created)
  await t.run(async (ctx) => {
    const id = await ctx.db.insert("agencies", { ... });
    await ctx.db.insert("agencyMembers", { agencyId: id, userId, ... });
    await ctx.db.delete(id); // Creates orphan
  });

  const memberships = await asUser.query(api.agencies.getCurrentUserMemberships, {});

  // Should only return valid membership
  expect(memberships).toHaveLength(1);
  expect(memberships[0].agencyId).toBe(agencyId);
});
```

## Testing Principles Checklist

| # | Principle | Description |
|---|-----------|-------------|
| 1 | Descriptive names | Test name describes expected behavior |
| 2 | AAA pattern | Clear Arrange-Act-Assert sections |
| 3 | Single assertion focus | One logical assertion per test |
| 4 | Edge cases | Test boundaries, empty, null, 0 |
| 5 | Error paths | Test failures, not just happy paths |
| 6 | Isolation | Each test creates fresh state |
| 7 | No magic values | Use constants or named variables |
| 8 | test.each for enums | Test all values in union types |
| 9 | Setup helpers | DRY setup but readable tests |
| 10 | Negative tests | Test unauthorized, invalid inputs |

## Project Context

**Test file locations**:
- `packages/backend/convex/*.test.ts` - Convex function tests
- `packages/backend/convex/integrations/**/*.test.ts` - Integration tests

**Running tests**:
```bash
# All tests
bunx vitest run

# Specific file
bunx vitest run convex/agencies.test.ts

# Watch mode
bunx vitest
```

**Common imports**:
```typescript
import { convexTest } from "convex-test";
import { describe, expect, test, beforeEach } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
```
