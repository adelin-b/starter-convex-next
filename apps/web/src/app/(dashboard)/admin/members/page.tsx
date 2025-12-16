"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Doc, Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { roleColors } from "@starter-saas/backend/convex/schema";
import { Alert, AlertDescription } from "@starter-saas/ui/alert";
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
import { ConfirmDialog } from "@starter-saas/ui/confirm-dialog";
import { DataTable } from "@starter-saas/ui/data-table";
import { DEFAULT_TABLE_CONFIG, STANDARD_VIEWS } from "@starter-saas/ui/lib/table-utils";
import { getConvexErrorMessage } from "@starter-saas/ui/use-convex-form-errors";
import { cn } from "@starter-saas/ui/utils";
import { useMutation } from "convex/react";
import { AlertCircle, Building2, Clock, Mail, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/layouts/page-layout";
import { AdminGuard } from "@/components/ui/auth-guard";
import type { AuthUser, MemberStatus, UnifiedMemberRow } from "@/features/organizations/@x/admin";
import { AddMemberDialog, memberStatusMessages, roleMessages } from "@/features/organizations/@x/admin";
import { UserCell } from "@/features/users/@x/organizations";
import { useQueryWithStatus } from "@/lib/convex-hooks";
import { logError } from "@/lib/sentry";

// Type for member with organization and user data
type MemberWithOrganization = Doc<"organizationMembers"> & {
  organization: Doc<"organizations"> | null;
  user: AuthUser | null;
};

// Type for invitation with organization and inviter data
type InvitationWithDetails = Doc<"organizationInvitations"> & {
  organization: { _id: Id<"organizations">; name: string } | null;
  inviter: AuthUser | null;
};

/** Status badge variants */
const statusVariants = {
  active: "secondary",
  pending: "default",
  accepted: "secondary",
  revoked: "destructive",
  expired: "outline",
} as const satisfies Record<MemberStatus, "default" | "secondary" | "destructive" | "outline">;

/** Sort unified rows: active members first, then by organization name, then by creation date */
function sortUnifiedRowsWithOrganization(a: UnifiedMemberRow, b: UnifiedMemberRow): number {
  if (a.status === "active" && b.status !== "active") {
    return -1;
  }
  if (a.status !== "active" && b.status === "active") {
    return 1;
  }
  const organizationCompare = (a.organizationName ?? "").localeCompare(b.organizationName ?? "");
  if (organizationCompare !== 0) {
    return organizationCompare;
  }
  return b.createdAt - a.createdAt;
}

/** Transform a member with organization to a unified row */
function memberWithOrganizationToRow(member: MemberWithOrganization): UnifiedMemberRow {
  return {
    _id: member._id,
    type: "member",
    email: member.user?.email ?? "",
    name: member.user?.name ?? null,
    image: member.user?.image ?? null,
    roles: member.roles,
    status: "active",
    organizationId: member.organizationId,
    organizationName: member.organization?.name ?? null,
    userId: member.userId,
    memberId: member._id,
    createdAt: member.createdAt,
  };
}

/** Transform an invitation with organization to a unified row (only pending ones) */
function invitationWithOrganizationToRow(inv: InvitationWithDetails): UnifiedMemberRow | null {
  if (inv.status !== "pending") {
    return null;
  }
  return {
    _id: inv._id,
    type: "invitation",
    email: inv.email,
    name: null,
    image: null,
    roles: inv.roles,
    status: inv.status as "pending",
    organizationId: inv.organizationId,
    organizationName: inv.organization?.name ?? null,
    userId: null,
    invitationId: inv._id,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
  };
}

function useUnifiedMemberColumnsAdmin(
  onRemove: (memberId: Id<"organizationMembers">) => void,
  removingId: Id<"organizationMembers"> | null,
): ColumnDef<UnifiedMemberRow>[] {
  const { t, i18n } = useLingui();

  return useMemo(
    () => [
      // Organization column
      {
        id: "organization",
        accessorKey: "organizationName",
        header: t`Organization`,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {row.original.organizationName ? (
              <Link
                className="font-medium hover:underline"
                href={`/admin/organizations/${row.original.organizationId}?tab=members`}
              >
                {row.original.organizationName}
              </Link>
            ) : (
              <span className="text-muted-foreground">{"\u2014"}</span>
            )}
          </div>
        ),
        filterFn: (row, _columnId, filterValue) => {
          const organizationName = row.original.organizationName ?? "";
          return organizationName.toLowerCase().includes(filterValue.toLowerCase());
        },
      },
      // Email column
      {
        id: "email",
        accessorKey: "email",
        header: t`Email`,
        cell: ({ row }) => {
          const { email, name, image, type, userId, memberId } = row.original;

          // For members, show user cell with name/avatar
          if (type === "member" && userId) {
            const user = name ? { name, email, image } : null;
            if (memberId) {
              return (
                <UserCell linkHref={`/admin/members/${memberId}`} user={user} userId={userId} />
              );
            }
            return <UserCell linkless user={user} userId={userId} />;
          }

          // For invitations, show email with icon
          return (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{email}</span>
            </div>
          );
        },
        filterFn: (row, _columnId, filterValue) => {
          const email = row.original.email.toLowerCase();
          const name = row.original.name?.toLowerCase() ?? "";
          const filter = filterValue.toLowerCase();
          return email.includes(filter) || name.includes(filter);
        },
      },
      // Status column
      {
        id: "status",
        accessorKey: "status",
        header: t`Status`,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={statusVariants[status]}>{i18n._(memberStatusMessages[status])}</Badge>
          );
        },
      },
      // Roles column
      {
        id: "roles",
        accessorFn: (row) => row.roles.join(", "),
        header: t`Roles`,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles.map((role) => (
              <Badge key={role} variant={roleColors[role as keyof typeof roleColors]}>
                {i18n._(roleMessages[role as keyof typeof roleMessages])}
              </Badge>
            ))}
          </div>
        ),
      },
      // Expiry column (for pending invitations)
      {
        id: "expires",
        accessorKey: "expiresAt",
        header: t`Expires`,
        cell: ({ row }) => {
          const { type, status, expiresAt } = row.original;

          if (type !== "invitation" || status !== "pending" || !expiresAt) {
            return <span className="text-muted-foreground">{"\u2014"}</span>;
          }

          const now = Date.now();
          const diffMs = expiresAt - now;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const isExpired = diffMs < 0;

          return (
            <span
              className={cn(
                "flex items-center gap-1",
                isExpired && "text-destructive",
                !isExpired && diffDays <= 2 && "text-amber-600",
              )}
            >
              <Clock className="h-3 w-3" />
              {new Intl.RelativeTimeFormat(i18n.locale, { numeric: "auto" }).format(
                diffDays,
                "day",
              )}
            </span>
          );
        },
      },
      // Actions column (only for members)
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const { type, memberId, organizationName } = row.original;

          // Only show remove for members
          if (type !== "member" || !memberId) {
            return null;
          }

          const displayOrganization = organizationName ?? t`the organization`;
          return (
            <ConfirmDialog
              confirmText={t`Remove`}
              description={t`This will remove this member from ${displayOrganization}. They will lose access to organization resources.`}
              loading={removingId === memberId}
              onConfirm={() => onRemove(memberId)}
              title={t`Remove Member`}
              variant="destructive"
            >
              <Button aria-label={t`Remove member`} size="icon" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmDialog>
          );
        },
      },
    ],
    [t, i18n, onRemove, removingId],
  );
}

