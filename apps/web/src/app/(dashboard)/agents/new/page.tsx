"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkle } from "@phosphor-icons/react";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { AITextarea } from "@starter-saas/ui/ai";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { DashboardMain } from "@starter-saas/ui/dashboard-layout";
import { Field, FieldDescription, FieldError, FieldLabel } from "@starter-saas/ui/field";
import { Input } from "@starter-saas/ui/input";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import { useConvexFormErrors } from "@starter-saas/ui/use-convex-form-errors";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";
import type { Doc } from "@starter-saas/backend/convex/_generated/dataModel";

const agentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Agent name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;
type AgentTemplate = Doc<"agentTemplates">;

const SKELETON_ITEMS_COUNT = 3;
const SKELETON_COUNT = Array.from({ length: SKELETON_ITEMS_COUNT }, (_, i) => i + 1);

function NewAgentPage() {
  const router = useRouter();
  const templates = useQuery(api.agentTemplates.list, { includePublic: true });
  const createAgent = useMutation(api.agents.create);
  const [step, setStep] = useState<"template" | "configure">("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState<Id<"agentTemplates"> | null>(null);

  const selectedTemplate = templates?.find((t: AgentTemplate) => t._id === selectedTemplateId);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { handleConvexError } = useConvexFormErrors(form);

  const handleSelectTemplate = (templateId: Id<"agentTemplates">) => {
    setSelectedTemplateId(templateId);
    setStep("configure");
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Form submission with validation and routing
  const onSubmit = async (values: AgentFormValues) => {
    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    try {
      const template = templates?.find((t: AgentTemplate) => t._id === selectedTemplateId);
      if (!template) {
        throw new Error("Template not found");
      }

      const agent = await createAgent({
        name: values.name,
        description: values.description || undefined,
        type: undefined,
        organizationId: undefined,
        templateId: selectedTemplateId,
        folderId: undefined,
        dataSchema: template.dataSchema,
        config: template.baseConfig,
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

      toast.success("Agent created successfully");

      if (agent?._id) {
        router.push(`/agents/${agent._id}`);
      }
    } catch (err: unknown) {
      // Handle Convex errors with field-level validation
      if (handleConvexError(err)) {
        return;
      }

      // Fallback error handling
      toast.error(err instanceof Error ? err.message : "Failed to create agent");
    }
  };

  if (step === "configure" && selectedTemplate) {
    return (
      <DashboardMain className="max-w-2xl">
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>Configure Agent</PageHeaderTitle>
            <PageHeaderDescription>Using template: {selectedTemplate.name}</PageHeaderDescription>
          </PageHeaderContent>
          <PageHeaderActions>
            <Button
              onClick={() => {
                setStep("template");
                form.reset();
              }}
              size="sm"
              variant="outline"
            >
              Change Template
            </Button>
          </PageHeaderActions>
        </PageHeader>

        <FormProvider {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Basic Information */}
            <div className="rounded-lg border p-6">
              <h3 className="mb-1 font-medium text-sm">Basic Information</h3>
              <p className="mb-4 text-muted-foreground text-xs">
                Give your agent a name and description
              </p>

              <div className="space-y-4">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel>Agent Name</FieldLabel>
                      <Input placeholder="Sarah - Sales Qualifier" {...field} />
                      <FieldDescription>Choose a descriptive name for your agent</FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel>Description</FieldLabel>
                      <AITextarea
                        autosuggestionsConfig={{
                          textareaPurpose: `Help write a concise description for an AI agent named "${form.watch("name") || "this agent"}" using the "${selectedTemplate?.name}" template. The description should explain what the agent does and its primary use case.`,
                          chatApiConfigs: {
                            suggestionsApiConfig: {
                              maxTokens: 100,
                              stop: ["\n\n"],
                            },
                          },
                        }}
                        className="flex h-[120px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
                        disableBranding={true}
                        onValueChange={field.onChange}
                        placeholder="Qualifies inbound sales leads and schedules demos"
                        shortcut=""
                        value={field.value || ""}
                      />
                      <FieldDescription>
                        Optional description for your agent (AI-assisted)
                      </FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Schema Preview */}
            <div className="rounded-lg border p-6">
              <h3 className="mb-1 font-medium text-sm">Schema Preview</h3>
              <p className="mb-4 text-muted-foreground text-xs">
                This agent will collect the following information
              </p>

              <div className="space-y-2">
                {selectedTemplate.dataSchema.fields.map((field: { name: string; type: string; label: string; required: boolean }, index: number) => (
                  <div className="flex items-start gap-3 rounded-lg border p-3" key={index}>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{field.label}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge className="font-normal text-xs" variant="secondary">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge className="font-normal text-xs" variant="outline">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  setStep("template");
                  form.reset();
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={form.formState.isSubmitting}
                size="sm"
                type="submit"
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DashboardMain>
    );
  }

  return (
    <DashboardMain>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Create Agent</PageHeaderTitle>
          <PageHeaderDescription>Choose a template to get started</PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      {/* Templates Grid */}
      {templates ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template: AgentTemplate) => (
            <div
              className="cursor-pointer rounded-lg border p-6 transition-all hover:border-foreground/20 hover:shadow-sm"
              key={template._id}
              onClick={() => handleSelectTemplate(template._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectTemplate(template._id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  {!template.userId && <Sparkle className="h-3.5 w-3.5 text-amber-500" />}
                </div>
              </div>

              {/* Description */}
              <p className="mb-4 line-clamp-3 text-muted-foreground text-xs">
                {template.description}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="font-normal text-xs" variant="outline">
                  {template.category}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  · {template.dataSchema.fields.length} fields
                </span>
                {template.dataSchema.scoringConfig && (
                  <span className="text-muted-foreground text-xs">
                    · {template.dataSchema.scoringConfig.passingScore}% pass
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SKELETON_COUNT.map((i) => (
            <div className="animate-pulse" key={i}>
              <div className="rounded-lg border p-6">
                <div className="mb-3 h-5 w-3/4 rounded bg-muted" />
                <div className="mb-2 h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardMain>
  );
}

export default NewAgentPage;
