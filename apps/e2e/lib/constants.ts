/**
 * E2E test timeout constants.
 * Define once, use everywhere for consistency.
 */

/** Default timeout for waiting on page elements (10 seconds) */
export const DEFAULT_TIMEOUT = 10_000;

/** Extended timeout for slower operations like storybook loading, connections (30 seconds) */
export const EXTENDED_TIMEOUT = 30_000;

/** Quick timeout for fast visibility checks (1 second) */
export const QUICK_TIMEOUT = 1000;

/** Graceful shutdown timeout for web servers (10 seconds) */
export const SHUTDOWN_TIMEOUT = 10_000;

/** Mobile breakpoint width in pixels (matches Tailwind's md breakpoint) */
export const MOBILE_BREAKPOINT = 768;

/** Short delay for form validation debounce (milliseconds) */
export const FORM_VALIDATION_DELAY = 300;

/** Delay for dropdown animation to complete (milliseconds) */
export const DROPDOWN_OPEN_DELAY = 200;

/** Delay for Convex auth token sync after login/signup (milliseconds) */
export const AUTH_SYNC_DELAY = 2000;

/** Delay for search input debounce (milliseconds) */
export const SEARCH_DEBOUNCE_DELAY = 300;

// ─────────────────────────────────────────────────────────────────────────────
// Port Configuration - DYNAMIC RANGES for parallel E2E support
//
// Dev servers:  3xxx/6xxx (can run alongside E2E)
// E2E servers:  7xxx (isolated, non-overlapping ranges)
//
// Port Ranges (no overlap - safe for parallel runs):
//   Web:       7100-7199 (100 slots)
//   Convex:    7200-7298 even (50 slots, odd ports for site URL endpoint)
//   Storybook: 7300-7399 (100 slots)
//
// To kill all E2E processes:
//   lsof -ti :7100-7199,:7200-7299,:7300-7399 | xargs kill -9
// ─────────────────────────────────────────────────────────────────────────────

/** Dev web server port */
export const DEV_WEB_PORT = 3000;

/** Dev Storybook port */
export const DEV_STORYBOOK_PORT = 6006;

// E2E Web port range [7100-7199]
export const E2E_WEB_PORT_MIN = 7100;
export const E2E_WEB_PORT_MAX = 7199;

// E2E Storybook port range [7300-7399]
export const E2E_STORYBOOK_PORT_MIN = 7300;
export const E2E_STORYBOOK_PORT_MAX = 7399;

// E2E Convex port range [7200-7298] (even only, odd ports for site URL endpoint)
export const E2E_CONVEX_PORT_MIN = 7200;
export const E2E_CONVEX_PORT_MAX = 7298;

// ─────────────────────────────────────────────────────────────────────────────
// Convex Admin Key (E2E TESTING ONLY)
//
// WARNING: This key grants full admin access to the Convex database.
// It should ONLY be used with the isolated local Convex backend for E2E tests.
// NEVER use this key in production or with a production database.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin key for direct DB access in E2E tests.
 * This is the default admin key from Convex's local backend.
 * @see https://github.com/get-convex/convex-backend
 */
export const E2E_ADMIN_KEY =
  "0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd";

// ─────────────────────────────────────────────────────────────────────────────
// Better Auth Test Secret (E2E TESTING ONLY)
//
// WARNING: This is a test secret for E2E testing with isolated Convex backend.
// NEVER use this in production.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Test secret for Better Auth in E2E tests (32 bytes base64).
 * Must be used consistently in playwright.config.ts and convex-backend.ts.
 */
export const E2E_BETTER_AUTH_SECRET = "dGVzdC1zZWNyZXQtZm9yLWUyZS10ZXN0aW5nLW9ubHkh";
