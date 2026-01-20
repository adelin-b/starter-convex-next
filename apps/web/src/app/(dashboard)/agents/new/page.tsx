/* eslint-disable lingui/no-unlocalized-strings */
"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { agentTypes } from "@starter-saas/backend/convex/schema";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import { Textarea } from "@starter-saas/ui/textarea";
import { useMutation } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<(typeof agentTypes)[number]>("chat");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAgent = useMutation(api.agents.create);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        return;
      }

      setIsSubmitting(true);
      try {
        const agentId = await createAgent({
          name: name.trim(),
          description: description.trim() || undefined,
          type,
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
        });
        toast.success(`Agent "${name}" created`);
        router.push(`/agents/${agentId}` as Parameters<typeof router.push>[0]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create agent";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [createAgent, name, description, type, router],
  );

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
            <div>
              <PageHeaderTitle>Create Agent</PageHeaderTitle>
              <PageHeaderDescription>Set up a new AI agent to automate tasks</PageHeaderDescription>
            </div>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
          <CardDescription>Basic information about your agent</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Agent"
                  required
                  value={name}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this agent do?"
                  rows={3}
                  value={description}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  onValueChange={(value) => setType(value as (typeof agentTypes)[number])}
                  value={type}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Link href="/agents">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button disabled={isSubmitting || !name.trim()} type="submit">
                {isSubmitting ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
