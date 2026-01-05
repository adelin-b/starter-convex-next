"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useParams } from "next/navigation";
import { App } from "@/components/call-center/app";
import { APP_CONFIG_DEFAULTS } from "@/lib/agent/app-config";

export default function AgentTestCallPage() {
  const params = useParams();
  const agentId = params.id as Id<"agents">;

  const agent = useQuery(api.agents.read, { id: agentId });

  if (!agent) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    );
  }

  const appConfig = {
    ...APP_CONFIG_DEFAULTS,
    pageTitle: `Test Call - ${agent.name}`,
    pageDescription: agent.description || "Test your AI voice agent",
    companyName: "Your Company",
    agentName: "default-agent", // Default agent name to trigger agent dispatch
    agentId, // Pass agentId for Convex configuration loading
    supportsChatInput: true,
    supportsVideoInput: false,
    supportsScreenShare: false,
  };

  return <App appConfig={appConfig} />;
}
