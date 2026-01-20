"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { agentTypes } from "@starter-saas/backend/convex/schema";
import { Button } from "@starter-saas/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@starter-saas/ui/dialog";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import { Textarea } from "@starter-saas/ui/textarea";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function CreateAgentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
        setOpen(false);
        setName("");
        setDescription("");
        setType("chat");
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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Agent</DialogTitle>
            <DialogDescription>
              Create a new AI agent to automate tasks and collect data.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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

          <DialogFooter>
            <Button onClick={() => setOpen(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSubmitting || !name.trim()} type="submit">
              {isSubmitting ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
