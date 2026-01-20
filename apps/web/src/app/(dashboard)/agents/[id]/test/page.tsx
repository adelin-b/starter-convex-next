/* eslint-disable lingui/no-unlocalized-strings */
"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import { ArrowLeft, Play, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { CallSuggestionsPanel } from "@/features/calls/components/call-suggestions-panel";
import type { Suggestion } from "@/features/calls/hooks/use-call-suggestions";
import { useQueryWithStatus } from "@/lib/convex-hooks";

function getSuggestionTitle(
  type: "objection_handler" | "talking_point" | "phase_guidance" | "info_extract",
): string {
  if (type === "objection_handler") {
    return "Handle objection";
  }
  if (type === "talking_point") {
    return "Key Insight";
  }
  return "Phase Guidance";
}

// Demo suggestions to showcase the feature
const createDemoSuggestions = (): Suggestion[] => [
  {
    _id: "demo-1" as Id<"sdrLiveSuggestions">,
    _creationTime: Date.now(),
    organizationId: null,
    callId: "demo-call" as Id<"calls">,
    suggestionType: "objection_handler",
    title: 'Handle: "price" objection',
    content:
      "**Recommended Response:**\nI understand budget is a concern. Let me share how our solution actually saves money in the long run...\n\n**Alternative Approaches:**\n- Offer a phased implementation\n- Highlight ROI within 6 months\n- Compare to cost of not solving the problem",
    priority: 8,
    triggerPhase: "objection",
    objectionType: "price",
    status: "pending",
    createdAt: Date.now() - 5000,
  },
  {
    _id: "demo-2" as Id<"sdrLiveSuggestions">,
    _creationTime: Date.now() - 10_000,
    organizationId: null,
    callId: "demo-call" as Id<"calls">,
    suggestionType: "phase_guidance",
    title: "Closing: assumptive close",
    content:
      '**Why Now:** Prospect has shown interest and objections have been addressed.\n\n**Script:**\n"Based on what we\'ve discussed, it sounds like the Enterprise plan would be the best fit. Shall we schedule the onboarding call for next week?"\n\n**Next Steps:** Schedule demo or onboarding',
    priority: 9,
    triggerPhase: "closing",
    status: "pending",
    createdAt: Date.now() - 10_000,
  },
  {
    _id: "demo-3" as Id<"sdrLiveSuggestions">,
    _creationTime: Date.now() - 20_000,
    organizationId: null,
    callId: "demo-call" as Id<"calls">,
    suggestionType: "talking_point",
    title: "Key Differentiator",
    content:
      "Our AI-powered analytics can reduce manual reporting time by 75%. This directly addresses their concern about team bandwidth.\n\n**Relevance:** Prospect mentioned team is overwhelmed with manual tasks",
    priority: 6,
    triggerPhase: "presentation",
    status: "used",
    wasHelpful: true,
    usedAt: Date.now() - 15_000,
    createdAt: Date.now() - 20_000,
  },
];

