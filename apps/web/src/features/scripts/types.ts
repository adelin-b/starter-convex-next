import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";

/**
 * Represents a generated call script with all phases
 */
export type GeneratedScript = {
  id: Id<"aiGeneratedScripts">;
  opening: string;
  discovery: string;
  presentation: string;
  objectionHandling: string;
  closing: string;
  generationTime?: number;
};

/**
 * Script phases that can be edited (excludes id and metadata)
 */
export type EditableScriptPhase = keyof Omit<GeneratedScript, "id" | "generationTime">;
