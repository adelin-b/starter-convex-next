// Server-only enforcement handled by package.json exports

import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { oAuthProxy, oneTap } from "better-auth/plugins";
import { z } from "zod";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { env } from "./env";
import { zodInternalMutation } from "./lib/functions";

// Mutable state to prevent repeated console.warn on every request
const warningState = { hasLoggedGoogleOAuth: false, hasLoggedEmailConfig: false };

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(
  context: GenericCtx<DataModel>,
  { optionsOnly }: { optionsOnly?: boolean } = { optionsOnly: false },
) {
  // Access env at runtime (not module load) to avoid deploy-time errors
  const siteUrl = env.SITE_URL;
  const isEmailConfigured = !!env.RESEND_API_KEY;

  // Build trusted origins from SITE_URL
  const trustedOrigins: string[] = siteUrl ? [siteUrl] : [];

  // Configure Google OAuth only if credentials are provided
  const googleClientId = env.GOOGLE_CLIENT_ID;
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET;
  const hasGoogleOAuth = googleClientId && googleClientSecret;

  // OAuth proxy URL for preview/staging deployments (must be registered in Google OAuth)
  const oauthProxyUrl = env.OAUTH_PROXY_URL;

  // Only use OAuth proxy when OAUTH_PROXY_URL is set AND differs from SITE_URL
  // When OAUTH_PROXY_URL == SITE_URL, we use direct OAuth (URL is registered in Google)
  const useOAuthProxy = oauthProxyUrl && oauthProxyUrl !== siteUrl;

  // Warn once if Google OAuth credentials are missing
  if (!(hasGoogleOAuth || optionsOnly || warningState.hasLoggedGoogleOAuth)) {
    warningState.hasLoggedGoogleOAuth = true;
    console.warn(
      "[AUTH] Google OAuth disabled: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET not configured.",
      "Users will only be able to sign in with email/password.",
    );
  }

  // Warn once if email sending is not configured
  if (!(isEmailConfigured || optionsOnly || warningState.hasLoggedEmailConfig)) {
    warningState.hasLoggedEmailConfig = true;
    console.warn(
      "[AUTH] Email sending disabled: RESEND_API_KEY not configured.",
      "Email verification and password reset will not work.",
    );
  }

  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    baseURL: siteUrl,
    trustedOrigins,
    database: authComponent.adapter(context),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: isEmailConfigured,
      sendResetPassword: isEmailConfigured
        ? async ({ user, url }) => {
            if ("runAction" in context) {
              await context.runAction(internal.emails.index.sendPasswordResetEmail, {
                to: user.email,
                name: user.name || user.email.split("@")[0],
                url,
              });
            }
          }
        : undefined,
    },
    emailVerification: isEmailConfigured
      ? {
          sendVerificationEmail: async ({ user, url }) => {
            if ("runAction" in context) {
              await context.runAction(internal.emails.index.sendVerificationEmail, {
                to: user.email,
                name: user.name || user.email.split("@")[0],
                url,
              });
            }
          },
        }
      : undefined,
    socialProviders: hasGoogleOAuth
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
    // Plugins:
    // - convex: Required for Convex database integration
    // - oAuthProxy: Proxies OAuth through OAUTH_PROXY_URL for Vercel preview deployments
    //   Only enabled when OAUTH_PROXY_URL differs from SITE_URL (preview URL not in Google)
    //   currentURL tells the proxy where to redirect back after OAuth completes
    // - oneTap: Google One Tap sign-in (only if Google OAuth is configured)
    plugins: [
      convex(),
      ...(hasGoogleOAuth
        ? [
            ...(useOAuthProxy
              ? [oAuthProxy({ productionURL: oauthProxyUrl, currentURL: siteUrl })]
              : []),
            oneTap(),
          ]
        : []),
    ],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // First user becomes system admin
            if ("runMutation" in context) {
              try {
                await context.runMutation(internal.auth.makeFirstUserAdmin, {
                  userId: user.id,
                });
              } catch (error) {
                // Log with full context - first admin creation failure is important to track
                console.error(
                  "[AUTH] IMPORTANT: Failed to make first user admin.",
                  "User signed up successfully but may not have admin access.",
                  "Run makeFirstUserAdmin manually if this is the first user.",
                  { userId: user.id, error },
                );
              }
            }
          },
        },
      },
    },
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  async handler(context) {
    return await authComponent.safeGetAuthUser(context);
  },
});

/**
 * Make first user a system admin.
 * Called from databaseHooks.user.create.after.
 */
export const makeFirstUserAdmin = zodInternalMutation({
  args: { userId: z.string() },
  async handler(context, { userId }) {
    // Check if any admin exists
    const existingAdmin = await context.db.query("admins").first();
    if (existingAdmin) {
      return; // Not the first user
    }

    await context.db.insert("admins", {
      userId,
      createdAt: Date.now(),
    });
    console.log(`[AUTH] First user ${userId} made system admin`);
  },
});
