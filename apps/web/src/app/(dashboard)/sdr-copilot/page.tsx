"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import { useQuery } from "convex/react";
import { Phone, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { DynamicScript } from "./components/dynamic-script";
import { KnowledgePanel } from "./components/knowledge-panel";
import { PreCallBrief } from "./components/pre-call-brief";

export default function SdrCopilotPage() {
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);

  // Fetch prospects list for selector
  // TODO: Add prospects query to backend
  const prospects: Array<{
    _id: Id<"prospects">;
    firstName?: string;
    lastName?: string;
    company?: string;
    phoneNumber: string;
    status: string;
  }> = [];

  // Fetch brief when prospect selected
  const prospectBrief = useQuery(
    api.sdrCopilot.getProspectBrief,
    selectedProspectId ? { prospectId: selectedProspectId as Id<"prospects"> } : "skip",
  );

  // Fetch all approved insights
  const insights = useQuery(api.sdrCopilot.getInsights, {});

  const getProspectDisplayName = (prospect: (typeof prospects)[0]) => {
    if (prospect.firstName || prospect.lastName) {
      return `${prospect.firstName || ""} ${prospect.lastName || ""}`.trim();
    }
    return prospect.phoneNumber;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight">SDR Copilot</h1>
              <p className="text-muted-foreground text-sm">
                AI-powered call guidance and selling insights
              </p>
            </div>
          </div>

          {/* Prospect Selector */}
          <div className="flex items-center gap-3">
            <Select
              onValueChange={(value) => setSelectedProspectId(value)}
              value={selectedProspectId ?? undefined}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a prospect..." />
              </SelectTrigger>
              <SelectContent>
                {prospects.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No prospects available
                  </div>
                ) : (
                  prospects.map((prospect) => (
                    <SelectItem key={prospect._id} value={prospect._id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{getProspectDisplayName(prospect)}</span>
                        {prospect.company && (
                          <span className="text-muted-foreground">• {prospect.company}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {selectedProspectId && prospectBrief?.prospect && (
              <Button size="sm" variant="default">
                <Phone className="mr-2 h-4 w-4" />
                Start Call
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      {selectedProspectId && prospectBrief ? (
        <div className="grid h-[calc(100vh-140px)] grid-cols-12 gap-4 overflow-hidden p-4">
          {/* Left Column - Pre-call Brief */}
          <div className="col-span-3 overflow-y-auto">
            <PreCallBrief brief={prospectBrief} />
          </div>

          {/* Center Column - Dynamic Script (CORE FEATURE) */}
          <div className="col-span-6 overflow-y-auto">
            <DynamicScript
              brief={prospectBrief}
              insights={insights ?? []}
              prospectId={selectedProspectId as Id<"prospects">}
            />
          </div>

          {/* Right Column - Knowledge Panel */}
          <div className="col-span-3 overflow-y-auto">
            <KnowledgePanel insights={insights ?? []} />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
                <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle>Select a Prospect</CardTitle>
              <CardDescription>
                Choose a prospect from the dropdown above to see their brief, call script, and
                relevant selling insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">Dynamic Scripts</Badge>
                <Badge variant="secondary">Pre-call Briefs</Badge>
                <Badge variant="secondary">AI Suggestions</Badge>
                <Badge variant="secondary">Knowledge Base</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
