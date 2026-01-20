/* eslint-disable lingui/no-unlocalized-strings */
"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { ScrollArea } from "@starter-saas/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@starter-saas/ui/tooltip";
import { useMutation } from "convex/react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { Suggestion } from "../hooks/use-call-suggestions";

// =============================================================================
// Types
// =============================================================================

type CallSuggestionsPanelProps = {
  suggestions: Suggestion[];
  isLoading?: boolean;
  callId?: Id<"calls">;
  onSuggestionUsed?: (id: Id<"sdrLiveSuggestions">) => void;
  onSuggestionDismissed?: (id: Id<"sdrLiveSuggestions">) => void;
};

// =============================================================================
// Helper Functions
// =============================================================================

const getSuggestionIcon = (type: string) => {
  switch (type) {
    case "objection_handler":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "talking_point":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "phase_guidance":
      return <Target className="h-4 w-4 text-purple-500" />;
    case "info_extract":
      return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    default:
      return <Sparkles className="h-4 w-4 text-gray-500" />;
  }
};

const getSuggestionTypeLabel = (type: string) => {
  switch (type) {
    case "objection_handler":
      return "Objection Handler";
    case "talking_point":
      return "Talking Point";
    case "phase_guidance":
      return "Phase Guidance";
    case "info_extract":
      return "Info Extraction";
    default:
      return "Suggestion";
  }
};

