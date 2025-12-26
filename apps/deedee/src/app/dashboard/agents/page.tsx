"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
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
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

const TEMPLATE_MATCH_SCORE_BOOST = 3;
const CATEGORY_MATCH_SCORE_BOOST = 2;
const MAX_TEMPLATE_SUGGESTIONS = 3;

// Agent type from Convex generated types
type Agent = Doc<"agents">;

function AgentsContent() {
  const router = useRouter();
  const { user, userId } = useUser();

  // Only fetch agents and templates after user is created in Convex
  const agents = useQuery(api.agents.readMany, user ? {} : "skip");
  const templates = useQuery(api.agentTemplates.list, user ? { includePublic: true } : "skip");
  const createAgent = useMutation(api.agents.create);

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
              onClick={() => router.push(`/dashboard/agents/${row.original._id}`)}
              size="sm"
              variant="ghost"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => router.push(`/dashboard/agents/${row.original._id}/test`)}
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

  // Expose agent data to AI
  useCopilotReadable({
    description:
      "List of user's voice agents with their configurations, templates, and data schemas",
    value: {
      agents: agents || [],
      templates: templates || [],
      agentCount: agents?.length || 0,
    },
  });

  // AI Action: Create agent from natural language
  useCopilotAction({
    name: "createAgent",
    description:
      "Create a new voice agent from a natural language description. This will automatically select the best template and configure the agent based on the user's requirements.",
    parameters: [
      {
        name: "description",
        type: "string",
        description:
          "User's description of what the agent should do (e.g., 'Create a sales qualifier that asks about budget and timeline')",
        required: true,
      },
      {
        name: "agentName",
        type: "string",
        description: "Name for the new agent",
        required: true,
      },
      {
        name: "templateCategory",
        type: "string",
        description: "Suggested template category (sales, support, healthcare, etc.)",
        required: false,
      },
    ],
    handler: async ({ description, agentName, templateCategory }) => {
      try {
        // Find best matching template
        const matchingTemplate =
          templates?.find((t) => !templateCategory || t.category === templateCategory) ||
          templates?.[0];

        if (!matchingTemplate) {
          return "No templates available. Please create a template first.";
        }

        if (!userId) {
          return "User not authenticated";
        }

        // Create the agent from template
        const agent = await createAgent({
          name: agentName,
          description,
          folderId: undefined,
          dataSchema: matchingTemplate.dataSchema,
          config: matchingTemplate.baseConfig,
          userId,
          updatedAt: Date.now(),
        });

        toast.success(`Agent "${agentName}" created successfully!`);

        if (agent) {
          router.push(`/dashboard/agents/${agent._id}`);
        }

        return `Successfully created agent "${agentName}" using the ${matchingTemplate.name} template. Navigate to the agent page to customize further.`;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create agent";
        toast.error(message);
        return `Error: ${message}`;
      }
    },
  });

  // AI Action: Suggest template based on description
  useCopilotAction({
    name: "suggestTemplate",
    description:
      "Suggest the best agent template based on user's requirements or use case description",
    parameters: [
      {
        name: "useCase",
        type: "string",
        description: "Description of the use case or what the agent should accomplish",
        required: true,
      },
    ],
    handler: ({ useCase }) => {
      if (!templates || templates.length === 0) {
        return "No templates available in the system.";
      }

      // Simple keyword matching (in production, use embeddings/semantic search)
      const lowerCase = useCase.toLowerCase();
      const suggestions = templates
        .map((t) => {
          let score = 0;
          const desc = t.description.toLowerCase();
          const name = t.name.toLowerCase();

          // Simple scoring based on keyword matches
          if (desc.includes(lowerCase) || name.includes(lowerCase)) {
            score += TEMPLATE_MATCH_SCORE_BOOST;
          }
          if (lowerCase.includes(t.category)) {
            score += CATEGORY_MATCH_SCORE_BOOST;
          }

          return { template: t, score };
        })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_TEMPLATE_SUGGESTIONS);

      if (suggestions.length === 0) {
        return `No exact template matches found for "${useCase}". Available categories: ${templates.map((t) => t.category).join(", ")}. You can create a custom agent from any template.`;
      }

      const response =
        `Found ${suggestions.length} matching template(s):\n\n` +
        suggestions
          .map(
            (s, i) =>
              `${i + 1}. **${s.template.name}** (${s.template.category})\n   ${s.template.description}\n   Collects ${s.template.dataSchema.fields.length} fields`,
          )
          .join("\n\n");

      return response;
    },
  });

  const agentsList = agents || [];

  if (agentsList.length === 0) {
    return (
      <CardEmptyState
        action={
          <Button onClick={() => router.push("/dashboard/agents/new")}>
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
      onRowClick={(agent) => router.push(`/dashboard/agents/${agent._id}`)}
    />
  );
}

export default function AgentsPage() {
  const router = useRouter();

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
              <Button onClick={() => router.push("/dashboard/agents/new")} size="sm">
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

      <CopilotSidebar
        defaultOpen={false}
        instructions="You are an expert AI assistant helping users configure and manage voice AI agents. You can help users:

- Create new agents from natural language descriptions
- Suggest the best template for their use case
- Explain agent configuration options
- Guide them through setting up data collection schemas
- Recommend optimal settings for STT, LLM, and TTS providers
- Troubleshoot agent configuration issues

Be concise, helpful, and proactive in suggesting actions. When creating agents, always ask for clarification if requirements are unclear."
        labels={{
          title: "Agent Assistant",
          initial:
            "Hi! I'm your agent configuration assistant. I can help you create and configure voice AI agents. What would you like to do?",
        }}
      />
    </>
  );
}
