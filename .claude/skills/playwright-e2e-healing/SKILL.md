---
name: playwright-e2e-healing
description: >-
  This skill should be used when E2E tests are failing and need diagnosis and fixes.
  It provides a systematic approach to identify root causes, categorize failures,
  and apply fixes efficiently across multiple test files.
targets:
  - 'apps/e2e/**/*.ts'
  - 'apps/e2e/**/*.feature'
---
# Playwright E2E Test Healing Skill

Systematic approach to diagnosing and fixing failing E2E tests.

## When to Use

- E2E tests are failing after code changes
- Tests are timing out or hanging indefinitely
- Multiple tests failing with similar patterns
- Need to identify root cause vs. symptom failures

## Diagnostic Workflow

### Phase 1: Gather Evidence

1. **Run tests and capture failures**
   ```bash
   bunx playwright test --reporter=list 2>&1 | tail -100
   ```

2. **Read error context files** - Playwright saves snapshots:
   ```
   test-results/{test-name}/error-context.md  # Page snapshot at failure
   test-results/{test-name}/test-failed-1.png # Screenshot
   test-results/{test-name}/video.webm        # Video recording
   ```

3. **Categorize failures** - Group by pattern:
   - Timeout failures (hanging tests)
   - Selector failures (element not found)
   - Assertion failures (wrong state)
   - Network failures (API issues)

### Phase 2: Identify Root Causes

1. **Search for common anti-patterns**:
   ```bash
   # Find networkidle waits (infinite hang with Convex)
   grep -r "waitForLoadState.*networkidle" apps/e2e/

   # Find hardcoded timeouts
   grep -r "waitForTimeout" apps/e2e/

   # Find missing await
   grep -r "\.click()" apps/e2e/ | grep -v await
   ```

2. **Check base classes** - Bugs in base classes cascade:
   - `lib/pages/base.page.ts` - All POMs inherit from this
   - `lib/auth.ts` - Auth helpers used by all tests
   - `lib/auth-helpers.ts` - Programmatic auth

3. **Trace failure to source** - Follow the call stack:
   - Error at line X in test file
   - Calls method Y in step definition
   - Calls method Z in page object
   - Root cause in base class

### Phase 3: Apply Fixes

1. **Fix in priority order**:
   - Base classes first (fixes cascade to all tests)
   - Shared utilities second
   - Individual tests last

2. **Use bulk replace for common patterns**:
   ```typescript
   // Edit tool with replace_all: true
   old_string: 'await page.waitForLoadState("networkidle")'
   new_string: 'await page.waitForLoadState("domcontentloaded")'
   ```

3. **Add comments explaining the fix**:
   ```typescript
   // Note: Don't use networkidle as Convex WebSocket prevents it from settling
   await page.waitForLoadState("domcontentloaded");
   ```

### Phase 4: Verify

1. **Run subset first** - Test the specific failures:
   ```bash
   bunx playwright test --grep "Authentication" --reporter=list
   ```

2. **Run full suite** - Verify no regressions:
   ```bash
   bunx playwright test --reporter=dot
   ```

3. **Compare before/after** - Document improvement:
   - Before: 48 failed, 34 passed
   - After: 35 failed, 73 passed

## Common Root Causes

### 1. `waitForLoadState("networkidle")` Hangs

**Symptom**: Tests hang forever or timeout
**Cause**: Convex WebSocket connections never become "idle"
**Fix**: Replace with `domcontentloaded` or element-based waits

```typescript
// BAD: Hangs with Convex
await page.waitForLoadState("networkidle");

// GOOD: Completes immediately when DOM ready
await page.waitForLoadState("domcontentloaded");

// BETTER: Wait for specific element that confirms readiness
await page.waitForSelector('[data-slot="dropdown-menu-trigger"]');
```

### 2. `isVisible()` Doesn't Support Timeout

**Symptom**: Race conditions, flaky tests
**Cause**: `isVisible()` is synchronous, doesn't wait
**Fix**: Use `waitFor()` first, then check visibility

```typescript
// BAD: isVisible doesn't support timeout option
const visible = await element.isVisible({ timeout: 5000 }); // timeout ignored!

// GOOD: Wait for one of the possible states first
await Promise.race([
  formA.waitFor({ state: "visible", timeout: 15000 }),
  formB.waitFor({ state: "visible", timeout: 15000 }),
]);
const isFormA = await formA.isVisible();
```

### 3. Missing Auth State Wait

**Symptom**: Tests fail with "element not found" after login
**Cause**: Auth state not fully loaded when test continues
**Fix**: Wait for auth-dependent element to appear

```typescript
// BAD: Just wait for redirect
await page.waitForURL((url) => !url.pathname.includes("/login"));

// GOOD: Also wait for element that confirms auth loaded
await page.waitForURL((url) => !url.pathname.includes("/login"));
await page.waitForSelector('[data-slot="dropdown-menu-trigger"]', { timeout: 15000 });
```

### 4. Convex Subscription Not Updated

**Symptom**: Data seeded but not showing in UI
**Cause**: Convex live query hasn't received the update yet
**Fix**: Navigate after seeding, or wait for element with expected content

```typescript
// BAD: Seed and expect immediately
await backend.mutation(api.testing.seedVehicles, { count: 3 });
await expect(page.locator("text=Toyota")).toBeVisible();

// GOOD: Navigate to trigger fresh query
await backend.mutation(api.testing.seedVehicles, { count: 3 });
await page.goto(`/agency/${agencyId}/vehicles`);
await expect(page.locator("text=Toyota")).toBeVisible({ timeout: 10000 });
```

## Best Practices

### Wait Strategy Priority

1. **Explicit element waits** (best) - Wait for specific element
2. **URL waits** - Wait for navigation to complete
3. **domcontentloaded** - Wait for DOM ready
4. **Fixed timeout** (avoid) - Only as last resort

### Never Use with Convex

- `waitForLoadState("networkidle")` - WebSocket never idle
- `waitForLoadState("load")` with long timeout - May hang

### Always Use with Convex

- Element-based waits for auth state
- `domcontentloaded` for page navigation
- Explicit selectors for data that comes from subscriptions

## Troubleshooting Checklist

- [ ] Check `lib/pages/base.page.ts` for `networkidle`
- [ ] Check `lib/auth.ts` for wait strategies
- [ ] Check step definitions for `networkidle`
- [ ] Verify error-context.md shows expected page state
- [ ] Check if test works in isolation vs. parallel
- [ ] Look for missing test data setup
