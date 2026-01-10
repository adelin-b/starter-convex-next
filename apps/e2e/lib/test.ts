/**
 * Unified test fixtures for E2E tests.
 *
 * Provides:
 * - backend: ConvexHttpClient for direct database access (isolated mode)
 * - auth: Authentication helpers (signUp, signIn, signOut)
 * - V8 coverage collection (when V8_COVERAGE=true)
 *
 * Usage:
 *   import { test, expect } from "../../../lib/test";
 *
 *   test("example", async ({ page, backend, auth }) => {
 *     // Clear data before test (isolated mode only)
 *     if (backend) {
 *       await backend.client.mutation(api.testing.testing.clearAll);
 *     }
 *
 *     // Sign in
 *     await auth.createAndSignInTestUser();
 *
 *     // Test your app
 *     await page.goto("/dashboard");
 *   });
 */
import { test as baseTest, type Page } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { addCoverageReport } from "monocart-reporter";
import {
  createAndSignInTestUser,
  type SignInOptions,
  type SignUpOptions,
  signIn,
  signOut,
  signUp,
} from "./auth";

// Configuration
const collectV8Coverage = process.env.V8_COVERAGE === "true";
const isIsolated = process.env.ISOLATED !== "false";

// The admin key that matches the one used in global-setup (from Convex dev defaults)
const ADMIN_KEY =
  "0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd";

// Type definitions
type AuthHelpers = {
  signUp: (options: SignUpOptions) => Promise<void>;
  signIn: (options: SignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  createAndSignInTestUser: (options?: Partial<SignUpOptions>) => Promise<SignUpOptions>;
};

type ConvexClient = {
  url: string;
  client: ConvexHttpClient;
};

type TestFixtures = {
  backend: ConvexClient | null;
  auth: AuthHelpers;
  autoV8Coverage: undefined;
};

// Shared client instance across all tests in a worker
let sharedClient: ConvexClient | null = null;

/**
 * Extended Playwright test with Convex backend, auth, and coverage fixtures.
 */
export const test = baseTest.extend<TestFixtures>({
  // Backend fixture - available in isolated mode only
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture pattern requires empty destructuring
  backend: async ({}, use) => {
    if (!isIsolated) {
      // Not in isolated mode - backend fixture not available
      await use(null);
      return;
    }

    // Connect to existing backend if not already done
    if (!sharedClient) {
      const backendUrl = process.env.CONVEX_TEST_URL ?? "";
      if (!backendUrl) {
        throw new Error(
          "CONVEX_TEST_URL not set. Make sure isolated-setup.ts ran correctly and started the Convex backend.",
        );
      }

      const client = new ConvexHttpClient(backendUrl);
      // setAdminAuth exists at runtime but isn't in the public types
      (client as unknown as { setAdminAuth: (key: string) => void }).setAdminAuth(ADMIN_KEY);

      sharedClient = {
        url: backendUrl,
        client,
      };
    }

    await use(sharedClient);
    // Note: Backend cleanup happens in global teardown
  },

  // Auth helpers fixture
  auth: async ({ page }: { page: Page }, use) => {
    await use({
      signUp: (options: SignUpOptions) => signUp(page, options),
      signIn: (options: SignInOptions) => signIn(page, options),
      signOut: () => signOut(page),
      createAndSignInTestUser: (options?: Partial<SignUpOptions>) =>
        createAndSignInTestUser(page, options),
    });
  },

  // V8 Coverage fixture (auto-runs when V8_COVERAGE=true)
  autoV8Coverage: [
    async ({ page }, use, testInfo) => {
      const isChromium = testInfo.project.name.includes("chromium");

      // V8 Coverage API is Chromium-only
      if (isChromium && collectV8Coverage) {
        await Promise.all([
          page.coverage.startJSCoverage({ resetOnNavigation: false }),
          page.coverage.startCSSCoverage({ resetOnNavigation: false }),
        ]);
      }

      await use();

      // Collect coverage after test completes
      if (isChromium && collectV8Coverage) {
        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ]);
        const coverageList = [...jsCoverage, ...cssCoverage];
        await addCoverageReport(coverageList, testInfo);
      }
    },
    { scope: "test", auto: true },
  ],
});

export { expect } from "@playwright/test";
