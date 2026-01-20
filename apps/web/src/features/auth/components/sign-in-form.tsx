"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { captureException, captureMessage } from "@sentry/nextjs";
import { Button } from "@starter-saas/ui/button";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { authClient } from "@/lib/auth/client";
import { signInSchema } from "@/lib/validation-schemas";
import { getSafeCallbackUrl } from "@/utils/url-utils";
import { useGoogleAuth } from "../hooks/use-google-auth";
import { AuthDivider } from "./auth-divider";
import { GoogleSignInButton } from "./google-sign-in-button";

type SignInFormData = z.infer<typeof signInSchema>;

type SignInFormProps = {
  onSwitchToSignUp: () => void;
  callbackUrl?: string;
};

export default function SignInForm({ onSwitchToSignUp, callbackUrl = "/agents" }: SignInFormProps) {
  const router = useRouter();
  const { t } = useLingui();

  // Validate callbackUrl using shared utility
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  // Google OAuth handling via shared hook
  const { signInWithGoogle, isGoogleLoading } = useGoogleAuth({
    callbackUrl: safeCallbackUrl,
    actionTag: "googleSignIn",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: () => {
            // Dynamic callback URL - type cast needed for Next.js strict routes
            router.push(safeCallbackUrl as Parameters<typeof router.push>[0]);
            toast.success(t`Sign in successful`);
          },
          onError: (error) => {
            // Log auth errors for monitoring
            captureMessage("Sign in failed", {
              level: "warning",
              tags: { feature: "auth", action: "signIn" },
              extra: { errorCode: error.error?.code, statusText: error.error?.statusText },
            });

            const message =
              error.error?.message ||
              error.error?.statusText ||
              t`An unexpected error occurred. Please try again.`;
            toast.error(message);
          },
        },
      );
    } catch (error) {
      // Capture unexpected errors to Sentry
      captureException(error, {
        tags: { feature: "auth", action: "signIn" },
        extra: { email: data.email },
      });

      toast.error(t`Sign in failed. Please check your connection and try again.`);
    }
  };

  const isFormDisabled = isSubmitting || isGoogleLoading;

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="font-bold text-2xl text-foreground">
          <Trans>Welcome Back</Trans>
        </h1>
      </div>

      <form aria-busy={isSubmitting} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">
            <Trans>Email</Trans>
          </Label>
          <Input
            autoComplete="email"
            disabled={isFormDisabled}
            id="email"
            type="email"
            {...register("email")}
          />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            <Trans>Password</Trans>
          </Label>
          <Input
            autoComplete="current-password"
            disabled={isFormDisabled}
            id="password"
            type="password"
            {...register("password")}
          />
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>

        <Button className="w-full" disabled={isFormDisabled} type="submit">
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              <Trans>Signing in...</Trans>
            </>
          ) : (
            <Trans>Sign In</Trans>
          )}
        </Button>
      </form>

      <AuthDivider />

      <GoogleSignInButton
        disabled={isFormDisabled}
        isLoading={isGoogleLoading}
        onClick={signInWithGoogle}
      />

      <div className="mt-4 text-center">
        <Button onClick={onSwitchToSignUp} variant="link">
          <Trans>Need an account? Sign Up</Trans>
        </Button>
      </div>
    </div>
  );
}
