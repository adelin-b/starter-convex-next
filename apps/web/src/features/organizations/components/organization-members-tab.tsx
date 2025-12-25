"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import type { InvitationStatus, OrganizationRole } from "@starter-saas/backend/convex/schema";
import { Alert, AlertDescription } from "@starter-saas/ui/alert";
import { DataTable } from "@starter-saas/ui/data-table";
import { DEFAULT_TABLE_CONFIG, STANDARD_VIEWS } from "@starter-saas/ui/lib/table-utils";
import { getConvexErrorMessage } from "@starter-saas/ui/use-convex-form-errors";
import { useMutation } from "convex/react";
import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useQueryWithStatus } from "@/lib/convex-hooks";
import { useUnifiedMemberColumns } from "../hooks/use-unified-member-columns";
import type { UnifiedMemberRow } from "../types";
import { AddMemberDialog } from "./add-member-dialog";

/** Sort unified rows: active members first, then by creation date */
function sortUnifiedRows(a: UnifiedMemberRow, b: UnifiedMemberRow): number {
  if (a.status === "active" && b.status !== "active") {
    return -1;
  }
  if (a.status !== "active" && b.status === "active") {
    return 1;
  }
  return b.createdAt - a.createdAt;
}

/** Transform a member to a unified row */
function memberToRow(member: {
  _id: Id<"organizationMembers">;
  organizationId: Id<"organizations">;
  userId: string;
  roles: OrganizationRole[];
  createdAt: number;
  user?: { email?: string; name?: string; image?: string | null } | null;
}): UnifiedMemberRow {
  return {
    _id: member._id,
    type: "member",
    email: member.user?.email ?? "",
    name: member.user?.name ?? null,
    image: member.user?.image ?? null,
    roles: member.roles,
    status: "active",
    organizationId: member.organizationId,
    userId: member.userId,
    memberId: member._id,
    createdAt: member.createdAt,
  };
}

/** Transform an invitation to a unified row (only pending ones) */
function invitationToRow(inv: {
  _id: Id<"organizationInvitations">;
  email: string;
  roles: OrganizationRole[];
  status: InvitationStatus;
  organizationId: Id<"organizations">;
  expiresAt: number;
  createdAt: number;
  inviter?: { name: string; email: string; image: string | null; _id: string } | null;
}): UnifiedMemberRow | null {
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
    status: inv.status,
    organizationId: inv.organizationId,
    userId: null,
    invitationId: inv._id,
    expiresAt: inv.expiresAt,
    invitedBy: inv.inviter,
    createdAt: inv.createdAt,
  };
}

type OrganizationMembersTabProps = {
  organizationId: Id<"organizations">;
  onSuccess: () => void;
  onError: (msg: string) => void;
  error: string | null;
};

export function OrganizationMembersTab({
  organizationId,
  onSuccess,
  onError,
  error,
}: OrganizationMembersTabProps) {
  const { t } = useLingui();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Fetch both members and invitations
  const { data: members, isPending: membersPending } = useQueryWithStatus(
    api.organizations.getOrganizationMembers,
    {
      organizationId,
    },
  );
  const { data: invitations, isPending: invitationsPending } = useQueryWithStatus(
    api.invitations.getByOrganization,
    {
      organizationId,
    },
  );

  const updateRolesMutation = useMutation(api.organizations.updateMemberRoles);
  const removeMemberMutation = useMutation(api.organizations.removeMember);
  const resendMutation = useMutation(api.invitations.resend);
  const revokeMutation = useMutation(api.invitations.revoke);

  // Transform members and invitations into unified rows
  const unifiedData = useMemo((): UnifiedMemberRow[] => {
    const memberRows = members?.map(memberToRow) ?? [];
    const invitationRows =
      invitations
        ?.map(invitationToRow)
        .filter((row: UnifiedMemberRow | null): row is UnifiedMemberRow => row !== null) ?? [];
    return [...memberRows, ...invitationRows].sort(sortUnifiedRows);
  }, [members, invitations]);

  const handleUpdateRoles = async (
    memberId: Id<"organizationMembers">,
    roles: OrganizationRole[],
  ) => {
    setUpdatingId(memberId);
    try {
      await updateRolesMutation({ memberId, roles });
      onSuccess();
    } catch (error_) {
      onError(getConvexErrorMessage(error_, "Failed to update roles"));
      throw error_;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (row: UnifiedMemberRow) => {
    if (row.type === "member" && row.memberId) {
      setRemovingId(row._id);
      try {
        await removeMemberMutation({ memberId: row.memberId });
        onSuccess();
      } catch (error_) {
        onError(getConvexErrorMessage(error_, "Failed to remove member"));
      } finally {
        setRemovingId(null);
      }
    }
  };

  const handleResend = async (invitationId: Id<"organizationInvitations">) => {
    setResendingId(invitationId);
    try {
      await resendMutation({ invitationId });
      onSuccess();
    } catch (error_) {
      onError(getConvexErrorMessage(error_, "Failed to resend invitation"));
    } finally {
      setResendingId(null);
    }
  };

  const handleRevoke = async (invitationId: Id<"organizationInvitations">) => {
    setRevokingId(invitationId);
    try {
      await revokeMutation({ invitationId });
      onSuccess();
    } catch (error_) {
      onError(getConvexErrorMessage(error_, "Failed to revoke invitation"));
    } finally {
      setRevokingId(null);
    }
  };

  const columns = useUnifiedMemberColumns({
    onUpdateRoles: handleUpdateRoles,
    onRemove: handleRemove,
    onResend: handleResend,
    onRevoke: handleRevoke,
    removingId,
    updatingId,
    resendingId,
    revokingId,
    allowRoleEdit: true,
  });

  const isLoading = membersPending || invitationsPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            <Trans>Organization Members</Trans>
          </h3>
          <p className="text-muted-foreground text-sm">
            <Trans>Manage members and their roles</Trans>
          </p>
        </div>
        <AddMemberDialog onError={onError} onSuccess={onSuccess} organizationId={organizationId} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DataTable
        {...DEFAULT_TABLE_CONFIG}
        columns={columns}
        data={unifiedData}
        emptyStateMessage={t`No members or pending invitations.`}
        enabledViews={STANDARD_VIEWS}
        isLoading={isLoading}
        labels={{ loading: t`Loading...` }}
        searchPlaceholder={t`Search by email or name...`}
      />
    </div>
  );
}
