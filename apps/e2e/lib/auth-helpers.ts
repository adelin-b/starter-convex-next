/**
 * Shared authentication helpers for E2E tests.
 * Uses programmatic auth via better-auth API for fast, reliable authentication.
 */
import type { BrowserContext, Page } from "@playwright/test";
import { AUTH_SYNC_DELAY, DEV_WEB_PORT, E2E_WEB_PORT_MIN } from "./constants";
import { signUpProgrammatic } from "./programmatic-auth";

/**
 * Get base URL for programmatic auth (works in both isolated and dev modes).
 * In isolated mode, uses E2E_WEB_PORT_MIN as default (actual port may vary for parallel runs).
 * Prefer passing baseUrl from Playwright config for accurate port.
 */
export function getBaseUrl(): string {
  const isIsolated = process.env.ISOLATED !== "false";
  const port = isIsolated ? E2E_WEB_PORT_MIN : DEV_WEB_PORT;
  return process.env.PLAYWRIGHT_TEST_BASE_URL ?? `http://localhost:${port}`;
}

/**
 * Test context with authentication state
 */
export type AuthContext = {
  page: Page;
  context: BrowserContext;
  accountEmail?: string;
};

/**
 * Authenticate a user with programmatic auth (no UI navigation).
 * Much faster than UI-based auth - creates user via HTTP API.
 * Navigates to homepage to trigger Convex token exchange.
 *
 * @param ctx - Test context with page and browser context
 * @param options - Optional email, name, and role
 * @param baseUrl - Optional base URL (uses Playwright's baseURL for dynamic port support)
 */
export async function authenticateUser(
  ctx: AuthContext,
  options: {
    email?: string;
    name?: string;
    role?: string;
  } = {},
  baseUrl?: string,
): Promise<void> {
  const timestamp = Date.now();
  const role = options.role ?? "user";
  const email = options.email ?? `${role}-${timestamp}@test.com`;
  const name = options.name ?? `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`;

  // Use provided baseUrl (from Playwright config) or fall back to env/default
  const effectiveBaseUrl = baseUrl || getBaseUrl();

  // Use programmatic auth (faster than UI)
  const result = await signUpProgrammatic(effectiveBaseUrl, {
    email,
    name,
    password: "TestPassword123!",
  });

  if (!result.success) {
    throw new Error(`Programmatic auth failed: ${result.error}`);
  }

  // Apply auth cookies to browser context
  await ctx.context.addCookies(result.cookies);
  await ctx.page.waitForTimeout(AUTH_SYNC_DELAY);
  ctx.accountEmail = email;

  // Navigate to homepage to trigger Convex token exchange
  // This ensures the Convex client authenticates before subsequent page navigations
  await ctx.page.goto("/");

  // Wait for sidebar (auth indicator) and ensure no "Please log in" alert
  await ctx.page.waitForSelector('[data-sidebar="sidebar"], [data-sidebar="trigger"]:visible', {
    timeout: 15_000,
  });

  // Poll until the Convex "Please log in" alert is gone (ensures token exchange is complete)
  const loginAlert = ctx.page.getByText(/please log in to continue/i);
  const maxWaitMs = 20_000;
  const pollInterval = 500;
  const startTime = Date.now();
  let isAlertVisible = await loginAlert.isVisible().catch(() => false);

  while (isAlertVisible && Date.now() - startTime < maxWaitMs) {
    await ctx.page.waitForTimeout(pollInterval);
    isAlertVisible = await loginAlert.isVisible().catch(() => false);
  }

  if (isAlertVisible) {
    throw new Error(
      "Convex auth timeout: 'Please log in to continue' alert still visible after auth navigation",
    );
  }
}

/**
 * Authenticate with a specific role.
 * Creates a regular user - extend this for role-based auth (e.g., admin seeding) if needed.
 *
 * @param ctx - Test context with page and browser context
 * @param role - Role to authenticate as
 * @param baseUrl - Optional base URL (uses Playwright's baseURL for dynamic port support)
 */
export async function authenticateWithRole(
  ctx: AuthContext,
  role: string,
  baseUrl?: string,
): Promise<void> {
  await authenticateUser(ctx, { role }, baseUrl);
}
