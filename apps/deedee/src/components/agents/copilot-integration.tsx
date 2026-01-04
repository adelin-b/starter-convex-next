"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import type { Doc } from "@starter-saas/backend/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Agent = Doc<"agents">;
type AgentTemplate = Doc<"agentTemplates">;

interface CopilotIntegrationProps {
  agents: Agent[] | undefined;
  templates: AgentTemplate[] | undefined;
  userId: string | null;
  createAgent: (args: {
    name: string;
    description: string;
    folderId: undefined;
    dataSchema: any;
    config: any;
    userId: string;
    updatedAt: number;
  }) => Promise<any>;
}

const TEMPLATE_MATCH_SCORE_BOOST = 3;
const CATEGORY_MATCH_SCORE_BOOST = 2;
const MAX_TEMPLATE_SUGGESTIONS = 3;

export function CopilotIntegration({
  agents,
  templates,
  userId,
  createAgent,
}: CopilotIntegrationProps) {
  const router = useRouter();

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
      "Create a new voice agent from a natural language description.",
    parameters: [
      {
        name: "description",
        type: "string",
        description: "User's description of what the agent should do",
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
        description: "Suggested template category",
        required: false,
      },
    ],
    handler: async ({ description, agentName, templateCategory }) => {
      try {
        const matchingTemplate =
          templates?.find((t) => !templateCategory || t.category === templateCategory) ||
          templates?.[0];

        if (!matchingTemplate) {
          return "No templates available. Please create a template first.";
        }

        if (!userId) {
          return "User not authenticated";
        }

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

        return `Successfully created agent "${agentName}" using the ${matchingTemplate.name} template.`;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create agent";
        toast.error(message);
        return `Error: ${message}`;
      }
    },
  });

  // AI Action: Suggest template
  useCopilotAction({
    name: "suggestTemplate",
    description: "Suggest the best agent template based on user's requirements",
    parameters: [
      {
        name: "useCase",
        type: "string",
        description: "Description of the use case",
        required: true,
      },
    ],
    handler: ({ useCase }) => {
      if (!templates || templates.length === 0) {
        return "No templates available in the system.";
      }

      const lowerCase = useCase.toLowerCase();
      const suggestions = templates
        .map((t) => {
          let score = 0;
          const desc = t.description.toLowerCase();
          const name = t.name.toLowerCase();

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
        return `No exact template matches found for "${useCase}".`;
      }

      return (
        `Found ${suggestions.length} matching template(s):\n\n` +
        suggestions
          .map(
            (s, i) =>
              `${i + 1}. **${s.template.name}** (${s.template.category})\n   ${s.template.description}`,
          )
          .join("\n\n")
      );
    },
  });

  return (
    <CopilotSidebar
      defaultOpen={false}
      instructions="You are an expert AI assistant helping users configure and manage voice AI agents."
      labels={{
        title: "Agent Assistant",
        initial: "Hi! I'm your agent configuration assistant. What would you like to do?",
      }}
    />
  );
}
