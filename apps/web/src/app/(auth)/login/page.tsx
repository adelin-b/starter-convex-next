"use client";

import { captureMessage } from "@sentry/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import SignInForm from "@/features/auth/components/sign-in-form";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { authClient } from "@/lib/auth/client";
import { getSafeCallbackUrl } from "@/utils/url-utils";
import {
  AuthLoading as AuthLoadingSpinner,
  SuspenseLoadingFallback,
} from "../_components/auth-loading";
import { AuthPageLayout } from "../_components/auth-page-layout";
import { RedirectOnAuth } from "../_components/redirect-on-auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSignIn, setShowSignIn] = useState(false);
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = getSafeCallbackUrl(rawCallbackUrl);

  // Trigger Google One Tap on mount
  useEffect(() => {
    // Only trigger if oneTap is available (plugin configured with clientId)
    if (authClient.oneTap) {
      authClient.oneTap({
        fetchOptions: {
          onSuccess: () => {
            router.push(callbackUrl as Parameters<typeof router.push>[0]);
          },
          onError: (error) => {
            // Log for debugging, but don't show user error (One Tap is optional UX enhancement)
            captureMessage("Google One Tap failed", {
              level: "info",
              tags: { feature: "auth", action: "oneTap" },
              extra: { errorCode: error?.error?.code },
            });
          },
        },
      });
    }
  }, [router, callbackUrl]);

  return (
    <>
      <Authenticated>
        <RedirectOnAuth callbackUrl={callbackUrl} />
      </Authenticated>
      <Unauthenticated>
        <AuthPageLayout>
          {showSignIn ? (
            <SignInForm callbackUrl={callbackUrl} onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm callbackUrl={callbackUrl} onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </AuthPageLayout>
      </Unauthenticated>
      <AuthLoading>
        <AuthLoadingSpinner />
      </AuthLoading>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<SuspenseLoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}
