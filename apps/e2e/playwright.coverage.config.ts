/**
 * Playwright configuration for E2E tests with V8 code coverage collection.
 *
 * This config:
 * - Uses V8 coverage (built into Chromium) instead of Istanbul instrumentation
 * - Starts Next.js with NODE_V8_COVERAGE and --inspect for server coverage
 * - Uses monocart-reporter for coverage reports
 *
 * Usage:
 *   bun run test:e2e:coverage
 *
 * Based on: https://github.com/cenfun/nextjs-with-playwright
 */
import { defineConfig, devices } from "@playwright/test";
import type { CoverageReportOptions } from "monocart-reporter";
import { DEFAULT_TIMEOUT, SHUTDOWN_TIMEOUT } from "./lib/constants";

// Enable V8 coverage collection in lib/test.ts fixtures
process.env.V8_COVERAGE = "true";

const WEB_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3001";
const SERVER_TIMEOUT_MS = 120_000;
const isCI = !!process.env.CI;

// Coverage report configuration for monocart-reporter
const coverageOptions: CoverageReportOptions = {
  name: "Starter SaaS V8 Coverage Report",

  // Filter coverage entries
  entryFilter: (entry) => {
    // Include client-side Next.js chunks and server app files
    const url = entry.url;
    return url.includes("/_next/static/chunks/") || url.includes("next/server/app");
  },

  // Filter source files for the report
  sourceFilter: (sourcePath) => {
    // Include app src files and ui package, exclude node_modules
    const isAppCode =
      sourcePath.includes("apps/web/src") ||
      sourcePath.includes("packages/ui/src") ||
      sourcePath.includes("packages/backend/convex");
    return isAppCode && !sourcePath.includes("node_modules");
  },

  // Clean up paths in the report
  sourcePath: (filePath) => {
    // Remove Next.js internal path prefixes
    return filePath.replace(/webpack:\/\/[^/]+\//, "").replace(/\?[^?]+$/, "");
  },

  reports: [
    // Native V8 reports
    ["v8"],
    ["console-details"],
    ["html", { subdir: "html" }],
    // Istanbul-compatible reports (auto-converted from V8)
    ["lcovonly", { file: "lcov.info" }],
    ["json", { file: "coverage-istanbul.json" }],
    // Istanbul HTML report (classic coverage view)
    ["html-spa", { subdir: "istanbul-html" }],
  ],

  outputDir: "./coverage-report",
};

export default defineConfig({
  testDir: "./tests/web/specs",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,

  reporter: [
    ["list"],
    [
      "monocart-reporter",
      {
        name: "Starter SaaS E2E Coverage Report",
        outputFile: "./coverage-report/index.html",
        coverage: coverageOptions,
      },
    ],
  ],

  globalSetup: "./lib/global-setup.ts",
  globalTeardown: "./lib/coverage-teardown.ts",

  use: {
    baseURL: WEB_BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: DEFAULT_TIMEOUT,
  },

  projects: [
    {
      name: "coverage-chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.spec\.ts/,
    },
  ],

  webServer: {
    name: "web-coverage",
    cwd: "../web",
    // Start with V8 coverage enabled and Node inspector for server coverage
    // NODE_V8_COVERAGE collects coverage data
    // NODE_OPTIONS=--inspect=9229 enables CDP for server-side collection (router at 9230)
    command: "bun run dev",
    url: WEB_BASE_URL,
    reuseExistingServer: false, // Always start fresh for coverage
    gracefulShutdown: { signal: "SIGINT", timeout: SHUTDOWN_TIMEOUT },
    timeout: SERVER_TIMEOUT_MS,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NODE_V8_COVERAGE: ".v8-coverage",
      NODE_OPTIONS: "--inspect=9229",
    },
  },
});
