/**
 * Shared authentication helpers for E2E tests.
 * Uses programmatic auth via better-auth API for fast, reliable authentication.
 */
import type { BrowserContext, Page } from "@playwright/test";
import { AUTH_SYNC_DELAY, DEV_WEB_PORT, E2E_WEB_PORT } from "./constants";
import { signUpProgrammatic } from "./programmatic-auth";

/**
 * Get base URL for programmatic auth (works in both isolated and dev modes)
 */
export function getBaseUrl(): string {
  const isIsolated = process.env.ISOLATED !== "false";
  const port = isIsolated ? E2E_WEB_PORT : DEV_WEB_PORT;
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
 *
 * Use this for tests that need an authenticated user but are NOT testing auth itself.
 * For auth-specific tests, use the UI flow via auth.ts functions.
 */
export async function authenticateUser(
  ctx: AuthContext,
  options: {
    email?: string;
    name?: string;
    role?: string;
  } = {},
): Promise<void> {
  const timestamp = Date.now();
  const role = options.role ?? "user";
  const email = options.email ?? `${role}-${timestamp}@test.com`;
  const name = options.name ?? `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`;

  // Use programmatic auth (faster than UI)
  const result = await signUpProgrammatic(getBaseUrl(), {
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
}

/**
 * Authenticate with a specific role.
 * Creates a regular user - extend this for role-based auth if needed.
 */
export async function authenticateWithRole(ctx: AuthContext, role: string): Promise<void> {
  await authenticateUser(ctx, { role });
}
