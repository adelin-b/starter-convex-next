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
import { signUpSchema } from "@/lib/validation-schemas";
import { getSafeCallbackUrl } from "@/utils/url-utils";
import { useGoogleAuth } from "../hooks/use-google-auth";
import { AuthDivider } from "./auth-divider";
import { GoogleSignInButton } from "./google-sign-in-button";

type SignUpFormData = z.infer<typeof signUpSchema>;

type SignUpFormProps = {
  onSwitchToSignIn: () => void;
  callbackUrl?: string;
};

export default function SignUpForm({
  onSwitchToSignIn,
  callbackUrl = "/vehicles",
}: SignUpFormProps) {
  const router = useRouter();
  const { t } = useLingui();

  // Validate callbackUrl using shared utility
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  // Google OAuth handling via shared hook
  const { signInWithGoogle, isGoogleLoading } = useGoogleAuth({
    callbackUrl: safeCallbackUrl,
    actionTag: "googleSignUp",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
        },
        {
          onSuccess: () => {
            // Dynamic callback URL - type cast needed for Next.js strict routes
            router.push(safeCallbackUrl as Parameters<typeof router.push>[0]);
            toast.success(t`Sign up successful`);
          },
          onError: (error) => {
            // Log auth errors for monitoring
            captureMessage("Sign up failed", {
              level: "warning",
              tags: { feature: "auth", action: "signUp" },
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
        tags: { feature: "auth", action: "signUp" },
        extra: { email: data.email },
      });

      toast.error(t`Sign up failed. Please check your connection and try again.`);
    }
  };

  const isFormDisabled = isSubmitting || isGoogleLoading;

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="font-bold text-2xl text-foreground">
          <Trans>Create Account</Trans>
        </h1>
      </div>

      <form aria-busy={isSubmitting} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">
            <Trans>Name</Trans>
          </Label>
          <Input autoComplete="name" disabled={isFormDisabled} id="name" {...register("name")} />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>

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
            autoComplete="new-password"
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
              <Trans>Signing up...</Trans>
            </>
          ) : (
            <Trans>Sign Up</Trans>
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
        <Button onClick={onSwitchToSignIn} variant="link">
          <Trans>Already have an account? Sign In</Trans>
        </Button>
      </div>
    </div>
  );
}
