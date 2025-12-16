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
