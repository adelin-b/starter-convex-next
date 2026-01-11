import type { BrowserContext, Page, TestInfo } from "@playwright/test";
import { test as base, createBdd } from "playwright-bdd";
import { createAdminClientFromEnv } from "../../../lib/convex-client";
import { hideNextjsDevOverlay } from "../../../lib/nextjs-overlay-utils";

// Re-export the Convex API for use in step definitions
// biome-ignore lint/performance/noBarrelFile: intentional re-export for step definitions convenience
export { api } from "@starter-saas/backend/convex/_generated/api";

/**
 * Wait for Convex connection to be established.
 * The app shows overlays when Convex is connecting or disconnected:
 * - "Connecting..." overlay after 2s
 * - "Connection Problem" overlay after 10s
 *
 * This function actively waits for connection to succeed by checking
 * that no connection overlay is visible and the page content is interactive.
 *
 * @param page - Playwright page
 * @param timeout - Maximum time to wait (default 30s for initial connection)
 */
export async function waitForConvexConnection(page: Page, timeout = 30_000): Promise<void> {
  const startTime = Date.now();
  const checkInterval = 500;

  // Wait for initial page load
  await page.waitForLoadState("domcontentloaded");

  while (Date.now() - startTime < timeout) {
    // Check for connection overlays
    const connectingOverlay = page.getByRole("heading", { name: /connecting\.\.\./i });
    const connectionProblem = page.getByRole("heading", { name: /connection problem/i });

    const isConnecting = await connectingOverlay.isVisible().catch(() => false);
    const hasConnectionProblem = await connectionProblem.isVisible().catch(() => false);

    // If no connection overlay visible, connection is established
    if (!(isConnecting || hasConnectionProblem)) {
      return;
    }

    // Wait and retry
    await page.waitForTimeout(checkInterval);
  }

  // If we get here, connection didn't establish in time - throw useful error
  throw new Error(`Convex connection not established within ${timeout}ms. Check backend logs.`);
}

/**
 * Generate a unique email for parallel test execution.
 * Uses workerIndex + testId to ensure uniqueness across workers.
 */
export function generateUniqueEmail(testInfo: TestInfo, baseEmail: string): string {
  const [localPart, domain] = baseEmail.split("@");
  // workerIndex is unique per worker, testId is unique per test
  // Combine both to ensure uniqueness across parallel runs
  const uniqueId = `w${testInfo.parallelIndex}-${testInfo.testId.slice(-8)}`;
  return `${localPart}+${uniqueId}@${domain}`;
}

/**
 * Context object that holds the authenticated page instance.
 * This allows sharing state between BDD steps while managing
 * browser context lifecycle properly.
 */
export type TestContext = {
  page: Page;
  /** Browser context for this test (fresh per test for isolation) */
  context: BrowserContext;
  /** Base URL from Playwright config (supports dynamic ports in isolated mode) */
  baseUrl: string;
  /** Unique email generated during account creation */
  accountEmail?: string;
  /** Password used during account creation */
  accountPassword?: string;
  /** Convex HTTP client with admin access for direct DB operations */
  convex: ReturnType<typeof createAdminClientFromEnv>;
  /** Test info for generating unique IDs */
  testInfo: TestInfo;
};

/**
 * Extended test fixture that provides a ctx object for auth-in-steps pattern.
 * Creates a FRESH browser context for each test to ensure proper isolation.
 * This prevents auth state from leaking between tests.
 */
export const test = base.extend<{ ctx: TestContext }>({
  ctx: async ({ browser }, use, testInfo) => {
    // Clipboard permissions only work on desktop browsers, not mobile
    // Mobile projects have "mobile" in the name (e.g., "features-mobile")
    const isMobile = testInfo.project.name.includes("mobile");

    // Create a fresh browser context for each test (isolated cookies/storage)
    // Grant clipboard permissions for copy/paste tests (desktop only)
    const context = await browser.newContext({
      ...(isMobile ? {} : { permissions: ["clipboard-read", "clipboard-write"] }),
    });
    const page = await context.newPage();

    // Hide Next.js dev overlay to prevent click interception
    await hideNextjsDevOverlay(page);

    // Get baseURL from Playwright config (supports dynamic ports in isolated mode)
    const baseUrl = testInfo.project.use.baseURL ?? "http://localhost:3000";

    const ctx: TestContext = {
      page,
      context,
      baseUrl,
      convex: createAdminClientFromEnv(),
      testInfo,
    };

    await use(ctx);

    // Clean up the browser context after test completes
    // Skip cleanup on timeout to avoid hanging (but log warning for visibility)
    if (testInfo.status === "timedOut") {
      console.warn(`[Fixture] Skipping cleanup for timed-out test: ${testInfo.title}`);
      return;
    }
    await context.close();
  },
});

export const { Given, When, Then } = createBdd(test);
