/**
 * Utilities for handling OAuth on Vercel preview deployments.
 *
 * Problem: Google OAuth doesn't allow wildcard redirect URIs, and Vercel preview
 * deployments have random URLs. This module provides a workaround by:
 * 1. Detecting preview deployments
 * 2. Routing OAuth through the staging URL
 * 3. Handling the redirect back to the preview deployment
 *
 * Flow:
 * 1. User on preview (random-url.vercel.app) clicks "Sign in with Google"
 * 2. OAuth redirects to staging callback with preview URL encoded
 * 3. Staging completes auth and redirects to preview with session token
 * 4. Preview receives token, sets cookie, and redirects to dashboard
 */

/**
 * Staging URL where Google OAuth callback is configured.
 * Update this when deploying to your own staging environment.
 */
const STAGING_BASE_URL = "https://your-app-staging.vercel.app";

/**
 * Production URL (main deployment).
 * Update these with your production domains.
 */
const PRODUCTION_HOSTS = ["your-app.com", "www.your-app.com"] as const;

/** localStorage key for storing preview return URL */
const PREVIEW_URL_KEY = "starter_saas_preview_return_url";

/**
 * Detects if the current deployment is a Vercel preview deployment.
 * Preview deployments have random URLs like: my-app-git-feature-abc123.vercel.app
 *
 * Returns false for:
 * - Production domains
 * - Staging URL
 * - localhost (development)
 */
export function isPreviewDeployment(): boolean {
  if (globalThis.window === undefined) {
    return false;
  }

  const hostname = globalThis.location.hostname;

  // Not preview if localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return false;
  }

  // Not preview if production
  if (PRODUCTION_HOSTS.includes(hostname as (typeof PRODUCTION_HOSTS)[number])) {
    return false;
  }

  // Not preview if it's the staging URL
  try {
    const stagingHostname = new URL(STAGING_BASE_URL).hostname;
    if (hostname === stagingHostname) {
      return false;
    }
  } catch {
    // Invalid staging URL, continue with detection
  }

  // It's a preview if it's a vercel.app domain but not staging
  return hostname.endsWith(".vercel.app");
}

/**
 * Gets the full origin URL of the current page.
 */
export function getCurrentOrigin(): string {
  if (globalThis.window === undefined) {
    return "";
  }
  return globalThis.location.origin;
}

/**
 * Saves the preview URL to localStorage for later redirect.
 * Called when a user on a preview deployment initiates OAuth.
 */
export function savePreviewReturnUrl(returnPath: string): void {
  if (globalThis.window === undefined) {
    return;
  }

  const fullUrl = `${getCurrentOrigin()}${returnPath}`;
  localStorage.setItem(PREVIEW_URL_KEY, fullUrl);
}

/**
 * Gets the OAuth callback URL to use.
 * For preview deployments, this returns the staging callback with returnTo param.
 * For staging/production, returns the normal callback.
 */
export function getOAuthCallbackUrl(returnPath: string): string {
  if (isPreviewDeployment()) {
    // For preview deployments, route through staging
    const previewReturnUrl = `${getCurrentOrigin()}${returnPath}`;
    const encodedReturnUrl = encodeURIComponent(previewReturnUrl);
    // The staging handoff API will complete auth and redirect to preview
    return `${STAGING_BASE_URL}/api/auth/preview-handoff?returnTo=${encodedReturnUrl}`;
  }

  // For staging/production, use the normal callback path
  return returnPath;
}
