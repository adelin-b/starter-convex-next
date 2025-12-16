import { api } from "@starter-saas/backend/convex/_generated/api";
import { expect, test } from "../../lib/test";

/**
 * Isolated E2E tests for the Vehicles feature.
 *
 * These tests use:
 * - Isolated Convex backend per test run
 * - Database clearing between tests
 * - Auth helpers for user authentication
 * - Direct backend mutations for test data setup
 */

test.describe("Vehicles Page", () => {
  test.beforeEach(async ({ backend }) => {
    // Clear all data before each test for isolation
    await backend.client.mutation(api.testing.testing.clearAll);
  });

  test("should display 'No vehicles yet' when empty", async ({ page, auth }) => {
    // Must be authenticated to view vehicles
    await auth.createAndSignInTestUser();

    await page.goto("/vehicles");

    // Check for empty state message (from vehicles/page.tsx)
    await expect(page.getByText("No vehicles yet. Add one using the form.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should display vehicles after seeding", async ({ page, backend, auth }) => {
    // Must be authenticated to view vehicles
    await auth.createAndSignInTestUser();

    // Seed the database with test vehicles
    await backend.client.mutation(api.testing.testing.seedVehicles, {
      count: 3,
    });

    await page.goto("/vehicles");

    // Wait for vehicles to load - check for vehicle info in the list
    // Vehicles are displayed as "Year Make Model" e.g. "2020 Toyota Camry"
    await expect(page.locator("text=2020 Toyota Camry")).toBeVisible({ timeout: 10_000 });

    // Verify the inventory count shows 3 vehicles
    await expect(page.getByText("3 vehicles in inventory")).toBeVisible();
  });
});

test.describe("Database Isolation", () => {
  test.beforeEach(async ({ backend }) => {
    await backend.client.mutation(api.testing.testing.clearAll);
  });

  test("1 - seeds data", async ({ backend }) => {
    // This test seeds vehicles
    await backend.client.mutation(api.testing.testing.seedVehicles, {
      count: 5,
    });

    // Verify vehicles were created
    const vehicles = await backend.client.query(api.testing.testing.listVehicles);
    expect(vehicles).toHaveLength(5);
  });

  test("2 - starts fresh", async ({ backend }) => {
    // This test should start with empty database (cleared in beforeEach)
    const vehicles = await backend.client.query(api.testing.testing.listVehicles);
    expect(vehicles).toHaveLength(0);
  });
});

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ backend }) => {
    await backend.client.mutation(api.testing.testing.clearAll);
  });

  test("new user can sign up", async ({ page, auth }) => {
    await auth.createAndSignInTestUser({
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      password: "SecurePassword123!",
    });

    // Verify we're on authenticated page (redirects to /vehicles after signup)
    await expect(page).toHaveURL(/\/vehicles/);

    // Verify user menu is visible (authenticated state)
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test("existing user can sign in after signing out", async ({ page, auth }) => {
    // First, create a user
    const credentials = await auth.createAndSignInTestUser();

    // Sign out
    await auth.signOut();

    // Sign back in
    await auth.signIn({
      email: credentials.email,
      password: credentials.password,
    });

    // Verify signed in (redirects to /vehicles)
    await expect(page).toHaveURL(/\/vehicles/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
