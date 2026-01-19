"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Doc, Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Alert, AlertDescription } from "@starter-saas/ui/alert";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@starter-saas/ui/tabs";
import { getConvexErrorMessage } from "@starter-saas/ui/use-convex-form-errors";
import { useMutation } from "convex/react";
import { AlertCircle, Building2, Info, Loader2, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { PageLayout } from "@/components/layouts/page-layout";
import { AdminGuard } from "@/components/ui/auth-guard";
import { OrganizationForm } from "@/features/organizations/components/organization-form";
import { OrganizationMembersTab } from "@/features/organizations/components/organization-members-tab";
import { useQueryWithStatus } from "@/lib/convex-hooks";

/** Info Tab Content */
function InfoTabContent({
  organization,
  onSuccess,
  onError,
  error,
}: {
  organization: Doc<"organizations">;
  onSuccess: () => void;
  onError: (msg: string) => void;
  error: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="size-5" />
          <Trans>Organization Information</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>Update organization details and settings</Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <OrganizationForm onError={onError} onSuccess={onSuccess} organization={organization} />
      </CardContent>
    </Card>
  );
}

function OrganizationDetailContent({ organizationId }: { organizationId: Id<"organizations"> }) {
  const { t } = useLingui();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // Read initial tab from URL or default to "info"
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "members" ? "members" : "info");

  const { data: organization, isPending } = useQueryWithStatus(api.organizations.getById, {
    id: organizationId,
  });
  const deleteMutation = useMutation(api.organizations.remove);

  const handleDelete = async () => {
    try {
      await deleteMutation({ id: organizationId });
      router.push("/admin/organizations");
    } catch (error_) {
      setError(getConvexErrorMessage(error_, "Failed to delete organization"));
    }
  };

  // Handle organization not found
  if (organization === null) {
    return (
      <PageLayout
        description={<Trans>The organization you're looking for doesn't exist</Trans>}
        icon={AlertCircle}
        title={<Trans>Organization Not Found</Trans>}
      >
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto size-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              <Trans>The organization may have been deleted or you don't have access to it.</Trans>
            </p>
            <Button className="mt-4" render={<Link href="/admin/organizations" />}>
              <Trans>Back to Organizations</Trans>
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const isLoading = isPending;

  const deleteOrganizationName = organization?.name ?? t`this organization`;
  const deleteDescription = t`This will permanently delete ${deleteOrganizationName} and remove all its members. This action cannot be undone.`;

  return (
    <PageLayout
      actions={
        <ConfirmDialog
          confirmText={t`Delete`}
          description={deleteDescription}
          onConfirm={handleDelete}
          title={t`Delete Organization`}
          variant="destructive"
        >
          <Button data-testid="delete-organization-button" variant="destructive">
            <Trash2 className="mr-2 size-4" />
            <Trans>Delete Organization</Trans>
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
                <Link href="/admin/organizations">
                  <Trans>Organizations</Trans>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{organization?.name ?? <Trans>...</Trans>}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      description={organization?.description ?? <Trans>View and manage organization details</Trans>}
      icon={Building2}
      title={organization?.name ?? <Trans>Loading...</Trans>}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="info" onValueChange={setActiveTab} value={activeTab}>
          <TabsList>
            <TabsTrigger value="info">
              <Info className="mr-2 size-4" />
              <Trans>Info</Trans>
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="mr-2 size-4" />
              <Trans>Members</Trans>
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-6" value="info">
            <InfoTabContent
              error={activeTab === "info" ? error : null}
              onError={setError}
              onSuccess={() => setError(null)}
              organization={organization}
            />
          </TabsContent>

          <TabsContent className="mt-6" value="members">
            <OrganizationMembersTab
              error={activeTab === "members" ? error : null}
              onError={setError}
              onSuccess={() => setError(null)}
              organizationId={organizationId}
            />
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
}

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: organizationIdParam } = use(params);
  const organizationId = organizationIdParam as Id<"organizations">;

  return (
    <AdminGuard>
      <OrganizationDetailContent organizationId={organizationId} />
    </AdminGuard>
  );
}
