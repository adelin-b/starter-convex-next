"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams, usePathname } from "next/navigation";
import { useEffect } from "react";

type AgentBreadcrumbOverrideProps = {
  onAgentNameLoad?: (agentId: string, agentName: string) => void;
};

/**
 * Component that fetches agent data and provides the name for breadcrumb display.
 * This is used to replace the agent ID with the actual agent name in breadcrumbs.
 */
export function AgentBreadcrumbOverride({ onAgentNameLoad }: AgentBreadcrumbOverrideProps) {
  const params = useParams();
  const pathname = usePathname();

  // Check if we're on an agent page
  const isAgentPage = pathname?.includes("/dashboard/agents/") && params?.id;
  const agentId = params?.id as Id<"agents"> | undefined;

  // Fetch agent data if on agent page
  const agent = useQuery(api.agents.read, isAgentPage && agentId ? { id: agentId } : "skip");

  // Notify parent when agent name is loaded
  useEffect(() => {
    if (agent?.name && agentId && onAgentNameLoad) {
      onAgentNameLoad(agentId, agent.name);
    }
  }, [agent?.name, agentId, onAgentNameLoad]);

  // This component doesn't render anything - it just provides data
  return null;
}
