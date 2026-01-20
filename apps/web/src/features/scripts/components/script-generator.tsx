"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@starter-saas/ui/form";
import { Input } from "@starter-saas/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import { useMutation } from "convex/react";
import { Loader2, Sparkles, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryWithStatus } from "@/lib/convex-hooks";
import type { EditableScriptPhase, GeneratedScript } from "../types";
import { GeneratedScriptDisplay } from "./generated-script-display";
import {
  companySizeLabels,
  companySizes,
  industries,
  industryLabels,
  roleLabels,
  roles,
  type ScriptGeneratorData,
  ScriptGeneratorSchema,
  scriptLengthLabels,
  scriptLengths,
  toneLabels,
  tones,
} from "./script-generator-schema";

export function ScriptGenerator() {
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [painPointInput, setPainPointInput] = useState("");

  const { data: prospects, isPending: prospectsLoading } = useQueryWithStatus(api.prospects.list, {
    status: undefined,
    campaignId: undefined,
    organizationId: undefined,
  });

  const generateMutation = useMutation(api.scriptGenerator.generate);
  const updateMutation = useMutation(api.scriptGenerator.update);

  const form = useForm<ScriptGeneratorData>({
    resolver: zodResolver(ScriptGeneratorSchema),
    defaultValues: {
      prospectId: "",
      industry: undefined,
      role: undefined,
      painPoints: [],
      companySize: undefined,
      tone: "professional",
      scriptLength: "standard",
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const currentPainPoints = watch("painPoints") || [];

  const handleAddPainPoint = useCallback(() => {
    if (painPointInput.trim()) {
      setValue("painPoints", [...currentPainPoints, painPointInput.trim()]);
      setPainPointInput("");
    }
  }, [currentPainPoints, painPointInput, setValue]);

  const handleRemovePainPoint = useCallback(
    (pointToRemove: string) => {
      setValue(
        "painPoints",
        currentPainPoints.filter((p) => p !== pointToRemove),
      );
    },
    [currentPainPoints, setValue],
  );

  const onSubmit = async (data: ScriptGeneratorData) => {
    try {
      const result = await generateMutation({
        prospectId: data.prospectId as Id<"prospects">,
        industry: data.industry,
        role: data.role,
        painPoints: data.painPoints,
        companySize: data.companySize,
        previousInteractions: undefined,
        tone: data.tone,
        scriptLength: data.scriptLength,
      });

      setGeneratedScript({
        id: result.id,
        opening: result.opening,
        discovery: result.discovery,
        presentation: result.presentation,
        objectionHandling: result.objectionHandling,
        closing: result.closing,
        generationTime: result.generationTime,
      });

      toast.success("Script generated successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate script";
      toast.error(message);
    }
  };

  const handleScriptUpdate = useCallback(
    async (phase: EditableScriptPhase, content: string) => {
      if (!generatedScript) {
        return;
      }

      try {
        // Build the update object with the specific phase
        const updateData: Parameters<typeof updateMutation>[0] = {
          id: generatedScript.id,
          opening: phase === "opening" ? content : undefined,
          discovery: phase === "discovery" ? content : undefined,
          presentation: phase === "presentation" ? content : undefined,
          objectionHandling: phase === "objectionHandling" ? content : undefined,
          closing: phase === "closing" ? content : undefined,
          wasUsed: undefined,
          effectiveness: undefined,
        };

        await updateMutation(updateData);

        setGeneratedScript((prev) => (prev ? { ...prev, [phase]: content } : null));
      } catch (_error) {
        toast.error("Failed to save changes");
      }
    },
    [generatedScript, updateMutation],
  );

  return (
    <div className="space-y-8">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Call Script
          </CardTitle>
          <CardDescription>
            Create a personalized call script tailored to your prospect's industry, role, and pain
            points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Prospect Selection */}
              <FormField
                control={control}
                name="prospectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prospect *</FormLabel>
                    <Select
                      disabled={prospectsLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="prospect-select">
                          <SelectValue placeholder="Select a prospect" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prospects?.map(
                          (prospect: {
                            _id: string;
                            firstName?: string;
                            lastName?: string;
                            phoneNumber: string;
                            company?: string;
                          }) => (
                            <SelectItem key={prospect._id} value={prospect._id}>
                              {prospect.firstName
                                ? `${prospect.firstName} ${prospect.lastName || ""}`
                                : prospect.phoneNumber}
                              {prospect.company && ` - ${prospect.company}`}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose the prospect you're preparing to call</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Context Fields Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Industry */}
                <FormField
                  control={control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="industry-select">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industryLabels[industry]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role */}
                <FormField
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prospect Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="role-select">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {roleLabels[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company Size */}
                <FormField
                  control={control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="company-size-select">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {companySizeLabels[size]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tone */}
                <FormField
                  control={control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conversation Tone</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="tone-select">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tones.map((tone) => (
                            <SelectItem key={tone} value={tone}>
                              {toneLabels[tone]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Script Length */}
              <FormField
                control={control}
                name="scriptLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Script Length</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="script-length-select">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scriptLengths.map((length) => (
                          <SelectItem key={length} value={length}>
                            {scriptLengthLabels[length]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose how detailed the script should be</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pain Points */}
              <div className="space-y-3">
                <FormLabel>Pain Points</FormLabel>
                <div className="flex gap-2">
                  <Input
                    onChange={(e) => setPainPointInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPainPoint();
                      }
                    }}
                    placeholder="Enter a pain point..."
                    value={painPointInput}
                  />
                  <Button onClick={handleAddPainPoint} type="button" variant="secondary">
                    Add
                  </Button>
                </div>
                {currentPainPoints.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentPainPoints.map((point) => (
                      <div
                        className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                        key={point}
                      >
                        <span>{point}</span>
                        <button
                          className="ml-1 hover:text-destructive"
                          onClick={() => handleRemovePainPoint(point)}
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <FormDescription>Add specific challenges the prospect is facing</FormDescription>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                data-testid="generate-script-button"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Script
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Generated Script Display */}
      {generatedScript && (
        <div className="space-y-4">
          <h2 className="font-semibold text-xl">Generated Script</h2>
          <GeneratedScriptDisplay onUpdate={handleScriptUpdate} script={generatedScript} />
        </div>
      )}
    </div>
  );
}
