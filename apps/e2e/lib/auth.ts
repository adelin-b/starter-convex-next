import type { BrowserContext, Page } from "@playwright/test";
import { QUICK_TIMEOUT } from "./constants";

export type SignUpOptions = {
  email: string;
  name: string;
  password: string;
};

export type SignInOptions = {
  email: string;
  password: string;
};

/**
 * Debug logger - logs only when DEBUG env var is set
 */
function debugLog(message: string, error?: unknown): void {
  if (process.env.DEBUG) {
    console.log(`[E2E Auth Debug] ${message}`, error ?? "");
  }
}

/**
 * Helper to sign up a new user via the actual sign-up flow.
 * This tests the full authentication stack.
 *
 * Note: The sign-up form is shown on /login when unauthenticated.
 */
export async function signUp(page: Page, { email, name, password }: SignUpOptions): Promise<void> {
  await page.goto("/login");

  // Wait for the sign-up form to appear (shown by default when unauthenticated)
  await page.waitForSelector('h1:has-text("Create Account")');

  // Fill the sign-up form using type() with delay for controlled inputs
  // (plain fill() may not trigger React state updates properly)
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').type(name, { delay: 10 });

  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').type(email, { delay: 10 });

  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').type(password, { delay: 10 });

  // Submit using role selector for reliability
  const submitButton = page.getByRole("button", { name: /sign up/i }).first();
  await submitButton.scrollIntoViewIfNeeded();
  await submitButton.click({ force: true });

  // Wait for authenticated content - after successful signup, user is redirected to dashboard
  // (the home page at / redirects to dashboard)
  await page.waitForSelector('[data-testid="user-menu"]', { timeout: 15_000 });
}

/**
 * Helper to sign in an existing user via the actual sign-in flow.
 * This tests the full authentication stack.
 *
 * Note: The sign-in form is accessible from /login by clicking "Already have an account? Sign In"
 */
export async function signIn(page: Page, { email, password }: SignInOptions): Promise<void> {
  await page.goto("/login");

  // Wait for the page to fully load
  await page.waitForLoadState("networkidle");

  // Check if sign-up form is showing (means we're not authenticated)
  const signUpHeading = page.locator('h1:has-text("Create Account")');
  const signInHeading = page.locator('h1:has-text("Welcome Back")');

  // If sign-up form is showing, click to switch to sign-in
  let isSignUpFormVisible = false;
  try {
    isSignUpFormVisible = await signUpHeading.isVisible({ timeout: QUICK_TIMEOUT });
  } catch (error) {
    // Only catch timeout errors - re-throw unexpected errors
    if (error instanceof Error && error.message.includes("Timeout")) {
      debugLog("Sign-up form not visible (timeout), likely already on sign-in form");
      isSignUpFormVisible = false;
    } else {
      debugLog("Unexpected error checking sign-up form visibility", error);
      throw error;
    }
  }

  if (isSignUpFormVisible) {
    const switchButton = page.getByRole("button", { name: "Already have an account? Sign In" });
    await switchButton.waitFor({ state: "visible" });
    await switchButton.click();
    // Wait for sign-in form to appear
    await signInHeading.waitFor({ state: "visible" });
  }

  // If already on sign-in form, just proceed
  await signInHeading.waitFor({ state: "visible" });

  // Fill the sign-in form using type() with delay for controlled inputs
  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').type(email, { delay: 10 });

  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').type(password, { delay: 10 });

  // Submit using role selector for reliability
  const submitButton = page.getByRole("button", { name: /sign in/i }).first();
  await submitButton.scrollIntoViewIfNeeded();
  await submitButton.click({ force: true });

  // Wait for authenticated content - after successful signin, user is redirected
  await page.waitForSelector('[data-testid="user-menu"]', { timeout: 15_000 });
}

/**
 * Helper to sign out the current user.
 * The sign out button is in a dropdown menu under the user button.
 *
 * @throws {Error} If user menu button is not found (user should be authenticated when calling this)
 */
export async function signOut(page: Page): Promise<void> {
  // First, click the user menu button (shows the user's name)
  // It's in the sidebar at the bottom
  const userMenuButton = page
    .locator('[data-slot="dropdown-menu-trigger"]')
    .or(page.locator('button:has-text("Test User")'));

  let isUserMenuVisible = false;
  try {
    isUserMenuVisible = await userMenuButton.first().isVisible();
  } catch (error) {
    // Only catch timeout errors - re-throw unexpected errors
    if (error instanceof Error && error.message.includes("Timeout")) {
      debugLog("User menu button not found (timeout)");
      throw new Error("Cannot sign out: User menu button not found. Is the user authenticated?");
    }
    debugLog("Unexpected error checking user menu visibility", error);
    throw error;
  }

  if (!isUserMenuVisible) {
    throw new Error("Cannot sign out: User menu button not visible. Is the user authenticated?");
  }

  await userMenuButton.first().click();

  // Wait for dropdown to open and click Sign out (menuitem, case-sensitive)
  const signOutButton = page.getByRole("menuitem", { name: "Sign out" });
  await signOutButton.waitFor({ state: "visible" });

  // Click sign out - this triggers auth state change, then redirect to /dashboard
  await signOutButton.click();

  // Wait for sign-up form to appear (redirected to /login after signout)
  await page.waitForSelector('h1:has-text("Create Account")', { timeout: 15_000 });
}

/**
 * Helper to create a test user and sign in.
 * Combines sign-up and returns credentials for reuse.
 */
export async function createAndSignInTestUser(
  page: Page,
  options?: Partial<SignUpOptions>,
): Promise<SignUpOptions> {
  const timestamp = Date.now();
  const credentials: SignUpOptions = {
    email: options?.email ?? `test-${timestamp}@example.com`,
    name: options?.name ?? `Test User ${timestamp}`,
    password: options?.password ?? "TestPassword123!",
  };

  await signUp(page, credentials);
  return credentials;
}

/**
 * Get the current authentication state from browser context.
 * Useful for asserting auth state in tests.
 */
export async function getAuthCookies(context: BrowserContext): Promise<string[]> {
  const cookies = await context.cookies();
  return cookies
    .filter((c) => c.name.includes("better-auth") || c.name.includes("session"))
    .map((c) => c.name);
}

/**
 * Check if user is currently authenticated.
 */
export async function isAuthenticated(context: BrowserContext): Promise<boolean> {
  const authCookies = await getAuthCookies(context);
  return authCookies.length > 0;
}
