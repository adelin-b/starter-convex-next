/**
 * Shared Convex client factory for E2E tests.
 *
 * Provides a properly typed admin client without ugly casts scattered
 * throughout the codebase.
 */
import { ConvexHttpClient } from "convex/browser";
import { E2E_ADMIN_KEY } from "./constants";

/**
 * Internal type for the setAdminAuth method that exists at runtime
 * but isn't exposed in Convex's public TypeScript types.
 */
type ConvexClientWithAdminAuth = {
  setAdminAuth: (key: string) => void;
};

/**
 * Create a ConvexHttpClient with admin authentication for E2E tests.
 *
 * This factory encapsulates the type cast needed to access the
 * runtime-only setAdminAuth method.
 *
 * @param url - The Convex backend URL (e.g., http://127.0.0.1:7210)
 * @returns A ConvexHttpClient configured with admin access
 */
export function createAdminClient(url: string): ConvexHttpClient {
  const client = new ConvexHttpClient(url);
  (client as unknown as ConvexClientWithAdminAuth).setAdminAuth(E2E_ADMIN_KEY);
  return client;
}

/**
 * Verify that a Convex URL is safe for E2E tests.
 *
 * SAFETY: Prevents accidental mutations to production databases.
 * Only allows localhost URLs (127.0.0.1, localhost, 0.0.0.0).
 */
function isLocalConvexUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const safeHosts = ["127.0.0.1", "localhost", "0.0.0.0"];
    return safeHosts.includes(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Create an admin client using environment variables.
 *
 * SAFETY: Verifies the URL is localhost to prevent accidental prod mutations.
 *
 * Checks CONVEX_TEST_URL first (isolated E2E mode), then CONVEX_URL.
 * Throws if neither is set or if URL is not localhost.
 */
export function createAdminClientFromEnv(): ConvexHttpClient {
  const convexUrl = process.env.CONVEX_TEST_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    throw new Error("Neither CONVEX_TEST_URL nor CONVEX_URL is set.");
  }

  // SAFETY: Verify we're connecting to a local Convex backend, not production
  if (!isLocalConvexUrl(convexUrl)) {
    throw new Error(
      `SAFETY: Refusing to run E2E tests against non-local Convex URL: ${convexUrl}\n` +
        "E2E tests should only run against localhost (127.0.0.1, localhost, 0.0.0.0).\n" +
        "If running isolated mode, ensure CONVEX_TEST_URL is set correctly.\n" +
        "If running non-isolated mode, ensure your dev server uses a local Convex backend.",
    );
  }

  return createAdminClient(convexUrl);
}
