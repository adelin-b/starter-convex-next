"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import { type OrganizationRole, roleLabels } from "@starter-saas/backend/convex/schema";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { getConvexErrorMessage } from "@starter-saas/ui/use-convex-form-errors";
import { Authenticated, AuthLoading, Unauthenticated, useMutation } from "convex/react";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import { useQueryWithStatus } from "@/lib/convex-hooks";
import {
  AuthLoading as AuthLoadingSpinner,
  SuspenseLoadingFallback,
} from "../../_components/auth-loading";
import { AuthPageLayout } from "../../_components/auth-page-layout";

function InvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLingui();
  const token = searchParams.get("token");

  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  const acceptMutation = useMutation(api.invitations.accept);

  // Query invitation details (public, no auth required)
  const { data: invitation, isPending } = useQueryWithStatus(
    api.invitations.getByToken,
    token ? { token } : "skip",
  );

  const handleAccept = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsAccepting(true);
    setAcceptError(null);

    try {
      await acceptMutation({ token });
      setAcceptSuccess(true);
      // Redirect to dashboard after success
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      setAcceptError(getConvexErrorMessage(error, "Failed to accept invitation"));
    } finally {
      setIsAccepting(false);
    }
  }, [token, acceptMutation, router]);

  // No token provided
  if (!token) {
    return (
      <InvitationCard
        description={t`No invitation token was provided in the URL.`}
        icon={<AlertCircle className="size-12 text-amber-500" />}
        title={t`Invalid Invitation Link`}
      >
        <Button className="w-full" render={<Link href="/" />}>
          <Trans>Go to Home</Trans>
        </Button>
      </InvitationCard>
    );
  }

  // Loading state
  if (isPending) {
    return (
      <InvitationCard
        description={t`Verifying your invitation...`}
        icon={<Loader2 className="size-12 animate-spin text-primary" />}
        title={t`Loading Invitation`}
      />
    );
  }

  // Invitation not found
  if (invitation === null) {
    return (
      <InvitationCard
        description={t`This invitation may have been revoked or the link is incorrect. Please contact the person who invited you.`}
        icon={<XCircle className="size-12 text-destructive" />}
        title={t`Invitation Not Found`}
      >
        <Button className="w-full" render={<Link href="/" />}>
          <Trans>Go to Home</Trans>
        </Button>
      </InvitationCard>
    );
  }

  // Check if expired
  const isExpired = invitation.expiresAt < Date.now();

  // Invitation expired
  if (isExpired || invitation.status === "expired") {
    const expiredOrganizationName = invitation.organization?.name || t`the organization`;
    const expiredDescription = t`This invitation has expired. Please ask ${expiredOrganizationName} to send you a new one.`;
    return (
      <InvitationCard
        description={expiredDescription}
        icon={<Clock className="size-12 text-amber-500" />}
        title={t`Invitation Expired`}
      >
        <Button className="w-full" render={<Link href="/" />}>
          <Trans>Go to Home</Trans>
        </Button>
      </InvitationCard>
    );
  }

  // Invitation already accepted
  if (invitation.status === "accepted") {
    return (
      <InvitationCard
        description={t`This invitation has already been accepted.`}
        icon={<CheckCircle className="size-12 text-green-500" />}
        title={t`Already Accepted`}
      >
        <Button className="w-full" render={<Link href="/" />}>
          <Trans>Go to Dashboard</Trans>
        </Button>
      </InvitationCard>
    );
  }

  // Invitation revoked
  if (invitation.status === "revoked") {
    return (
      <InvitationCard
        description={t`This invitation has been revoked by the organization administrator.`}
        icon={<XCircle className="size-12 text-destructive" />}
        title={t`Invitation Revoked`}
      >
        <Button className="w-full" render={<Link href="/" />}>
          <Trans>Go to Home</Trans>
        </Button>
      </InvitationCard>
    );
  }

  // Accept success
  if (acceptSuccess) {
    const successOrganizationName = invitation.organization?.name || t`the organization`;
    const successDescription = t`You are now a member of ${successOrganizationName}. Redirecting...`;
    return (
      <InvitationCard
        description={successDescription}
        icon={<CheckCircle className="size-12 text-green-500" />}
        title={t`Invitation Accepted!`}
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <Trans>Redirecting to dashboard...</Trans>
        </div>
      </InvitationCard>
    );
  }

  // Valid invitation - show details and accept button
  return (
    <>
      <Authenticated>
        <InvitationCard
          description={t`You've been invited to join this organization.`}
          icon={<Mail className="size-12 text-primary" />}
          title={t`You're Invited!`}
        >
          {/* Invitation details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <Building2 className="size-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">{invitation.organization?.name}</p>
                <p className="text-muted-foreground text-sm">
                  <Trans>Organization</Trans>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <ShieldCheck className="size-8 text-muted-foreground" />
              <div>
                <div className="flex flex-wrap gap-1">
                  {invitation.roles.map((role: OrganizationRole) => (
                    <Badge key={role} variant="secondary">
                      {roleLabels[role]}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  <Trans>Assigned Roles</Trans>
                </p>
              </div>
            </div>
          </div>

          {acceptError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="size-4" />
              <p className="text-sm">{acceptError}</p>
            </div>
          )}

          <Button className="w-full" disabled={isAccepting} onClick={handleAccept} size="lg">
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <Trans>Accepting...</Trans>
              </>
            ) : (
              <Trans>Accept Invitation</Trans>
            )}
          </Button>
        </InvitationCard>
      </Authenticated>

      <Unauthenticated>
        <InvitationCard
          description={t`Please sign in or create an account to accept this invitation.`}
          icon={<Mail className="size-12 text-primary" />}
          title={t`Sign in to Accept`}
        >
          {/* Invitation preview */}
          <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
            <Building2 className="size-8 text-muted-foreground" />
            <div>
              <p className="font-semibold">{invitation.organization?.name}</p>
              <p className="text-muted-foreground text-sm">
                <Trans>is inviting you to join their team</Trans>
              </p>
            </div>
          </div>

          <Button
            className="w-full"
            render={
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/invitations/accept?token=${token}`)}`}
              />
            }
            size="lg"
          >
            <Trans>Sign In to Accept</Trans>
          </Button>
        </InvitationCard>
      </Unauthenticated>

      <AuthLoading>
        <AuthLoadingSpinner />
      </AuthLoading>
    </>
  );
}

type InvitationCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
};

function InvitationCard({ icon, title, description, children }: InvitationCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">{icon}</div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && <CardContent className="space-y-4">{children}</CardContent>}
    </Card>
  );
}

export default function AcceptInvitationPage() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<SuspenseLoadingFallback />}>
        <InvitationContent />
      </Suspense>
    </AuthPageLayout>
  );
}