export default function AgentTestPage() {
  const params = useParams();
  const agentId = params.id as Id<"agents">;
  const [demoSuggestions, setDemoSuggestions] = useState<Suggestion[]>(createDemoSuggestions());
  const [showDemo, setShowDemo] = useState(true);

  const { data: agent, isPending } = useQueryWithStatus(api.agents.getById, { id: agentId });

  const handleSuggestionUsed = useCallback((id: Id<"sdrLiveSuggestions">) => {
    setDemoSuggestions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: "used" as const, usedAt: Date.now() } : s)),
    );
  }, []);

  const handleSuggestionDismissed = useCallback((id: Id<"sdrLiveSuggestions">) => {
    setDemoSuggestions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: "dismissed" as const } : s)),
    );
  }, []);

  const addDemoSuggestion = useCallback(() => {
    const types = ["objection_handler", "talking_point", "phase_guidance", "info_extract"] as const;
    const phases = ["opening", "discovery", "presentation", "objection", "closing"] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomPhase = phases[Math.floor(Math.random() * phases.length)];

    const newSuggestion: Suggestion = {
      _id: `demo-${Date.now()}` as Id<"sdrLiveSuggestions">,
      _creationTime: Date.now(),
      organizationId: null,
      callId: "demo-call" as Id<"calls">,
      suggestionType: randomType,
      title: `${getSuggestionTitle(randomType)} - Demo`,
      content: `This is a demo suggestion showing how **${randomType}** suggestions appear in real-time during calls.\n\n**Note:** In a live call, the AI analyzes the conversation and generates contextual suggestions automatically.`,
      priority: Math.floor(Math.random() * 5) + 5,
      triggerPhase: randomPhase,
      status: "pending",
      createdAt: Date.now(),
    };

    setDemoSuggestions((prev) => [newSuggestion, ...prev]);
  }, []);

  if (isPending) {
    return (
      <div className="container space-y-6 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-lg border bg-card" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container space-y-6 py-6">
        <div className="text-center">
          <h2 className="font-semibold text-xl">Agent not found</h2>
          <p className="text-muted-foreground">The agent you're looking for doesn't exist.</p>
          <Link href="/agents">
            <Button className="mt-4" variant="outline">
              Back to Agents
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-6">
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-2">
            <Link href={`/agents/${agentId}`}>
              <Button size="icon" variant="ghost">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div>
                <PageHeaderTitle>Test: {agent.name}</PageHeaderTitle>
                <PageHeaderDescription>
                  Test your {agent.type ?? "chat"} agent
                </PageHeaderDescription>
              </div>
              <Badge variant={agent.isActive !== false ? "default" : "secondary"}>
                {agent.isActive !== false ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </PageHeaderContent>
        <PageHeaderActions>
          <Link href={`/agents/${agentId}`}>
            <Button variant="outline">
              <Settings className="mr-2 size-4" />
              Configure
            </Button>
          </Link>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="size-4" />
                Test Console
              </CardTitle>
              <CardDescription>Interact with your agent in real-time</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[400px] items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Play className="mx-auto mb-4 size-12 opacity-50" />
                <p className="font-medium">Agent Testing Coming Soon</p>
                <p className="mt-1 text-sm">
                  {agent.type === "voice"
                    ? "Voice agent testing requires LiveKit integration"
                    : "Chat agent testing will be available soon"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Live Suggestions Panel - Demo Mode */}
          {showDemo && (
            <div className="relative">
              <div className="-top-2 absolute right-2 z-10">
                <Badge
                  className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                  variant="secondary"
                >
                  <Sparkles className="mr-1 size-3" />
                  Demo Mode
                </Badge>
              </div>
              <div className="h-[400px]">
                <CallSuggestionsPanel
                  onSuggestionDismissed={handleSuggestionDismissed}
                  onSuggestionUsed={handleSuggestionUsed}
                  suggestions={demoSuggestions}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <Button className="flex-1" onClick={addDemoSuggestion} size="sm" variant="outline">
                  <Sparkles className="mr-1 size-3" />
                  Add Demo Suggestion
                </Button>
                <Button
                  onClick={() => setDemoSuggestions(createDemoSuggestions())}
                  size="sm"
                  variant="ghost"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Agent Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-muted-foreground text-sm">Name</span>
                <p className="font-medium">{agent.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Type</span>
                <p className="font-medium capitalize">{agent.type ?? "chat"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Status</span>
                <p>
                  <Badge variant={agent.isActive !== false ? "default" : "secondary"}>
                    {agent.isActive !== false ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
              {agent.description && (
                <div>
                  <span className="text-muted-foreground text-sm">Description</span>
                  <p className="text-sm">{agent.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => setShowDemo(!showDemo)}
                variant={showDemo ? "default" : "outline"}
              >
                <Sparkles className="mr-2 size-4" />
                {showDemo ? "Hide" : "Show"} Live Suggestions
              </Button>
              <Link className="block" href={`/agents/${agentId}`}>
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 size-4" />
                  Edit Configuration
                </Button>
              </Link>
              <Link className="block" href="/agents">
                <Button className="w-full" variant="outline">
                  <ArrowLeft className="mr-2 size-4" />
                  Back to Agents
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
