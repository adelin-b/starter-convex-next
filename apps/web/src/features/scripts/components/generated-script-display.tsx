"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { api } from "@starter-saas/backend/convex/_generated/api";
import { Button } from "@starter-saas/ui/button";
import { useMutation } from "convex/react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  MessageSquare,
  Phone,
  Presentation,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { EditableScriptPhase, GeneratedScript } from "../types";
import { ScriptPhaseCard } from "./script-phase-card";

type GeneratedScriptDisplayProps = {
  script: GeneratedScript;
  onUpdate?: (phase: EditableScriptPhase, content: string) => void;
};

export function GeneratedScriptDisplay({ script, onUpdate }: GeneratedScriptDisplayProps) {
  const [rated, setRated] = useState<"effective" | "neutral" | "ineffective" | null>(null);

  const markAsUsed = useMutation(api.scriptGenerator.markAsUsed);
  const rateEffectiveness = useMutation(api.scriptGenerator.rateEffectiveness);

  const handleMarkAsUsed = useCallback(async () => {
    try {
      await markAsUsed({ id: script.id });
      toast.success("Script marked as used");
    } catch (_error) {
      toast.error("Failed to mark script as used");
    }
  }, [markAsUsed, script.id]);

  const handleRate = useCallback(
    async (effectiveness: "effective" | "neutral" | "ineffective") => {
      try {
        await rateEffectiveness({ id: script.id, effectiveness });
        setRated(effectiveness);
        toast.success("Thank you for your feedback!");
      } catch (_error) {
        toast.error("Failed to submit rating");
      }
    },
    [rateEffectiveness, script.id],
  );

  const phases = [
    {
      key: "opening" as const,
      title: "Opening Hook",
      description: "Start the conversation with a personalized introduction",
      content: script.opening,
      icon: <Phone className="h-5 w-5 text-blue-500" />,
      colorClass: "border-l-4 border-l-blue-500",
    },
    {
      key: "discovery" as const,
      title: "Discovery Questions",
      description: "Uncover pain points and understand prospect needs",
      content: script.discovery,
      icon: <HelpCircle className="h-5 w-5 text-purple-500" />,
      colorClass: "border-l-4 border-l-purple-500",
    },
    {
      key: "presentation" as const,
      title: "Value Presentation",
      description: "Present your solution and key benefits",
      content: script.presentation,
      icon: <Presentation className="h-5 w-5 text-green-500" />,
      colorClass: "border-l-4 border-l-green-500",
    },
    {
      key: "objectionHandling" as const,
      title: "Objection Handling",
      description: "Address common concerns and pushback",
      content: script.objectionHandling,
      icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
      colorClass: "border-l-4 border-l-orange-500",
    },
    {
      key: "closing" as const,
      title: "Closing Strategies",
      description: "Secure next steps and commitments",
      content: script.closing,
      icon: <MessageSquare className="h-5 w-5 text-red-500" />,
      colorClass: "border-l-4 border-l-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Script Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="h-4 w-4" />
          <span>Generated in {script.generationTime ? `${script.generationTime}ms` : "N/A"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleMarkAsUsed} size="sm" variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Used
          </Button>
          <div className="flex items-center gap-1 border-l pl-2">
            <span className="mr-2 text-muted-foreground text-sm">Rate:</span>
            <Button
              className={rated === "effective" ? "bg-green-100 text-green-700" : ""}
              onClick={() => handleRate("effective")}
              size="icon"
              variant="ghost"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              className={rated === "ineffective" ? "bg-red-100 text-red-700" : ""}
              onClick={() => handleRate("ineffective")}
              size="icon"
              variant="ghost"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Script Phases */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <ScriptPhaseCard
            colorClass={phase.colorClass}
            content={phase.content}
            description={phase.description}
            icon={phase.icon}
            isEditable={!!onUpdate}
            key={phase.key}
            onContentChange={(content) => onUpdate?.(phase.key, content)}
            title={phase.title}
          />
        ))}
      </div>
    </div>
  );
}
