import path from "node:path";
import { chromium } from "@playwright/test";

// Top-level regex pattern for URL matching (required by biome lint)
const DASHBOARD_OR_HOME_URL = /\/(dashboard|$)/;

/**
 * Path template for storing authentication state per user.
 * The {user} placeholder is replaced with the actual username.
 */
export const AUTH_FILE = path.join(process.cwd(), ".auth", "{user}.storageState.json");

/**
 * Gets the storage state file path for a specific user.
 */
export function getAuthFilePath(userName: string): string {
  return AUTH_FILE.replace("{user}", userName);
}

/**
 * Test users configuration.
 * Add users here that need to be pre-authenticated before tests run.
 */
export const TEST_USERS = [
  { name: "testuser", email: "test@example.com", password: "password123" },
  { name: "admin", email: "admin@example.com", password: "adminpass123" },
] as const;

/**
 * Authenticates a user by filling in the sign-in form and saving browser state.
 * This function is called during the global setup phase before tests run.
 */
async function authenticateUser(baseURL: string, user: (typeof TEST_USERS)[number]): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the sign-in page
    await page.goto(`${baseURL}/sign-in`);

    // Wait for the sign-in form to be visible
    await page.waitForSelector('input[type="email"]', { timeout: 10_000 });

    // Fill in the sign-in form
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for successful navigation to dashboard or home page
    await page.waitForURL(DASHBOARD_OR_HOME_URL, { timeout: 15_000 });

    // Save the authenticated state
    const storagePath = getAuthFilePath(user.name);
    await context.storageState({ path: storagePath });

    console.log(`Authenticated user: ${user.name} (${user.email})`);
  } catch (error) {
    console.warn(
      `Failed to authenticate user: ${user.name}. Tests using this user will need to authenticate manually.`,
      error,
    );
  } finally {
    await browser.close();
  }
}

/**
 * Global setup function that pre-authenticates all test users.
 * Run this before the test suite to prepare authentication states.
 */
async function globalAuthSetup(): Promise<void> {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  console.log("Starting authentication setup...");

  for (const user of TEST_USERS) {
    await authenticateUser(baseURL, user);
  }

  console.log("Authentication setup complete.");
}

// Export for use as Playwright global setup
export default globalAuthSetup;
