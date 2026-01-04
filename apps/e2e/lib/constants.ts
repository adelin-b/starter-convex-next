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
export const AUTH_SYNC_DELAY = 500;

/** Delay for search input debounce (milliseconds) */
export const SEARCH_DEBOUNCE_DELAY = 300;

// ─────────────────────────────────────────────────────────────────────────────
// Port Configuration (STRICT - no fallback to other ports)
//
// Dev servers:  3xxx/6xxx (can run alongside E2E)
// E2E servers:  7xxx (isolated, never conflicts with dev)
//
// To kill all E2E processes:
//   lsof -ti :7001,:7006,:7210,:7211 | xargs kill -9
// ─────────────────────────────────────────────────────────────────────────────

/** Dev web server port */
export const DEV_WEB_PORT = 3001;

/** Dev Storybook port */
export const DEV_STORYBOOK_PORT = 6006;

/** E2E web server port (isolated mode) - STRICT */
export const E2E_WEB_PORT = 7001;

/** E2E Storybook port (isolated mode) - STRICT */
export const E2E_STORYBOOK_PORT = 7006;

/** E2E Convex backend port - STRICT (also uses +1 for HTTP actions) */
export const E2E_CONVEX_START_PORT = 7210;

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
 * Must be used consistently in both write-e2e-env.ts and convex-backend.ts.
 */
export const E2E_BETTER_AUTH_SECRET = "dGVzdC1zZWNyZXQtZm9yLWUyZS10ZXN0aW5nLW9ubHkh";
