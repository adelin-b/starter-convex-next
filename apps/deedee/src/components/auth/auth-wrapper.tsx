"use client";

import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";

type AuthWrapperProps = {
  children: React.ReactNode;
};

/**
 * AuthWrapper - Ensures user is authenticated and loaded before rendering children
 *
 * This component:
 * - Shows loading state while Better-Auth session is loading
 * - Shows loading state while Convex user profile is being created/fetched
 * - Only renders children once user is confirmed to exist
 * - Redirects to sign-in if not authenticated (handled by middleware)
 *
 * Usage: Wrap protected layouts/pages with this component
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading } = useUser();

  // Show loading state while authentication is loading or user is being created
  if (isLoading || user === null || user === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // User is loaded and exists - render children
  return <>{children}</>;
}
