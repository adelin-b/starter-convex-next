"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Alert, AlertDescription } from "@starter-saas/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@starter-saas/ui/breadcrumb";
import { DataTable } from "@starter-saas/ui/data-table";
import { DEFAULT_TABLE_CONFIG, STANDARD_VIEWS } from "@starter-saas/ui/lib/table-utils";
import { getConvexErrorMessage } from "@starter-saas/ui/use-convex-form-errors";
import { useMutation } from "convex/react";
import { AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageLayout } from "@/components/layouts/page-layout";
import { AdminGuard } from "@/components/ui/auth-guard";
import { CreateOrganizationDialog } from "@/features/organizations/components/create-organization-dialog";
import { useOrganizationColumns } from "@/features/organizations/hooks/use-organization-columns";
import type { Organization, OrganizationStatus } from "@/features/organizations/types";
import { useQueryWithStatus } from "@/lib/convex-hooks";

function OrganizationsContent() {
  const { t } = useLingui();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"organizations"> | null>(null);
  const { data: organizations, isPending } = useQueryWithStatus(api.organizations.getAll, {});
  const deleteMutation = useMutation(api.organizations.remove);
  const updateStatusMutation = useMutation(api.organizations.updateStatus);

  const handleRowClick = (organization: Organization) => {
    router.push(`/admin/organizations/${organization._id}`);
  };

  const handleStatusChange = async (id: Organization["_id"], status: OrganizationStatus) => {
    setError(null);
    try {
      await updateStatusMutation({ id, status });
    } catch (error_) {
      setError(getConvexErrorMessage(error_, "Failed to update organization status"));
    }
  };

  const handleDelete = async (id: Organization["_id"]) => {
    setError(null);
    setDeletingId(id);
    try {
      await deleteMutation({ id });
    } catch (error_) {
      setError(getConvexErrorMessage(error_, "Failed to delete organization"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useOrganizationColumns(handleStatusChange, handleDelete, deletingId);
  const isLoading = isPending;

  return (
    <PageLayout
      actions={<CreateOrganizationDialog onError={setError} onSuccess={() => setError(null)} />}
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
                <Trans>Organizations</Trans>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      description={<Trans>Manage your organizations and their settings</Trans>}
      icon={Building2}
      title={<Trans>Organizations</Trans>}
    >
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <DataTable
        {...DEFAULT_TABLE_CONFIG}
        columns={columns}
        data={organizations ?? []}
        emptyStateMessage={t`No organizations found.`}
        enabledViews={STANDARD_VIEWS}
        isLoading={isLoading}
        labels={{ loading: t`Loading...` }}
        onRowClick={handleRowClick}
        searchPlaceholder={t`Search organizations...`}
      />
    </PageLayout>
  );
}

export default function OrganizationsPage() {
  return (
    <AdminGuard>
      <OrganizationsContent />
    </AdminGuard>
  );
}
