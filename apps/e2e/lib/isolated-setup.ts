/**
 * Global setup for isolated E2E tests.
 *
 * NOTE: Convex backend is started by playwright webServer config (see playwright.config.ts).
 * This globalSetup reads dynamic ports from _E2E_* env vars and sets env vars for test fixtures.
 *
 * Order of operations:
 * 1. Playwright config allocates ports (cached in _E2E_* env vars)
 * 2. Playwright starts Convex via webServer (waits for health check)
 * 3. Playwright starts Next.js via webServer (env vars passed directly)
 * 4. This function runs - reads env vars, sets CONVEX_TEST_URL for fixtures
 * 5. Tests run
 */
import { E2E_WEB_PORT_MIN } from "./constants";

/**
 * Global setup - reads dynamic ports from env vars and configures test fixtures.
 * Heavy lifting (Convex, Next.js) is handled by webServer config.
 */
export default async function isolatedSetup(): Promise<void> {
  // Read allocated ports from env vars (set by playwright.config.ts)
  const convexPort = process.env._E2E_CONVEX_PORT;
  const webPort = process.env._E2E_WEB_PORT ?? String(E2E_WEB_PORT_MIN);

  if (!convexPort) {
    throw new Error("_E2E_CONVEX_PORT not found. Make sure playwright.config.ts allocated ports.");
  }

  const convexUrl = `http://127.0.0.1:${convexPort}`;

  // Store URLs for test fixtures
  process.env.CONVEX_TEST_URL = convexUrl;
  process.env.IS_TEST = "true";

  console.log("[globalSetup] E2E environment configured (dynamic ports)");
  console.log(`  Convex: ${convexUrl}`);
  console.log(`  Web: http://localhost:${webPort}`);
}