const getPriorityColor = (priority: number) => {
  if (priority >= 8) {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  }
  if (priority >= 6) {
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }
  if (priority >= 4) {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
};

const getPhaseColor = (phase?: string) => {
  switch (phase) {
    case "opening":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "discovery":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "presentation":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "objection":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "closing":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

// =============================================================================
// SuggestionCard Component
// =============================================================================

type SuggestionCardProps = {
  suggestion: Suggestion;
  onUse?: () => void;
  onDismiss?: () => void;
  onRate?: (helpful: boolean) => void;
};

function SuggestionCard({ suggestion, onUse, onDismiss, onRate }: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const isUsed = suggestion.status === "used";
  const isDismissed = suggestion.status === "dismissed";

  const handleUse = useCallback(() => {
    onUse?.();
    setShowRating(true);
  }, [onUse]);

  // Parse content for better display (handle markdown-like formatting)
  const formatContent = (content: string) => {
    // Split by ** for bold sections
    const parts = content.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, partIndex) => {
      if (partIndex % 2 === 1) {
        return (
          <strong className="font-semibold text-foreground" key={`bold-${part}`}>
            {part}
          </strong>
        );
      }
      // Handle newlines
      const lines = part.split("\n");
      return lines.map((line, lineIndex) => (
        <span key={`line-${partIndex}-${line.slice(0, 20)}`}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ));
    });
  };

  const getCardClassName = () => {
    if (isUsed) {
      return "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10";
    }
    if (isDismissed) {
      return "border-gray-200 bg-gray-50/50 opacity-60 dark:border-gray-800 dark:bg-gray-900/10";
    }
    return "border-l-4 border-l-primary hover:shadow-md";
  };

  return (
    <Card className={`transition-all duration-200 ${getCardClassName()}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getSuggestionIcon(suggestion.suggestionType)}
            <CardTitle className="font-medium text-sm">{suggestion.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {!(isUsed || isDismissed) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="h-6 w-6" onClick={onDismiss} size="icon" variant="ghost">
                      <X className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Dismiss</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
              size="icon"
              variant="ghost"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`} variant="secondary">
            P{suggestion.priority}
          </Badge>
          <Badge className="text-xs" variant="outline">
            {getSuggestionTypeLabel(suggestion.suggestionType)}
          </Badge>
          {suggestion.triggerPhase && (
            <Badge
              className={`text-xs ${getPhaseColor(suggestion.triggerPhase)}`}
              variant="secondary"
            >
              {suggestion.triggerPhase}
            </Badge>
          )}
          {suggestion.objectionType && (
            <Badge
              className="bg-orange-100 text-orange-700 text-xs dark:bg-orange-900/30 dark:text-orange-400"
              variant="secondary"
            >
              {suggestion.objectionType}
            </Badge>
          )}
          {isUsed && (
            <Badge
              className="bg-green-100 text-green-700 text-xs dark:bg-green-900/30 dark:text-green-400"
              variant="secondary"
            >
              <CheckCircle className="mr-1 h-3 w-3" /> Used
            </Badge>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <CardDescription className="whitespace-pre-wrap text-sm leading-relaxed">
            {formatContent(suggestion.content)}
          </CardDescription>

          {!(isUsed || isDismissed) && (
            <div className="mt-3 flex items-center gap-2">
              <Button className="flex-1" onClick={handleUse} size="sm">
                <Zap className="mr-1 h-3 w-3" />
                Use This
              </Button>
            </div>
          )}

          {showRating && isUsed && suggestion.wasHelpful === undefined && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-muted/50 p-2">
              <span className="text-muted-foreground text-xs">Was this helpful?</span>
              <Button
                className="h-7 w-7"
                onClick={() => onRate?.(true)}
                size="icon"
                variant="ghost"
              >
                <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
              </Button>
              <Button
                className="h-7 w-7"
                onClick={() => onRate?.(false)}
                size="icon"
                variant="ghost"
              >
                <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
              </Button>
            </div>
          )}

          {isUsed && suggestion.wasHelpful !== undefined && (
            <div className="mt-3 flex items-center justify-center gap-1 text-muted-foreground text-xs">
              {suggestion.wasHelpful ? (
                <>
                  <ThumbsUp className="h-3 w-3 text-green-600" /> Marked as helpful
                </>
              ) : (
                <>
                  <ThumbsDown className="h-3 w-3 text-red-600" /> Marked as not helpful
                </>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function CallSuggestionsPanel({
  suggestions,
  isLoading = false,
  callId: _callId,
  onSuggestionUsed,
  onSuggestionDismissed,
}: CallSuggestionsPanelProps) {
  const markUsed = useMutation(api.suggestions.markUsed);
  const dismiss = useMutation(api.suggestions.dismiss);
  const rate = useMutation(api.suggestions.rate);

  // Separate pending and completed suggestions
  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const completedSuggestions = suggestions.filter((s) => s.status !== "pending");

  const handleUse = useCallback(
    async (id: Id<"sdrLiveSuggestions">) => {
      try {
        await markUsed({ id, wasHelpful: undefined });
        onSuggestionUsed?.(id);
      } catch (error) {
        console.error("Failed to mark suggestion as used:", error);
      }
    },
    [markUsed, onSuggestionUsed],
  );

  const handleDismiss = useCallback(
    async (id: Id<"sdrLiveSuggestions">) => {
      try {
        await dismiss({ id });
        onSuggestionDismissed?.(id);
      } catch (error) {
        console.error("Failed to dismiss suggestion:", error);
      }
    },
    [dismiss, onSuggestionDismissed],
  );

  const handleRate = useCallback(
    async (id: Id<"sdrLiveSuggestions">, wasHelpful: boolean) => {
      try {
        await rate({ id, wasHelpful });
      } catch (error) {
        console.error("Failed to rate suggestion:", error);
      }
    },
    [rate],
  );

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Live Suggestions
          </CardTitle>
          <CardDescription>AI-powered real-time call guidance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div className="h-24 animate-pulse rounded-lg bg-muted" key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Live Suggestions</CardTitle>
              <CardDescription className="text-xs">AI-powered real-time guidance</CardDescription>
            </div>
          </div>
          {pendingSuggestions.length > 0 && (
            <Badge className="animate-pulse" variant="default">
              {pendingSuggestions.length} new
            </Badge>
          )}
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="p-4">
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Lightbulb className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">No suggestions yet</p>
              <p className="mt-1 text-muted-foreground text-xs">
                AI will provide suggestions as the conversation progresses
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Suggestions */}
              {pendingSuggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
                    <Zap className="h-4 w-4" />
                    Active Suggestions
                  </h3>
                  {pendingSuggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion._id}
                      onDismiss={() => handleDismiss(suggestion._id)}
                      onRate={(helpful) => handleRate(suggestion._id, helpful)}
                      onUse={() => handleUse(suggestion._id)}
                      suggestion={suggestion}
                    />
                  ))}
                </div>
              )}

              {/* Completed Suggestions */}
              {completedSuggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
                    <ArrowRight className="h-4 w-4" />
                    Previous Suggestions
                  </h3>
                  {completedSuggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion._id}
                      onRate={(helpful) => handleRate(suggestion._id, helpful)}
                      suggestion={suggestion}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
