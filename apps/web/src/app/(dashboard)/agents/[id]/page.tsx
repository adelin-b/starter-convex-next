/* eslint-disable lingui/no-unlocalized-strings */
"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import { Switch } from "@starter-saas/ui/switch";
import { Textarea } from "@starter-saas/ui/textarea";
import { useMutation } from "convex/react";
import { ArrowLeft, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryWithStatus } from "@/lib/convex-hooks";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as Id<"agents">;

  const { data: agent, isPending } = useQueryWithStatus(api.agents.getById, { id: agentId });
  const updateAgent = useMutation(api.agents.update);
  const deleteAgent = useMutation(api.agents.remove);
  const toggleActive = useMutation(api.agents.toggleActive);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description ?? "");
    }
  }, [agent]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAgent({
        id: agentId,
        name: name.trim(),
        description: description.trim() || undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
        isActive: undefined,
        order: undefined,
      });
      toast.success("Agent updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update agent";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [updateAgent, agentId, name, description]);

  const handleToggleActive = useCallback(async () => {
    try {
      await toggleActive({ id: agentId });
      toast.success(agent?.isActive ? "Agent deactivated" : "Agent activated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to toggle agent";
      toast.error(message);
    }
  }, [toggleActive, agentId, agent?.isActive]);

  const handleDelete = useCallback(async () => {
    // biome-ignore lint/suspicious/noAlert: Temporary UX, will replace with dialog
    if (!confirm("Are you sure you want to delete this agent?")) {
      return;
    }

    try {
      await deleteAgent({ id: agentId });
      toast.success("Agent deleted");
      router.push("/agents" as Parameters<typeof router.push>[0]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete agent";
      toast.error(message);
    }
  }, [deleteAgent, agentId, router]);

  if (isPending) {
    return (
      <div className="container space-y-6 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg border bg-card" />
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
            <Link href="/agents">
              <Button size="icon" variant="ghost">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div>
                <PageHeaderTitle>{agent.name}</PageHeaderTitle>
                <PageHeaderDescription>{agent.type ?? "chat"} agent</PageHeaderDescription>
              </div>
              <Badge variant={agent.isActive !== false ? "default" : "secondary"}>
                {agent.isActive !== false ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </PageHeaderContent>
        <PageHeaderActions>
          <Link href={`/agents/${agentId}/test`}>
            <Button variant="outline">
              <Play className="mr-2 size-4" />
              Test Agent
            </Button>
          </Link>
          <Button onClick={handleDelete} variant="destructive">
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
            <CardDescription>Basic information about your agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent name"
                value={name}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this agent do?"
                rows={3}
                value={description}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-muted-foreground text-sm">Enable or disable this agent</p>
              </div>
              <Switch
                checked={agent.isActive !== false}
                id="active"
                onCheckedChange={handleToggleActive}
              />
            </div>

            <div className="flex justify-end">
              <Button disabled={isSubmitting} onClick={handleSave}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Agent configuration and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-sm">Type</Label>
                <p className="font-medium">{agent.type ?? "chat"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Fields</Label>
                <p className="font-medium">{agent.dataSchema?.fields?.length ?? 0} fields</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Created</Label>
                <p className="font-medium">{new Date(agent._creationTime).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Updated</Label>
                <p className="font-medium">
                  {new Date(agent.updatedAt ?? agent._creationTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
