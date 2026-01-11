/**
 * Lazy environment variable access for Convex.
 *
 * IMPORTANT: Convex bundles modules at deploy time when process.env is empty.
 * Environment variables are only available at function execution time.
 * We use getters to defer access until runtime when vars are available.
 */
export const env = {
  get BETTER_AUTH_SECRET(): string {
    const value = process.env.BETTER_AUTH_SECRET;
    if (!value || value.length < 32) {
      throw new Error("BETTER_AUTH_SECRET must be at least 32 characters");
    }
    return value;
  },
  get SITE_URL(): string {
    // SITE_URL is the user-configured site URL (e.g., https://starter-saas.fr, http://localhost:3000)
    // IMPORTANT: Do NOT fallback to CONVEX_SITE_URL - they serve different purposes
    // CONVEX_SITE_URL = Convex HTTP actions endpoint (e.g., https://xxx.convex.site)
    // SITE_URL = Frontend app URL (e.g., http://localhost:3000, https://starter-saas.fr)
    const value = process.env.SITE_URL;
    if (value) {
      return value;
    }

    // Deploy-time placeholder (env vars empty during bundling)
    // If this placeholder reaches runtime, OAuth will fail with clear redirect errors
    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- intentional invalid URL for dev fallback
    return "http://site-url-not-configured.invalid";
  },
  get IS_TEST(): "true" | "false" {
    return (process.env.IS_TEST as "true" | "false") || "false";
  },
  get GOOGLE_CLIENT_ID(): string | undefined {
    return process.env.GOOGLE_CLIENT_ID || undefined;
  },
  get GOOGLE_CLIENT_SECRET(): string | undefined {
    return process.env.GOOGLE_CLIENT_SECRET || undefined;
  },
  get RESEND_API_KEY(): string | undefined {
    return process.env.RESEND_API_KEY || undefined;
  },
  get OAUTH_PROXY_URL(): string | undefined {
    // URL registered in Google OAuth for proxying preview/staging deployments
    // Should be the production URL (e.g., https://starter-saas.fr)
    return process.env.OAUTH_PROXY_URL || undefined;
  },
  get RESEND_TEST_MODE(): boolean {
    return process.env.RESEND_TEST_MODE === "true";
  },
  get USE_SMTP(): boolean {
    return process.env.USE_SMTP === "true";
  },
  get SMTP_HOST(): string {
    return process.env.SMTP_HOST || "localhost";
  },
  get SMTP_PORT(): number {
    return Number(process.env.SMTP_PORT) || 2525;
  },

  // Polar payment/subscription environment variables
  get POLAR_ORGANIZATION_TOKEN(): string | undefined {
    return process.env.POLAR_ORGANIZATION_TOKEN || undefined;
  },
  get POLAR_WEBHOOK_SECRET(): string | undefined {
    return process.env.POLAR_WEBHOOK_SECRET || undefined;
  },
  get POLAR_SERVER(): string {
    return process.env.POLAR_SERVER || "sandbox";
  },
  // Product IDs - configure these in your Polar dashboard
  get POLAR_PRODUCT_PRO_MONTHLY(): string | undefined {
    return process.env.POLAR_PRODUCT_PRO_MONTHLY || undefined;
  },
  get POLAR_PRODUCT_PRO_YEARLY(): string | undefined {
    return process.env.POLAR_PRODUCT_PRO_YEARLY || undefined;
  },
  get POLAR_PRODUCT_TEAM_MONTHLY(): string | undefined {
    return process.env.POLAR_PRODUCT_TEAM_MONTHLY || undefined;
  },
  get POLAR_PRODUCT_TEAM_YEARLY(): string | undefined {
    return process.env.POLAR_PRODUCT_TEAM_YEARLY || undefined;
  },
};

/**
 * Convex auto-provided environment variables.
 * These are injected by Convex runtime and guaranteed to be present.
 * Not validated at import time since they don't exist until runtime.
 * @see https://docs.convex.dev/auth/advanced/custom-auth#:~:text=CONVEX_SITE_URL
 */
export const convexEnv = {
  get CONVEX_SITE_URL() {
    return process.env.CONVEX_SITE_URL as string;
  },
  get CONVEX_CLOUD_URL() {
    return process.env.CONVEX_CLOUD_URL as string;
  },
};
