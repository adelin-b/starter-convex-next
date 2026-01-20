"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent } from "@starter-saas/ui/card";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Home, Loader2, ShieldX } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useQueryWithStatus } from "@/lib/convex-hooks";

type AuthGuardProps = {
  children: ReactNode;
  loadingFallback?: ReactNode;
  unauthenticatedFallback?: ReactNode;
};

/**
 * Auth guard component that shows appropriate UI based on authentication state.
 * Prevents crashes from unauthenticated API calls.
 */
export function AuthGuard({ children, loadingFallback, unauthenticatedFallback }: AuthGuardProps) {
  return (
    <>
      <AuthLoading>{loadingFallback ?? <AuthLoadingFallback />}</AuthLoading>
      <Unauthenticated>{unauthenticatedFallback ?? <UnauthenticatedFallback />}</Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </>
  );
}

function AuthLoadingFallback() {
  const { t } = useLingui();
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 aria-label={t`Loading`} className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          <Trans>Loading...</Trans>
        </p>
      </div>
    </div>
  );
}

function UnauthenticatedFallback() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLingui();

  useEffect(() => {
    // Redirect to login with callback URL - type cast needed for dynamic routes
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
    router.replace(loginUrl as Parameters<typeof router.replace>[0]);
  }, [router, pathname]);

  // Show loading while redirecting
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2
          aria-label={t`Redirecting`}
          className="h-8 w-8 animate-spin text-muted-foreground"
        />
        <p className="text-muted-foreground text-sm">
          <Trans>Redirecting to login...</Trans>
        </p>
      </div>
    </div>
  );
}

type AdminGuardProps = {
  children: ReactNode;
  loadingFallback?: ReactNode;
  permissionDeniedFallback?: ReactNode;
};

/**
 * Admin guard that requires admin access (system admin or organization owner).
 * Shows permission denied for authenticated users without admin privileges.
 */
export function AdminGuard({
  children,
  loadingFallback,
  permissionDeniedFallback,
}: AdminGuardProps) {
  return (
    <AuthGuard loadingFallback={loadingFallback}>
      <AdminPermissionCheck fallback={permissionDeniedFallback}>{children}</AdminPermissionCheck>
    </AuthGuard>
  );
}

function AdminPermissionCheck({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { data: hasAdminAccess, isPending } = useQueryWithStatus(
    api.organizations.hasAdminAccess,
    {},
  );

  // Still loading
  if (isPending) {
    return <AuthLoadingFallback />;
  }

  // No admin access
  if (!hasAdminAccess) {
    return fallback ?? <NoAdminAccessFallback />;
  }

  return <>{children}</>;
}

function NoAdminAccessFallback() {
  return (
    <Card className="mx-auto max-w-md" data-testid="no-permission-page">
      <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="font-semibold text-xl">
            <Trans>Access Denied</Trans>
          </h2>
          <p className="text-muted-foreground">
            <Trans>
              You need owner permissions to access the admin area. Please contact an administrator
              if you believe this is an error.
            </Trans>
          </p>
        </div>
        <Button asChild variant="outline">
          <Link data-testid="back-to-app-link" href="/agents">
            <Home className="mr-2 h-4 w-4" />
            <Trans>Back to Home</Trans>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Export for potential reuse
export { NoAdminAccessFallback };
