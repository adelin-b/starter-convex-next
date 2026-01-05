"use client";

import { useLingui } from "@lingui/react/macro";
import { captureException } from "@sentry/nextjs";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import {
  getOAuthCallbackUrl,
  isPreviewDeployment,
  savePreviewReturnUrl,
} from "../lib/preview-auth";

type UseGoogleAuthOptions = {
  callbackUrl: string;
  /** Tag for Sentry logging (e.g., "googleSignIn" or "googleSignUp") */
  actionTag?: string;
};

/**
 * Hook for Google OAuth sign-in functionality.
 * Handles loading state, error handling, and Sentry reporting.
 *
 * On Vercel preview deployments, routes OAuth through staging URL
 * since Google OAuth doesn't allow wildcard redirect URIs.
 */
export function useGoogleAuth({ callbackUrl, actionTag = "googleSignIn" }: UseGoogleAuthOptions) {
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // For preview deployments, save the return URL and route through staging
      if (isPreviewDeployment()) {
        savePreviewReturnUrl(callbackUrl);
      }

      // Get the appropriate callback URL (staging for preview, normal otherwise)
      const effectiveCallbackUrl = getOAuthCallbackUrl(callbackUrl);

      await authClient.signIn.social({
        provider: "google",
        callbackURL: effectiveCallbackUrl,
      });
      // Note: On success, browser redirects to Google - we won't reach here
    } catch (error) {
      captureException(error, {
        tags: { feature: "auth", action: actionTag },
      });
      toast.error(t`Google sign in failed. Please try again.`);
    } finally {
      // Reset loading in all error cases (popup closed, network error, etc.)
      // On success redirect, this runs but component unmounts anyway
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isGoogleLoading: isLoading,
  };
}
