"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { Avatar, AvatarFallback } from "@starter-saas/ui/avatar";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";

/** Dev password used for all test accounts */
const DEV_PASSWORD = "DevPassword123!";

/** Test user credentials */
const DEV_USER = {
  email: "dev-user@test.local",
  name: "Dev User",
  password: DEV_PASSWORD,
};

type DevQuickLoginProps = {
  callbackUrl?: string;
};

/**
 * Development-only quick login component.
 * Provides one-click login with a test account.
 *
 * Only rendered when NODE_ENV === "development"
 */
export function DevQuickLogin({ callbackUrl = "/" }: DevQuickLoginProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = async () => {
    setIsLoading(true);

    try {
      // Try to sign up first (creates user if doesn't exist)
      const signUpResult = await authClient.signUp.email({
        email: DEV_USER.email,
        password: DEV_USER.password,
        name: DEV_USER.name,
      });

      // If sign up failed (user exists), try to sign in
      if (signUpResult.error) {
        const signInResult = await authClient.signIn.email({
          email: DEV_USER.email,
          password: DEV_USER.password,
        });

        if (signInResult.error) {
          throw new Error(
            `Dev user ${DEV_USER.email} exists with different password. ` +
              "Delete the user from the database or update DEV_PASSWORD.",
          );
        }
      }

      toast.success(`Signed in as ${DEV_USER.name}`);

      // Wait for auth to propagate
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push(callbackUrl as Parameters<typeof router.push>[0]);
    } catch (error) {
      console.error("Quick login failed:", error);
      const message = error instanceof Error ? error.message : "Quick login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development
  // biome-ignore lint/style/noProcessEnv: Dev mode check
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const initials = DEV_USER.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="border-yellow-500/50 border-dashed bg-yellow-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="font-medium text-sm text-yellow-600 dark:text-yellow-400">
          Dev Quick Login
        </CardTitle>
        <CardDescription className="text-xs">
          One-click login with test account (dev only)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          className="w-full justify-start"
          disabled={isLoading}
          onClick={handleQuickLogin}
          size="sm"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Avatar className="mr-2 h-6 w-6">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          )}
          <span className="flex-1 text-left">{DEV_USER.name}</span>
          {isLoading ? <UserPlus className="h-3 w-3 opacity-50" /> : <LogIn className="h-3 w-3 opacity-50" />}
        </Button>

        <p className="text-muted-foreground text-xs">
          Creates user if needed, then signs in.
          <br />
          Email: {DEV_USER.email}
        </p>
      </CardContent>
    </Card>
  );
}