function MembersContent() {
  const { t } = useLingui();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<Id<"organizationMembers"> | null>(null);

  const { data: members, isPending: isMembersPending } = useQueryWithStatus(
    api.organizations.getAllMembers,
    {},
  );
  const { data: organizations } = useQueryWithStatus(api.organizations.getAll, {});
  const { data: invitations, isPending: isInvitationsPending } = useQueryWithStatus(
    api.invitations.getAll,
    {},
  );
  const removeMemberMutation = useMutation(api.organizations.removeMember);

  // Transform members and invitations into unified rows
  const unifiedData = useMemo((): UnifiedMemberRow[] => {
    const memberRows =
      (members as MemberWithOrganization[] | undefined)?.map(memberWithOrganizationToRow) ?? [];
    const invitationRows =
      (invitations as InvitationWithDetails[] | undefined)
        ?.map(invitationWithOrganizationToRow)
        .filter((row): row is UnifiedMemberRow => row !== null) ?? [];
    return [...memberRows, ...invitationRows].sort(sortUnifiedRowsWithOrganization);
  }, [members, invitations]);

  const handleRemove = async (memberId: Id<"organizationMembers">) => {
    setError(null);
    setRemovingId(memberId);
    try {
      await removeMemberMutation({ memberId });
    } catch (error_) {
      logError(error_, { feature: "admin", action: "removeMember", extra: { memberId } });
      setError(getConvexErrorMessage(error_, "Failed to remove member"));
    } finally {
      setRemovingId(null);
    }
  };

  const columns = useUnifiedMemberColumnsAdmin(handleRemove, removingId);
  const isLoading = isMembersPending || isInvitationsPending;

  return (
    <PageLayout
      actions={
        organizations && organizations.length > 0 ? (
          <AddMemberDialog
            organizations={organizations}
            onError={setError}
            onSuccess={() => setError(null)}
          />
        ) : null
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
              <BreadcrumbPage>
                <Trans>Members</Trans>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      description={<Trans>View and manage all organization members and pending invitations</Trans>}
      icon={Users}
      title={<Trans>All Members</Trans>}
    >
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable
        {...DEFAULT_TABLE_CONFIG}
        columns={columns}
        data={unifiedData}
        emptyStateMessage={t`No members or pending invitations. Add members to organizations first.`}
        enabledViews={STANDARD_VIEWS}
        isLoading={isLoading}
        labels={{ loading: t`Loading...` }}
        onRowClick={(row) => {
          if (row.type === "member" && row.memberId) {
            router.push(`/admin/members/${row.memberId}`);
          }
        }}
        searchPlaceholder={t`Search by organization, email, or name...`}
      />
    </PageLayout>
  );
}

export default function MembersPage() {
  return (
    <AdminGuard>
      <MembersContent />
    </AdminGuard>
  );
}
