"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryWithStatus } from "@/lib/convex-hooks";

// =============================================================================
// Types
// =============================================================================

export type SuggestionType =
  | "objection_handler"
  | "talking_point"
  | "phase_guidance"
  | "info_extract";
export type SuggestionStatus = "pending" | "used" | "dismissed";
export type CallPhase = "opening" | "discovery" | "presentation" | "objection" | "closing";

export type Suggestion = {
  _id: Id<"sdrLiveSuggestions">;
  _creationTime: number;
  organizationId: Id<"organizations"> | null;
  callId: Id<"calls">;
  prepId?: Id<"sdrCallPreps">;
  insightId?: Id<"vehicleInsights">;
  suggestionType: SuggestionType;
  title: string;
  content: string;
  priority: number;
  triggerPhase?: CallPhase;
  objectionType?: string;
  status: SuggestionStatus;
  wasHelpful?: boolean;
  usedAt?: number;
  createdAt: number;
};

export type LiveKitSuggestion = {
  action: "suggestion";
  suggestionType: SuggestionType;
  title: string;
  content: string;
  priority: number;
  triggerPhase?: CallPhase;
  objectionType?: string;
  timestamp: string;
};

export type UseCallSuggestionsOptions = {
  callId?: Id<"calls">;
  /**
   * Enable real-time suggestions from LiveKit data channel
   */
  enableRealTime?: boolean;
};

export type UseCallSuggestionsReturn = {
  suggestions: Suggestion[];
  pendingSuggestions: Suggestion[];
  realtimeSuggestions: LiveKitSuggestion[];
  isLoading: boolean;
  error?: Error;
  /**
   * Add a suggestion from the LiveKit data channel
   */
  addRealtimeSuggestion: (suggestion: LiveKitSuggestion) => void;
  /**
   * Clear all real-time suggestions
   */
  clearRealtimeSuggestions: () => void;
};

// =============================================================================
// Hook
// =============================================================================

export function useCallSuggestions({
  callId,
  enableRealTime = true,
}: UseCallSuggestionsOptions): UseCallSuggestionsReturn {
  // Real-time suggestions from LiveKit data channel (not yet persisted)
  const [realtimeSuggestions, setRealtimeSuggestions] = useState<LiveKitSuggestion[]>([]);

  // Fetch persisted suggestions from Convex
  const {
    data: persistedSuggestions,
    isPending,
    error,
  } = useQueryWithStatus(api.suggestions.getByCallId, callId ? { callId } : "skip");

  // Convert real-time suggestions to Suggestion format for combined display
  const convertedRealtimeSuggestions: Suggestion[] = useMemo(() => {
    if (!(enableRealTime && callId)) {
      return [];
    }

    return realtimeSuggestions.map((rtSuggestion, index) => ({
      _id: `realtime-${index}` as Id<"sdrLiveSuggestions">,
      _creationTime: new Date(rtSuggestion.timestamp).getTime(),
      organizationId: null,
      callId,
      suggestionType: rtSuggestion.suggestionType,
      title: rtSuggestion.title,
      content: rtSuggestion.content,
      priority: rtSuggestion.priority,
      triggerPhase: rtSuggestion.triggerPhase,
      objectionType: rtSuggestion.objectionType,
      status: "pending" as SuggestionStatus,
      createdAt: new Date(rtSuggestion.timestamp).getTime(),
    }));
  }, [realtimeSuggestions, enableRealTime, callId]);

  // Combine persisted and real-time suggestions
  // Filter out real-time suggestions that have been persisted
  const suggestions: Suggestion[] = useMemo(() => {
    const persisted = persistedSuggestions ?? [];

    // If we have persisted suggestions, filter out real-time ones that match
    const persistedTitles = new Set(persisted.map((s: Suggestion) => s.title));
    const uniqueRealtime = convertedRealtimeSuggestions.filter(
      (rt) => !persistedTitles.has(rt.title),
    );

    // Combine and sort by priority (descending) then creation time (descending)
    return [...uniqueRealtime, ...persisted].sort((a, b) => {
      // Pending suggestions first
      if (a.status === "pending" && b.status !== "pending") {
        return -1;
      }
      if (a.status !== "pending" && b.status === "pending") {
        return 1;
      }

      // Then by priority
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }

      // Then by creation time
      return b.createdAt - a.createdAt;
    });
  }, [persistedSuggestions, convertedRealtimeSuggestions]);

  // Filter for pending suggestions only
  const pendingSuggestions = useMemo(
    () => suggestions.filter((s) => s.status === "pending"),
    [suggestions],
  );

  // Add a real-time suggestion
  const addRealtimeSuggestion = useCallback((suggestion: LiveKitSuggestion) => {
    setRealtimeSuggestions((prev) => {
      // Check for duplicates by title
      if (prev.some((s) => s.title === suggestion.title)) {
        return prev;
      }
      return [suggestion, ...prev];
    });
  }, []);

  // Clear all real-time suggestions
  const clearRealtimeSuggestions = useCallback(() => {
    setRealtimeSuggestions([]);
  }, []);

  // Clean up when callId changes
  useEffect(() => {
    if (!callId) {
      setRealtimeSuggestions([]);
    }
  }, [callId]);

  return {
    suggestions,
    pendingSuggestions,
    realtimeSuggestions,
    isLoading: isPending,
    error: error as Error | undefined,
    addRealtimeSuggestion,
    clearRealtimeSuggestions,
  };
}
