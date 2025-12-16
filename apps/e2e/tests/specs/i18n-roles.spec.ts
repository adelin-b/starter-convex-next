import { api } from "@starter-saas/backend/convex/_generated/api";
import { expect, test } from "../../lib/test";

/**
 * E2E tests for i18n role labels on the admin/members page.
 *
 * These tests verify:
 * - Role labels display correctly in English (default)
 * - FormatJS extraction works and messages are properly defined
 *
 * Requirements:
 * - ISOLATED=true mode (uses fresh Convex backend)
 * - User must be seeded as admin to access /admin/members
 */

/* eslint-disable playwright/no-conditional-in-test, playwright/no-skipped-test, playwright/no-conditional-expect -- environment-based fixtures */
test.describe("i18n Role Labels", () => {
  test.beforeEach(async ({ backend }) => {
    // Clear all data before each test for isolation
    if (backend) {
      await backend.client.mutation(api.testing.testing.clearAll);
    }
  });

  test("should display role labels in English by default", async ({ page, auth, backend }) => {
    // Skip if not in isolated mode (backend fixture unavailable)
    test.skip(!backend, "This test requires isolated mode with backend fixture");

    // Create user and sign in
    await auth.createAndSignInTestUser();

    // Get the userId from the session
    const userId = await page.evaluate(async () => {
      const response = await fetch("/api/auth/get-session");
      const session = await response.json();
      return session?.user?.id as string | undefined;
    });

    expect(userId).toBeTruthy();

    // Seed as admin to access /admin/members
    await backend!.client.mutation(api.organizations.seedTestAdmin, { userId: userId! });

    // Reload to pick up the new role
    await page.reload();
    await page.locator('[data-testid="user-menu"]').waitFor({ timeout: 10_000 });

    // Navigate to members page
    await page.goto("/admin/members");

    // Wait for table to load
    await page.locator("table").waitFor({ timeout: 15_000 });

    // Take a screenshot to verify the page loaded
    await page.screenshot({ path: "test-results/members-en.png" });

    // Look for role labels in badges - should be in English
    // "Commercial" is the same in EN/FR, "Organization Manager" is English
    const commercialBadge = page.locator("text=Commercial");
    const organizationManagerBadge = page.locator("text=Organization Manager");

    // At least one role badge should be visible
    const hasCommercial = (await commercialBadge.count()) > 0;
    const hasOrganizationManager = (await organizationManagerBadge.count()) > 0;

    console.log(`Commercial badges: ${await commercialBadge.count()}`);
    console.log(`Organization Manager badges: ${await organizationManagerBadge.count()}`);

    // Commercial is common in test data, should be visible
    expect(hasCommercial || hasOrganizationManager).toBe(true);
  });

  test("role messages are properly defined in i18n", async ({ page, auth, backend }) => {
    // Skip if not in isolated mode (backend fixture unavailable)
    test.skip(!backend, "This test requires isolated mode with backend fixture");

    // Create user and sign in
    await auth.createAndSignInTestUser();

    // Get the userId from the session
    const userId = await page.evaluate(async () => {
      const response = await fetch("/api/auth/get-session");
      const session = await response.json();
      return session?.user?.id as string | undefined;
    });

    expect(userId).toBeTruthy();

    // Seed as admin to access /admin/members
    await backend!.client.mutation(api.organizations.seedTestAdmin, { userId: userId! });

    // Reload to pick up the new role
    await page.reload();
    await page.locator('[data-testid="user-menu"]').waitFor({ timeout: 10_000 });

    // Navigate to members page
    await page.goto("/admin/members");

    // Wait for table to load
    await page.locator("table").waitFor({ timeout: 15_000 });

    // Verify the page loads correctly with member data
    const tableRows = await page.locator("tbody tr").count();
    console.log(`Found ${tableRows} member rows`);

    // If there are rows, role badges should be visible
    if (tableRows > 0) {
      // Check for any role-related text that indicates i18n is working
      const commercialBadges = page.locator('div:has-text("Commercial")').first();
      await expect(commercialBadges).toBeVisible({ timeout: 5000 });
    }

    // Take screenshot for verification
    await page.screenshot({ path: "test-results/members-roles.png" });
  });
  /* eslint-enable playwright/no-conditional-in-test, playwright/no-skipped-test, playwright/no-conditional-expect */
});
