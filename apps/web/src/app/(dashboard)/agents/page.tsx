"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Doc } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { CardEmptyState } from "@starter-saas/ui/card-empty-state";
import { DashboardMain } from "@starter-saas/ui/dashboard-layout";
import { DataTable } from "@starter-saas/ui/data-table";
import { Skeleton } from "@starter-saas/ui/skeleton";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { Bot, Pencil, Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useUser } from "@/hooks/use-user";

// CopilotKit is only enabled when agent name is configured
const COPILOT_ENABLED = !!process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_NAME;

// Lazy load CopilotKit integration to avoid hook errors when disabled
const CopilotIntegration = COPILOT_ENABLED
  ? require("@/components/agents/copilot-integration").CopilotIntegration
  : () => null;

// Agent type from Convex generated types
type Agent = Doc<"agents">;

function AgentsContent() {
  const router = useRouter();
  const { user } = useUser();

  // Only fetch agents after user is created in Convex
  const agents = useQuery(api.agents.list, user ? { type: undefined, isActive: undefined, organizationId: undefined } : "skip");

  // Define columns for DataTable
  const columns = useMemo<ColumnDef<Agent>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{row.original.name}</span>
            {row.original.description && (
              <span className="line-clamp-1 text-muted-foreground text-xs">
                {row.original.description}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "dataSchema",
        header: "Fields",
        cell: ({ row }) => {
          const fieldCount = row.original.dataSchema?.fields?.length || 0;
          return <span className="text-muted-foreground text-sm">{fieldCount} fields</span>;
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => {
          const date = row.original.updatedAt || row.original._creationTime;
          return (
            <span className="text-muted-foreground text-sm">
              {new Date(date).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              onClick={() => router.push(`/agents/${row.original._id}`)}
              size="sm"
              variant="ghost"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => router.push(`/agents/${row.original._id}/test`)}
              size="sm"
              variant="ghost"
            >
              <Play className="mr-2 h-4 w-4" />
              Test
            </Button>
          </div>
        ),
      },
    ],
    [router],
  );

  const agentsList = agents || [];

  if (agentsList.length === 0) {
    return (
      <CardEmptyState
        action={
          <Button onClick={() => router.push("/agents/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Agent
          </Button>
        }
        description="Create your first AI voice agent to start automating calls and collecting data"
        icon={Bot}
        title="No agents yet"
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={agentsList}
      onRowClick={(agent) => router.push(`/agents/${agent._id}`)}
    />
  );
}

export default function AgentsPage() {
  const router = useRouter();
  const { user, userId } = useUser();
  const agents = useQuery(api.agents.list, user ? { type: undefined, isActive: undefined, organizationId: undefined } : "skip");
  const templates = useQuery(api.agentTemplates.list, user ? { includePublic: true } : "skip");
  const createAgent = useMutation(api.agents.create);

  return (
    <>
      <DashboardMain>
        <div className="flex-1 space-y-6 p-8 pt-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-bold text-3xl tracking-tight">Agents</h1>
              <p className="text-muted-foreground">
                Manage your AI voice agents and organize them into folders
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push("/agents/new")} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            }
          >
            <AgentsContent />
          </Suspense>
        </div>
      </DashboardMain>

      {COPILOT_ENABLED && (
        <CopilotIntegration
          agents={agents}
          templates={templates}
          userId={userId}
          createAgent={createAgent}
        />
      )}
    </>
  );
}
