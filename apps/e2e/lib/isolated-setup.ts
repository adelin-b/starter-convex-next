/**
 * Global setup for isolated E2E tests.
 *
 * NOTE: Convex backend is started by playwright webServer config (see playwright.config.ts).
 * This globalSetup just configures environment variables for test fixtures.
 *
 * Order of operations:
 * 1. write-e2e-env.ts runs BEFORE playwright (writes .env.e2e)
 * 2. Playwright starts Convex via webServer (first in array)
 * 3. Playwright starts Next.js via webServer (second in array)
 * 4. This function runs - sets env vars
 * 5. Tests run
 */
import { E2E_CONVEX_START_PORT, E2E_WEB_PORT } from "./constants";

/**
 * Global setup - just configures environment variables.
 * Heavy lifting (Convex, Next.js) is handled by webServer config.
 */
export default async function isolatedSetup(): Promise<void> {
  // Store URLs for test fixtures
  process.env.CONVEX_TEST_URL = `http://127.0.0.1:${E2E_CONVEX_START_PORT}`;
  process.env.IS_TEST = "true";

  console.log("[globalSetup] E2E environment configured");
  console.log(`  Convex: http://127.0.0.1:${E2E_CONVEX_START_PORT}`);
  console.log(`  Web: http://localhost:${E2E_WEB_PORT}`);
}
