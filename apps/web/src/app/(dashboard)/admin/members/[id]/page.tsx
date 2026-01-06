"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Doc, Id } from "@starter-saas/backend/convex/_generated/dataModel";
import {
  OrganizationMembers,
  type OrganizationRole,
  roleColors,
} from "@starter-saas/backend/convex/schema";
import { Alert, AlertDescription } from "@starter-saas/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@starter-saas/ui/avatar";
import { Badge } from "@starter-saas/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@starter-saas/ui/breadcrumb";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { ConfirmDialog } from "@starter-saas/ui/confirm-dialog";
import { Label } from "@starter-saas/ui/label";
import {
  getConvexErrorMessage,
  useConvexFormErrors,
} from "@starter-saas/ui/use-convex-form-errors";
import { useMutation } from "convex/react";
import { AlertCircle, Building2, Loader2, Mail, Save, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { PageLayout } from "@/components/layouts/page-layout";
import { AdminGuard } from "@/components/ui/auth-guard";
import { RoleSelector, roleMessages } from "@/features/organizations/@x/admin";
import { useQueryWithStatus } from "@/lib/convex-hooks";
import { logError } from "@/lib/sentry";
import { getInitials } from "@/lib/user-utils";

// Form schema derived from OrganizationMembers backend schema
const MemberFormSchema = z.object({
  roles: OrganizationMembers.shape.roles,
});
type MemberFormData = z.infer<typeof MemberFormSchema>;

// Reusable Member Form component
function MemberRolesForm({
  member,
  onSuccess,
  onError,
}: {
  member: Doc<"organizationMembers">;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const updateRolesMutation = useMutation(api.organizations.updateMemberRoles);

  const form = useForm<MemberFormData>({
    resolver: zodResolver(MemberFormSchema),
    defaultValues: {
      roles: member.roles as OrganizationRole[],
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const { handleConvexError } = useConvexFormErrors(form);

  // Reset form when member changes
  useEffect(() => {
    reset({
      roles: member.roles as OrganizationRole[],
    });
  }, [member, reset]);

  const onSubmit = async (data: MemberFormData) => {
    try {
      await updateRolesMutation({
        memberId: member._id,
        roles: data.roles,
      });
      onSuccess();
    } catch (error) {
      if (handleConvexError(error)) {
        return;
      }
      logError(error, {
        feature: "admin",
        action: "updateMemberRoles",
        extra: { memberId: member._id },
      });
      onError(getConvexErrorMessage(error, "Failed to update roles"));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label>
          <Trans>Roles *</Trans>
        </Label>
        <Controller
          control={control}
          name="roles"
          render={({ field }) => (
            <RoleSelector onChange={field.onChange} showDescriptions value={field.value} />
          )}
        />
        {errors.roles && <p className="text-destructive text-sm">{errors.roles.message}</p>}
      </div>

      <Button
        className="w-full"
        data-testid="save-member-button"
        disabled={isSubmitting || !isDirty}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
            <Trans>Saving...</Trans>
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            <Trans>Save Roles</Trans>
          </>
        )}
      </Button>
    </form>
  );
}

function MemberDetailContent({ memberId }: { memberId: Id<"organizationMembers"> }) {
  const { t, i18n } = useLingui();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { data: member, isPending } = useQueryWithStatus(api.organizations.getMemberById, {
    memberId,
  });
  const removeMemberMutation = useMutation(api.organizations.removeMember);

  const handleRemove = async () => {
    try {
      await removeMemberMutation({ memberId });
      router.push("/admin/members");
    } catch (error_) {
      logError(error_, { feature: "admin", action: "removeMember", extra: { memberId } });
      setError(getConvexErrorMessage(error_, "Failed to remove member"));
    }
  };

  // Handle member not found
  if (member === null) {
    return (
      <PageLayout
        description={<Trans>The member you're looking for doesn't exist</Trans>}
        icon={AlertCircle}
        title={<Trans>Member Not Found</Trans>}
      >
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              <Trans>The member may have been removed or you don't have access.</Trans>
            </p>
            <Button className="mt-4" render={<Link href="/admin/members" />}>
              <Trans>Back to Members</Trans>
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const isLoading = isPending;
  const initials = getInitials(member?.user?.name);

  const removeMemberName = member?.user?.name ?? t`this member`;
  const removeOrganizationName = member?.organization?.name ?? t`the organization`;
  const removeDescription = t`This will remove ${removeMemberName} from ${removeOrganizationName}. They will lose access to organization resources.`;

  return (
    <PageLayout
      actions={
        <ConfirmDialog
          confirmText={t`Remove`}
          description={removeDescription}
          onConfirm={handleRemove}
          title={t`Remove Member`}
          variant="destructive"
        >
          <Button data-testid="remove-member-button" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            <Trans>Remove Member</Trans>
          </Button>
        </ConfirmDialog>
      }
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">
                  <Trans>Admin</Trans>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/members">
                  <Trans>Members</Trans>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{member?.user?.name ?? <Trans>...</Trans>}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      description={<Trans>View and manage member profile</Trans>}
      icon={User}
      title={member?.user?.name ?? <Trans>Loading...</Trans>}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <Trans>Profile</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                {member.user?.image && (
                  <AvatarImage alt={member.user.name} src={member.user.image} />
                )}
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <h3 className="mt-4 font-semibold text-lg">{member.user?.name ?? member.userId}</h3>
              {member.user?.email && (
                <div className="mt-1 flex items-center gap-1 text-muted-foreground text-sm">
                  <Mail className="h-4 w-4" />
                  {member.user.email}
                </div>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-1">
                {member.roles.map((role: OrganizationRole) => (
                  <Badge key={role} variant={roleColors[role]}>
                    {i18n._(roleMessages[role])}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 text-muted-foreground text-xs">
                {(() => {
                  const memberSince = new Intl.DateTimeFormat(i18n.locale).format(
                    new Date(member.createdAt),
                  );
                  return <Trans>Member since {memberSince}</Trans>;
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Organization & Roles Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <Trans>Organization Membership</Trans>
              </CardTitle>
              <CardDescription>
                <Trans>Manage organization membership and roles</Trans>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Organization Info */}
              <div className="mb-6 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    {member.organization ? (
                      <>
                        <Link
                          className="font-medium hover:underline"
                          href={`/admin/organizations/${member.organizationId}`}
                        >
                          {member.organization.name}
                        </Link>
                        <p className="text-muted-foreground text-sm">
                          {member.organization.email ?? <Trans>No email</Trans>}
                        </p>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        <Trans>Organization not found</Trans>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Roles Form */}
              <MemberRolesForm
                member={member}
                onError={setError}
                onSuccess={() => setError(null)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: memberIdParam } = use(params);
  const memberId = memberIdParam as Id<"organizationMembers">;

  return (
    <AdminGuard>
      <MemberDetailContent memberId={memberId} />
    </AdminGuard>
  );
}
