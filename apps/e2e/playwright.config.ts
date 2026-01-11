import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import {
  DEFAULT_TIMEOUT,
  DEV_STORYBOOK_PORT,
  DEV_WEB_PORT,
  E2E_BETTER_AUTH_SECRET,
  E2E_CONVEX_PORT_MAX,
  E2E_CONVEX_PORT_MIN,
  E2E_STORYBOOK_PORT_MAX,
  E2E_STORYBOOK_PORT_MIN,
  E2E_WEB_PORT_MAX,
  E2E_WEB_PORT_MIN,
  SHUTDOWN_TIMEOUT,
} from "./lib/constants";
import { findUnusedPortSync } from "./lib/find-unused-port";

/**
 * Unified Playwright configuration for all E2E tests.
 *
 * PORT SCHEME (Dynamic ranges for parallel support):
 *   Dev servers:  3xxx/6xxx (web=3000, storybook=6006)
 *   E2E servers:  7xxx (non-overlapping ranges, allocated at config load)
 *     - Web:       7100-7199
 *     - Convex:    7200-7298 (even), HTTP actions on port+1
 *     - Storybook: 7300-7399
 *
 * ISOLATION MODES:
 * - Default (isolated): Fresh Convex backend with dynamic port allocation
 *   Can run alongside `bun dev` without conflicts.
 * - ISOLATED=false: Uses existing dev server on 3xxx ports. Faster iteration.
 *
 * Usage:
 *   bun test:e2e                 # Isolated mode (dynamic 7xxx ports)
 *   bun test:e2e:ui              # Isolated mode with Playwright UI
 *   ISOLATED=false bun test:e2e  # Uses existing dev server (3xxx ports)
 *
 * TEST DIRECTORIES:
 *   tests/features/  - BDD feature tests (auth, navigation)
 *   tests/specs/     - Technical specs (smoke tests, isolated tests)
 *   tests/storybook/ - Storybook component tests
 */

const isCI = !!process.env.CI;
const isIsolated = process.env.ISOLATED !== "false"; // Default: true (isolated)
// Always start fresh servers - stale processes on E2E ports (7xxx) caused hangs
// Tradeoff: Slower local iteration, but reliable test runs
const shouldReuseServer = false;

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC PORT ALLOCATION (happens at config load time)
// Each parallel Playwright run gets its own set of ports.
// IMPORTANT: Cache in env vars to prevent re-allocation on config re-evaluation.
// ─────────────────────────────────────────────────────────────────────────────
function getAllocatedPorts() {
  // Return cached ports if already allocated (config is evaluated multiple times)
  if (
    process.env._E2E_CONVEX_PORT &&
    process.env._E2E_WEB_PORT &&
    process.env._E2E_STORYBOOK_PORT
  ) {
    return {
      convex: Number.parseInt(process.env._E2E_CONVEX_PORT, 10),
      web: Number.parseInt(process.env._E2E_WEB_PORT, 10),
      storybook: Number.parseInt(process.env._E2E_STORYBOOK_PORT, 10),
    };
  }

  // First evaluation - allocate new ports
  const convex = isIsolated
    ? findUnusedPortSync(E2E_CONVEX_PORT_MIN, E2E_CONVEX_PORT_MAX, 2) // step=2 for HTTP actions port
    : 0;
  const web = isIsolated ? findUnusedPortSync(E2E_WEB_PORT_MIN, E2E_WEB_PORT_MAX) : DEV_WEB_PORT;
  const storybook = isIsolated
    ? findUnusedPortSync(E2E_STORYBOOK_PORT_MIN, E2E_STORYBOOK_PORT_MAX)
    : DEV_STORYBOOK_PORT;

  // Cache in env vars for subsequent evaluations
  process.env._E2E_CONVEX_PORT = String(convex);
  process.env._E2E_WEB_PORT = String(web);
  process.env._E2E_STORYBOOK_PORT = String(storybook);

  // Log only on first allocation
  if (isIsolated) {
    console.log(
      `[playwright.config] Allocated ports: Convex=${convex}, Web=${web}, Storybook=${storybook}`,
    );
  }

  return { convex, web, storybook };
}

const { convex: CONVEX_PORT, web: WEB_PORT, storybook: STORYBOOK_PORT } = getAllocatedPorts();

const WEB_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${WEB_PORT}`;
const STORYBOOK_BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL_STORYBOOK || `http://localhost:${STORYBOOK_PORT}`;
const SERVER_TIMEOUT_MS = 120_000;

