"use client";

import {
  ArrowLeft,
  ChartBar,
  ChatCircle,
  Database,
  FloppyDisk,
  Phone,
  SpeakerHigh,
} from "@phosphor-icons/react";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@starter-saas/ui/accordion";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@starter-saas/ui/select";
import { Switch } from "@starter-saas/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@starter-saas/ui/tabs";
import { Textarea } from "@starter-saas/ui/textarea";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type SchemaField, SchemaFieldBuilder } from "@/components/agents/schema-field-builder";
import { useQueryWithStatus } from "@/utils/use-convex-query";

function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as Id<"agents">;

  const {
    data: agentData,
    error,
    isPending,
    isError,
  } = useQueryWithStatus(api.agents.read, {
    id: agentId,
  });
  const updateAgent = useMutation(api.agents.update);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state when agent loads
  useEffect(() => {
    if (agentData) {
      setName(agentData.name);
      setDescription(agentData.description || "");
      setIsActive(agentData.isActive ?? true);
      setFields(agentData.dataSchema?.fields || []);
    }
  }, [agentData]);

  const handleSave = async () => {
    if (!agentData) {
      return;
    }

    if (!name) {
      toast.error("Agent name is required");
      return;
    }

    if (fields.length === 0) {
      toast.error("Agent must have at least one field");
      return;
    }

    setIsSaving(true);
    try {
      await updateAgent({
        id: agentId,
        name,
        description: description || undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
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
        isActive,
        order: undefined,
        config: undefined,
        dataSchema: {
          ...(agentData.dataSchema || {}),
          fields,
          workflowSteps: agentData.dataSchema?.workflowSteps || [],
        },
      });

      toast.success("Agent updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update agent");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle pending state
  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-96 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <Card className="mx-auto mt-8 max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 rounded-full bg-destructive/10 p-3">
            <ArrowLeft className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="mb-2 font-semibold text-lg">Failed to load agent</h3>
          <p className="mb-4 text-center text-muted-foreground text-sm">
            {error?.message || "An unexpected error occurred"}
          </p>
          <Button asChild variant="outline">
            <Link href="/agents">Back to Agents</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle no data (shouldn't happen after success, but TypeScript safety)
  if (!agentData) {
    return null;
  }

  // Alias for cleaner code in JSX
  const agent = agentData;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild size="icon" variant="ghost">
            <Link href="/agents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">{agent.name}</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              {agent.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <SpeakerHigh className="mr-2 h-4 w-4" />
            Test Audio
          </Button>
          <Button size="sm" variant="outline">
            <ChatCircle className="mr-2 h-4 w-4" />
            Test Chat
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/agents/${agentId}/test`}>
              <Phone className="mr-2 h-4 w-4" />
              Test Call
            </Link>
          </Button>
          <Button disabled={isSaving} onClick={handleSave} size="sm">
            <FloppyDisk className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs className="w-full" defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="schema">Data Schema</TabsTrigger>
          <TabsTrigger value="data">
            <Database className="mr-2 h-4 w-4" />
            Collected Data
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <ChartBar className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-0" value="config">
          <Accordion
            className="w-full"
            defaultValue={["general", "speech", "prompt"]}
            type="multiple"
          >
            <AccordionItem value="general">
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-semibold text-base">General Settings</h3>
                  <p className="font-normal text-muted-foreground text-sm">
                    Basic agent configuration
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input id="agent-name" onChange={(e) => setName(e.target.value)} value={name} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-description">Description</Label>
                    <Textarea
                      id="agent-description"
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this agent does..."
                      rows={3}
                      value={description}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch checked={isActive} id="agent-active" onCheckedChange={setIsActive} />
                    <Label htmlFor="agent-active">Agent is active</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="prompt">
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-semibold text-base">Prompt Configuration</h3>
                  <p className="font-normal text-muted-foreground text-sm">
                    Define the agent's personality and behavior
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="personality">Personality</Label>
                    <Textarea
                      className="font-mono text-sm"
                      id="personality"
                      readOnly
                      rows={6}
                      value={agent.config?.personality || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="greeting">Greeting Message</Label>
                    <Textarea
                      className="font-mono text-sm"
                      id="greeting"
                      readOnly
                      rows={3}
                      value={agent.config?.greeting || ""}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="speech">
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-semibold text-base">Speech Settings</h3>
                  <p className="font-normal text-muted-foreground text-sm">
                    Configure STT, LLM, and TTS providers
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-6 py-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Speech-to-Text Provider</Label>
                      <Select disabled value={agent.config?.sttProvider || ""}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deepgram">Deepgram</SelectItem>
                          <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Language Model</Label>
                      <Select disabled value={agent.config?.llmModel || ""}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Text-to-Speech Voice</Label>
                    <Select disabled value={agent.config?.ttsVoice || ""}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alloy">Alloy</SelectItem>
                        <SelectItem value="echo">Echo</SelectItem>
                        <SelectItem value="fable">Fable</SelectItem>
                        <SelectItem value="onyx">Onyx</SelectItem>
                        <SelectItem value="nova">Nova</SelectItem>
                        <SelectItem value="shimmer">Shimmer</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      Currently using: {agent.config?.ttsVoice || "N/A"}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="functions">
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-semibold text-base">Functions</h3>
                  <p className="font-normal text-muted-foreground text-sm">
                    Custom functions and tools available to the agent
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-6 py-4">
                <div className="py-8 text-center text-muted-foreground">
                  <p>No custom functions configured</p>
                  <p className="mt-2 text-sm">
                    Functions allow the agent to perform actions and retrieve data
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="knowledge">
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                <div className="flex flex-col items-start gap-1">
                  <h3 className="font-semibold text-base">Knowledge Base</h3>
                  <p className="font-normal text-muted-foreground text-sm">
                    Documents and information the agent can reference
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t px-6 py-4">
                <div className="py-8 text-center text-muted-foreground">
                  <p>No knowledge base configured</p>
                  <p className="mt-2 text-sm">Upload documents to provide context to your agent</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent className="space-y-4" value="schema">
          <Card>
            <CardHeader>
              <CardTitle>Data Collection Schema</CardTitle>
              <CardDescription>
                Define the fields your agent will collect during conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaFieldBuilder fields={fields} onChange={setFields} />
            </CardContent>
          </Card>

          {agent.dataSchema?.scoringConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Scoring Configuration</CardTitle>
                <CardDescription>How collected data is evaluated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Passing Score</Label>
                  <p className="mt-2 font-bold text-2xl">
                    {agent.dataSchema?.scoringConfig.passingScore}%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Field Weights</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {Object.entries(
                      agent.dataSchema?.scoringConfig.fieldWeights as Record<string, number>,
                    ).map(([fieldName, weight]) => (
                      <div
                        className="flex items-center justify-between rounded border p-2"
                        key={fieldName}
                      >
                        <span className="text-sm">{fieldName}</span>
                        <Badge variant="secondary">{weight}/10</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent className="space-y-4" value="data">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium text-lg">No data collected yet</p>
              <p className="mb-4 text-muted-foreground text-sm">
                Data collected by this agent will appear here
              </p>
              <Button asChild>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Link href={`/agents/${agentId}/data` as any}>View Data Collection</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="analytics">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ChartBar className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium text-lg">No analytics yet</p>
              <p className="text-muted-foreground text-sm">
                Analytics will be available after data collection
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AgentDetailPage;
