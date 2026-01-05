import { expect } from "@playwright/test";
import { Given, Then } from "../steps/fixtures";
import { getAuthFilePath } from "./setup";

// Top-level regex patterns for URL matching (required by biome lint)
const DASHBOARD_OR_HOME_URL = /\/(dashboard|$)/;
const SIGNIN_OR_HOME_URL = /\/(sign-in|$)/;

/**
 * Step definition for logging in as a pre-authenticated user.
 * Uses saved storage state from the global setup phase.
 *
 * Usage in feature files:
 *   Given I am logged in as "testuser"
 *   Given I am logged in as "admin"
 */
Given("I am logged in as {string}", async ({ browser, ctx }, userName: string) => {
  const storageState = getAuthFilePath(userName);

  // Create a new browser context with the saved authentication state
  const context = await browser.newContext({ storageState });
  ctx.page = await context.newPage();
});

/**
 * Step definition for signing in manually during a test.
 * Use this when you need to test the sign-in flow itself,
 * or when a pre-authenticated user is not available.
 *
 * Usage in feature files:
 *   Given I sign in with email "test@example.com" and password "password123"
 */
Given(
  "I sign in with email {string} and password {string}",
  async ({ page, ctx }, email: string, password: string) => {
    // Initialize ctx.page with the default page if not already set
    ctx.page = ctx.page || page;

    await ctx.page.goto("/sign-in");
    await ctx.page.fill('input[type="email"]', email);
    await ctx.page.fill('input[type="password"]', password);
    await ctx.page.click('button[type="submit"]');

    // Wait for successful redirect
    await ctx.page.waitForURL(DASHBOARD_OR_HOME_URL, { timeout: 15_000 });
  },
);

/**
 * Step definition for signing up a new user during a test.
 *
 * Usage in feature files:
 *   Given I sign up with name "Test User", email "new@example.com" and password "password123"
 */
Given(
  "I sign up with name {string}, email {string} and password {string}",
  async ({ page, ctx }, name: string, email: string, password: string) => {
    ctx.page = ctx.page || page;

    await ctx.page.goto("/sign-up");
    await ctx.page.fill('input[name="name"]', name);
    await ctx.page.fill('input[type="email"]', email);
    await ctx.page.fill('input[type="password"]', password);
    await ctx.page.click('button[type="submit"]');

    // Wait for successful redirect
    await ctx.page.waitForURL(DASHBOARD_OR_HOME_URL, { timeout: 15_000 });
  },
);

/**
 * Step definition for logging out.
 *
 * Usage in feature files:
 *   When I log out
 */
Given("I log out", async ({ ctx }) => {
  // Click on user menu to reveal logout option
  const userMenu = ctx.page.locator('[data-testid="user-menu"]');
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await ctx.page.click('text="Sign out"');
    await ctx.page.waitForURL(SIGNIN_OR_HOME_URL, { timeout: 10_000 });
  }
});

/**
 * Step definition for verifying authenticated state.
 *
 * Usage in feature files:
 *   Then I should be logged in
 */
Then("I should be logged in", async ({ ctx }) => {
  // Check for authenticated indicators (adjust selectors as needed)
  const userMenu = ctx.page.locator('[data-testid="user-menu"]');
  await expect(userMenu).toBeVisible({ timeout: 5000 });
});

/**
 * Step definition for verifying unauthenticated state.
 *
 * Usage in feature files:
 *   Then I should be logged out
 */
Then("I should be logged out", async ({ ctx }) => {
  // Check for sign-in link indicating logged out state
  const signInLink = ctx.page.locator('text="Sign In"');
  await expect(signInLink).toBeVisible({ timeout: 5000 });
});

/**
 * Step definition for navigating to a page with authenticated context.
 *
 * Usage in feature files:
 *   When I go to "/dashboard"
 */
Given("I go to {string}", async ({ ctx }, path: string) => {
  await ctx.page.goto(path);
});

/**
 * Step definition for verifying current URL.
 *
 * Usage in feature files:
 *   Then the URL should be "/dashboard"
 */
Then("the URL should be {string}", async ({ ctx }, expectedUrl: string) => {
  await expect(ctx.page).toHaveURL(expectedUrl);
});
