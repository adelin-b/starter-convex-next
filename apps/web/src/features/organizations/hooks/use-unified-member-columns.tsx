"use client";

import { useLingui } from "@lingui/react/macro";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import type { OrganizationRole } from "@starter-saas/backend/convex/schema";
import { roleColors } from "@starter-saas/backend/convex/schema";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { ConfirmDialog } from "@starter-saas/ui/confirm-dialog";
import { cn } from "@starter-saas/ui/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Clock, Mail, RotateCcw, Trash2, X } from "lucide-react";
import { useMemo } from "react";
import { UserCell } from "@/features/users/@x/organizations";
import { RoleToggleCell } from "../components/role-toggle-cell";
import { memberStatusMessages, roleMessages } from "../i18n";
import type { MemberStatus, UnifiedMemberRow } from "../types";

/** Status badge variants */
const statusVariants = {
  active: "secondary",
  pending: "default",
  accepted: "secondary",
  revoked: "destructive",
  expired: "outline",
} as const satisfies Record<MemberStatus, "default" | "secondary" | "destructive" | "outline">;

type UseUnifiedMemberColumnsOptions = {
  /** Callback when roles are updated (members only) */
  onUpdateRoles?: (memberId: Id<"organizationMembers">, roles: OrganizationRole[]) => Promise<void>;
  /** Callback when member/invitation is removed */
  onRemove: (row: UnifiedMemberRow) => void;
  /** Callback when invitation is resent */
  onResend?: (invitationId: Id<"organizationInvitations">) => void;
  /** Callback when invitation is revoked */
  onRevoke?: (invitationId: Id<"organizationInvitations">) => void;
  /** Currently removing ID */
  removingId: string | null;
  /** Currently updating ID */
  updatingId?: string | null;
  /** Currently resending ID */
  resendingId?: string | null;
  /** Currently revoking ID */
  revokingId?: string | null;
  /** Whether to allow role editing */
  allowRoleEdit?: boolean;
};

export function useUnifiedMemberColumns(
  options: UseUnifiedMemberColumnsOptions,
): ColumnDef<UnifiedMemberRow>[] {
  const { t, i18n } = useLingui();
  const {
    onUpdateRoles,
    onRemove,
    onResend,
    onRevoke,
    removingId,
    updatingId,
    resendingId,
    revokingId,
    allowRoleEdit = true,
  } = options;

  return useMemo(() => {
    const columns: ColumnDef<UnifiedMemberRow>[] = [];

    // Email column - always show email
    columns.push({
      id: "email",
      accessorKey: "email",
      header: t`Email`,
      cell: ({ row }) => {
        const { email, name, image, type, userId, memberId } = row.original;

        // For members, show user cell with name/avatar
        if (type === "member" && userId) {
          const user = name ? { name, email, image } : null;
          if (memberId) {
            return <UserCell linkHref={`/admin/members/${memberId}`} user={user} userId={userId} />;
          }
          return <UserCell linkless user={user} userId={userId} />;
        }

        // For invitations, show email with icon
        return (
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
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
    });

    // Status column
    columns.push({
      id: "status",
      accessorKey: "status",
      header: t`Status`,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={statusVariants[status]}>{i18n._(memberStatusMessages[status])}</Badge>
        );
      },
      filterFn: (row, _columnId, filterValue) => row.original.status === filterValue,
    });

    // Roles column
    columns.push({
      id: "roles",
      accessorFn: (row) => row.roles.join(", "),
      header: t`Roles`,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role) => (
            <Badge key={role} variant={roleColors[role]}>
              {i18n._(roleMessages[role])}
            </Badge>
          ))}
        </div>
      ),
    });

    // Expiry column (only for pending invitations)
    columns.push({
      id: "expires",
      accessorKey: "expiresAt",
      header: t`Expires`,
      cell: ({ row }) => {
        const { type, status, expiresAt } = row.original;

        // Only show for pending invitations
        if (type !== "invitation" || status !== "pending" || !expiresAt) {
          return <span className="text-muted-foreground">{"\u2014"}</span>;
        }

        const now = Date.now();
        const diffMs = expiresAt - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isExpired = diffMs < 0;

        let className = "flex items-center gap-1";
        if (isExpired) {
          className += " text-destructive";
        } else if (diffDays <= 2) {
          className += " text-amber-600";
        }

        return (
          <span className={className}>
            <Clock className="size-3" />
            {new Intl.RelativeTimeFormat(i18n.locale, { numeric: "auto" }).format(diffDays, "day")}
          </span>
        );
      },
    });

    // Update roles column (for members only, if allowed)
    if (allowRoleEdit && onUpdateRoles) {
      columns.push({
        id: "updateRoles",
        header: t`Update Roles`,
        enableSorting: false,
        cell: ({ row }) => {
          const { type, memberId, roles, _id } = row.original;

          // Only show for members
          if (type !== "member" || !memberId) {
            return null;
          }

          return (
            <RoleToggleCell
              isUpdating={updatingId === _id}
              member={{ _id: memberId, roles }}
              onUpdateRoles={onUpdateRoles}
            />
          );
        },
      });
    }

    // Actions column
    columns.push({
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const { type, _id, status, invitationId } = row.original;

        // For members - show remove button
        if (type === "member") {
          return (
            <ConfirmDialog
              confirmText={t`Remove`}
              description={t`This will remove the member from this organization. They will lose access to organization resources.`}
              loading={removingId === _id}
              onConfirm={() => onRemove(row.original)}
              title={t`Remove Member`}
              variant="destructive"
            >
              <Button aria-label={t`Remove member`} size="icon" variant="ghost">
                <Trash2 className="size-4" />
              </Button>
            </ConfirmDialog>
          );
        }

        // For pending invitations - show resend and revoke buttons
        if (type === "invitation" && status === "pending" && invitationId) {
          return (
            <div className="flex items-center gap-1">
              {onResend && (
                <Button
                  aria-label={t`Resend invitation`}
                  disabled={resendingId === _id}
                  onClick={() => onResend(invitationId)}
                  size="icon"
                  variant="ghost"
                >
                  <RotateCcw className={cn("size-4", resendingId === _id && "animate-spin")} />
                </Button>
              )}
              {onRevoke && (
                <ConfirmDialog
                  confirmText={t`Revoke`}
                  description={t`This will invalidate the invitation. The recipient will no longer be able to join.`}
                  loading={revokingId === _id}
                  onConfirm={() => onRevoke(invitationId)}
                  title={t`Revoke Invitation`}
                  variant="destructive"
                >
                  <Button aria-label={t`Revoke invitation`} size="icon" variant="ghost">
                    <X className="size-4" />
                  </Button>
                </ConfirmDialog>
              )}
            </div>
          );
        }

        // For non-pending invitations - no actions
        return null;
      },
    });

    return columns;
  }, [
    t,
    i18n,
    onUpdateRoles,
    onRemove,
    onResend,
    onRevoke,
    removingId,
    updatingId,
    resendingId,
    revokingId,
    allowRoleEdit,
  ]);
}
