import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import {
  DEFAULT_TIMEOUT,
  DEV_STORYBOOK_PORT,
  DEV_WEB_PORT,
  E2E_CONVEX_START_PORT,
  E2E_STORYBOOK_PORT,
  E2E_WEB_PORT,
  SHUTDOWN_TIMEOUT,
} from "./lib/constants";

/**
 * Unified Playwright configuration for all E2E tests.
 *
 * PORT SCHEME:
 *   Dev servers:  3xxx/6xxx (web=3001, storybook=6006)
 *   E2E servers:  7xxx (web=7001, storybook=7006, convex=7210+)
 *
 * ISOLATION MODES:
 * - Default (isolated): Fresh Convex backend on 7xxx ports, .next-e2e build dir
 *   Can run alongside `bun dev` without conflicts.
 * - ISOLATED=false: Uses existing dev server on 3xxx ports. Faster iteration.
 *
 * Usage:
 *   bun test:e2e                 # Isolated mode (7xxx ports)
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
// Reuse servers locally (handles UI mode restarts), fresh in CI
const shouldReuseServer = !isCI;

// Port configuration
// - Dev servers: 3xxx/6xxx (web=3001, storybook=6006)
// - E2E servers: 7xxx (web=7001, storybook=7006, convex=7210+)
const WEB_PORT = isIsolated ? E2E_WEB_PORT : DEV_WEB_PORT;
const STORYBOOK_PORT = isIsolated ? E2E_STORYBOOK_PORT : DEV_STORYBOOK_PORT;
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
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "features-webkit",
            testDir: bddTestDir,
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),
  ],

  // Web server configuration
  // Isolated mode (default): Playwright starts servers on 7xxx ports
  // Non-isolated mode (ISOLATED=false): Expects dev servers already running on 3xxx/6xxx
  //   - globalSetup checks servers are running before tests start
  //   - No webServer config = no automatic server startup
  webServer: isIsolated
    ? [
        // Start Convex FIRST - webServers start sequentially in order
        // Script waits for both ports (7210 + 7211) before signaling ready
        {
          name: "convex",
          cwd: "../..",
          command: `echo '🔧 Starting Convex backend (isolated on port ${E2E_CONVEX_START_PORT})...' && cd apps/e2e && bun scripts/start-convex.ts`,
          url: `http://127.0.0.1:${E2E_CONVEX_START_PORT}`,
          reuseExistingServer: shouldReuseServer,
          gracefulShutdown: { signal: "SIGINT", timeout: SHUTDOWN_TIMEOUT },
          timeout: SERVER_TIMEOUT_MS,
          stdout: "pipe",
          stderr: "pipe",
        },
        {
          name: "web",
          cwd: "../..",
          // Write .env.e2e before starting Next.js (sets NEXT_PUBLIC_CONVEX_SITE_URL, etc.)
          command: `echo '🚀 Starting web server (isolated on port ${WEB_PORT})...' && cd apps/e2e && bun scripts/write-e2e-env.ts && cd ../web && rm -rf .next-e2e && E2E_MODE=true PORT=${WEB_PORT} bunx next dev --port ${WEB_PORT}`,
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
          command: `echo '📚 Starting Storybook (isolated on port ${STORYBOOK_PORT})...' && STORYBOOK_NO_OPEN=1 STORYBOOK_PORT=${STORYBOOK_PORT} bun dev:storybook`,
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