// BDD configuration - generates specs from .feature files
const bddTestDir = defineBddConfig({
  featuresRoot: "tests/features",
  outputDir: "tests/features-gen",
  steps: "tests/features/steps/*.steps.ts",
  importTestFrom: "tests/features/steps/fixtures.ts",
});

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true, // Tests use unique emails, safe to run in parallel
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Skip WIP tests and tests requiring external services (Polar sandbox)
  grepInvert: /@wip|@requires-polar-sandbox/,
  reporter: [
    ["html"],
    ["junit", { outputFile: `test-results/junit${isIsolated ? "-isolated" : ""}.xml` }],
  ],

  // Setup/teardown based on isolation mode
  globalSetup: isIsolated ? "./lib/isolated-setup.ts" : "./lib/global-setup.ts",
  globalTeardown: isIsolated ? "./lib/isolated-teardown.ts" : "./lib/global-teardown.ts",

  use: {
    baseURL: WEB_BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: DEFAULT_TIMEOUT,
  },

  projects: [
    // ─────────────────────────────────────────────────────────────────
    // Specs - Technical tests using backend fixtures (chromium only)
    // ─────────────────────────────────────────────────────────────────
    {
      name: "specs",
      testDir: "./tests/specs",
      use: { ...devices["Desktop Chrome"] },
    },

    // ─────────────────────────────────────────────────────────────────
    // Storybook tests (component tests)
    // ─────────────────────────────────────────────────────────────────
    {
      name: "storybook",
      testDir: "./tests/storybook",
      use: { ...devices["Desktop Chrome"], baseURL: STORYBOOK_BASE_URL },
      fullyParallel: true,
    },

    // ─────────────────────────────────────────────────────────────────
    // Features - BDD tests (auth, navigation)
    // Default: Chrome + mobile. CI adds Firefox + webkit.
    // Timeout increased to 60s for Convex subscription sync.
    // ─────────────────────────────────────────────────────────────────
    {
      name: "features-chromium",
      testDir: bddTestDir,
      timeout: 60_000,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "features-mobile",
      testDir: bddTestDir,
      timeout: 60_000,
      use: { ...devices["iPhone 14"] },
    },
    // Firefox and webkit only run in CI
    ...(isCI
      ? [
          {
            name: "features-firefox",
            testDir: bddTestDir,
            timeout: 60_000,
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "features-webkit",
            testDir: bddTestDir,
            timeout: 60_000,
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),
  ],

  // Web server configuration
  // Isolated mode (default): Playwright starts servers with dynamic port allocation
  // Non-isolated mode (ISOLATED=false): Expects dev servers already running on 3xxx/6xxx
  //   - globalSetup checks servers are running before tests start
  //   - No webServer config = no automatic server startup
  webServer: isIsolated
    ? [
        // Start Convex FIRST - webServers start sequentially in order
        // Port allocated at config load time via findUnusedPortSync, passed via env var
        // Playwright health checks the URL to know when Convex is ready
        {
          name: "convex",
          cwd: "../..",
          command: `echo '🔧 Starting Convex backend on port ${CONVEX_PORT}...' && cd apps/e2e && E2E_CONVEX_PORT=${CONVEX_PORT} E2E_WEB_URL=${WEB_BASE_URL} bun scripts/start-convex.ts`,
          url: `http://127.0.0.1:${CONVEX_PORT}`,
          reuseExistingServer: shouldReuseServer,
          gracefulShutdown: { signal: "SIGINT", timeout: SHUTDOWN_TIMEOUT },
          timeout: SERVER_TIMEOUT_MS,
          stdout: "pipe",
          stderr: "pipe",
        },
        {
          name: "web",
          cwd: "../..",
          // Pass all env vars directly - no file synchronization needed
          // Use unique .next-e2e-{port} dir per run to avoid Next.js lock conflicts
          command: `echo '🚀 Starting web server on port ${WEB_PORT}...' && cd apps/web && rm -rf .next-e2e-${WEB_PORT} && NEXT_BUILD_DIR=.next-e2e-${WEB_PORT} E2E_MODE=true PORT=${WEB_PORT} NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:${CONVEX_PORT} NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:${CONVEX_PORT + 1} SITE_URL=${WEB_BASE_URL} BETTER_AUTH_SECRET=${E2E_BETTER_AUTH_SECRET} bunx next dev --port ${WEB_PORT}`,
          url: WEB_BASE_URL,
          reuseExistingServer: shouldReuseServer,
          gracefulShutdown: { signal: "SIGINT", timeout: SHUTDOWN_TIMEOUT },
          timeout: SERVER_TIMEOUT_MS,
          // Note: Use DEBUG=pw:webserver to see server startup logs
          stdout: "pipe",
          stderr: "pipe",
        },
        {
          name: "storybook",
          cwd: "../..",
          command: `echo '📚 Starting Storybook on port ${STORYBOOK_PORT}...' && STORYBOOK_NO_OPEN=1 STORYBOOK_PORT=${STORYBOOK_PORT} bun dev:storybook`,
          url: STORYBOOK_BASE_URL,
          gracefulShutdown: { signal: "SIGINT", timeout: SHUTDOWN_TIMEOUT },
          reuseExistingServer: shouldReuseServer,
          timeout: SERVER_TIMEOUT_MS,
          stdout: "pipe",
          stderr: "pipe",
        },
      ]
    : undefined, // Non-isolated: no webServer, globalSetup verifies dev servers
});
