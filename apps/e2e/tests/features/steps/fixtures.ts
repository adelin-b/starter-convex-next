import type { BrowserContext, Page } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { test as base, createBdd } from "playwright-bdd";
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

// Admin key for direct DB access (same as in convex-backend.ts)
const ADMIN_KEY =
  "0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd";

/**
 * Context object that holds the authenticated page instance.
 * This allows sharing state between BDD steps while managing
 * browser context lifecycle properly.
 */
export type TestContext = {
  page: Page;
  /** Browser context for this test (fresh per test for isolation) */
  context: BrowserContext;
  /** Unique email generated during account creation */
  accountEmail?: string;
  /** Password used during account creation */
  accountPassword?: string;
  /** Convex HTTP client with admin access for direct DB operations */
  convex: ConvexHttpClient;
};

/** Create an admin Convex client for direct DB access in tests */
function createAdminConvexClient(): ConvexHttpClient {
  // In isolated mode, use CONVEX_TEST_URL; otherwise fall back to CONVEX_URL
  const convexUrl = process.env.CONVEX_TEST_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Neither CONVEX_TEST_URL nor CONVEX_URL is set.");
  }
  const client = new ConvexHttpClient(convexUrl);
  (client as unknown as { setAdminAuth: (key: string) => void }).setAdminAuth(ADMIN_KEY);
  return client;
}

/**
 * Extended test fixture that provides a ctx object for auth-in-steps pattern.
 * Creates a FRESH browser context for each test to ensure proper isolation.
 * This prevents auth state from leaking between tests.
 */
export const test = base.extend<{ ctx: TestContext }>({
  ctx: async ({ browser }, use, testInfo) => {
    // Create a fresh browser context for each test (isolated cookies/storage)
    const context = await browser.newContext();
    const page = await context.newPage();

    // Hide Next.js dev overlay to prevent click interception
    await hideNextjsDevOverlay(page);

    const context_: TestContext = {
      page,
      context,
      convex: createAdminConvexClient(),
    };

    await use(context_);

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
