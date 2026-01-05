"use client";

import { useLingui } from "@lingui/react/macro";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { organizationStatuses } from "@starter-saas/backend/convex/schema";
import { Button } from "@starter-saas/ui/button";
import { ConfirmDialog } from "@starter-saas/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { statusMessages } from "../i18n";
import type { Organization, OrganizationStatus } from "../types";

export function useOrganizationColumns(
  onStatusChange: (id: Organization["_id"], status: OrganizationStatus) => void,
  onDelete: (id: Organization["_id"]) => void,
  deletingId: Id<"organizations"> | null,
): ColumnDef<Organization>[] {
  const { t, i18n } = useLingui();

  return useMemo(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: t`Name`,
        cell: ({ row }) => (
          <Link
            className="flex items-center gap-2 font-medium hover:underline"
            href={`/admin/organizations/${row.original._id}`}
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {row.original.name}
          </Link>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: t`Status`,
        cell: ({ row }) => (
          <Select
            key={`${row.original._id}-${row.original.status ?? "active"}`}
            onValueChange={(v) => onStatusChange(row.original._id, v as OrganizationStatus)}
            value={row.original.status ?? "active"}
          >
            <SelectTrigger className="w-[120px]" data-testid="organization-status-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {organizationStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {i18n._(statusMessages[status])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        id: "email",
        accessorKey: "email",
        header: t`Email`,
        cell: ({ row }) => row.original.email || "—",
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: t`Phone`,
        cell: ({ row }) => row.original.phone || "—",
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: t`Created`,
        cell: ({ row }) => i18n.date(row.original.createdAt),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const organizationName = row.original.name;
          return (
            <ConfirmDialog
              confirmText={t`Delete`}
              description={t`This will permanently delete ${organizationName} and remove all its members. This action cannot be undone.`}
              loading={deletingId === row.original._id}
              onConfirm={() => onDelete(row.original._id)}
              title={t`Delete Organization`}
              variant="destructive"
            >
              <Button
                aria-label={t`Delete ${organizationName}`}
                data-testid="organization-delete-button"
                size="icon"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </ConfirmDialog>
          );
        },
      },
    ],
    [t, i18n, onStatusChange, onDelete, deletingId],
  );
}
