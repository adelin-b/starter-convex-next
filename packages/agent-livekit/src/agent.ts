import { fileURLToPath } from "node:url";
import {
  cli,
  defineAgent,
  type JobContext,
  type JobProcess,
  llm,
  metrics,
  voice,
  WorkerOptions,
} from "@livekit/agents";
// biome-ignore lint/performance/noNamespaceImport: Plugin uses namespace pattern
import * as livekit from "@livekit/agents-plugin-livekit";
// biome-ignore lint/performance/noNamespaceImport: Plugin uses namespace pattern
import * as silero from "@livekit/agents-plugin-silero";
import { BackgroundVoiceCancellation } from "@livekit/noise-cancellation-node";
import { api } from "@starter-saas/backend/convex/_generated/api.js";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel.js";
import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { z } from "zod";

// Suggestion types for real-time call suggestions
const suggestionTypes = [
  "objection_handler",
  "talking_point",
  "phase_guidance",
  "info_extract",
] as const;
type SuggestionType = (typeof suggestionTypes)[number];

const callPhases = ["opening", "discovery", "presentation", "objection", "closing"] as const;
type CallPhase = (typeof callPhases)[number];

dotenv.config({ path: ".env.local" });

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL;
const CONVEX_SYSTEM_ADMIN_TOKEN = process.env.CONVEX_SYSTEM_ADMIN_TOKEN;

if (!CONVEX_URL) {
  throw new Error("CONVEX_URL environment variable is required");
}
if (!CONVEX_SYSTEM_ADMIN_TOKEN) {
  throw new Error("CONVEX_SYSTEM_ADMIN_TOKEN environment variable is required");
}

const convex = new ConvexHttpClient(CONVEX_URL);

// Type for agent config from Convex
type AgentConfig = {
  sttProvider: string;
  llmModel: string;
  ttsVoice: string;
  personality: string;
  greeting: string;
  objective: string;
};

// Type for agent data from Convex
type AgentData = {
  name?: string;
  description?: string;
  config?: AgentConfig;
};

/**
 * Replace template variables in strings with actual values
 * Supports both single braces: {agent_name} and double braces: {{agent_name}}
 * Also supports: {facility_name}, {agent_description}
 */
function replaceTemplateVariables(text: string, agent?: AgentData): string {
  if (!text) {
    return text;
  }

  const agentName = agent?.name || "Assistant";
  const agentDescription = agent?.description || "";
  const facilityName = "the facility"; // Default - could be made configurable

  return (
    text
      // Replace double braces first
      .replaceAll("{{agent_name}}", agentName)
      .replaceAll("{{_name}}", agentName)
      .replaceAll("{{facility_name}}", facilityName)
      .replaceAll("{{agent_description}}", agentDescription)
      // Then replace single braces
      .replaceAll("{agent_name}", agentName)
      .replaceAll("{_name}", agentName)
      .replaceAll("{facility_name}", facilityName)
      .replaceAll("{agent_description}", agentDescription)
  );
}

// Type for room metadata
type RoomMetadata = {
  agentId?: string;
  callId?: string;
};

// Type guard for room metadata
function isRoomMetadata(value: unknown): value is RoomMetadata {
  return (
    typeof value === "object" &&
    value !== null &&
    (!("agentId" in value) || typeof (value as RoomMetadata).agentId === "string") &&
    (!("callId" in value) || typeof (value as RoomMetadata).callId === "string")
  );
}

class Assistant extends voice.Agent {
  private readonly room?: any;
  private readonly callId?: string;
  private currentPhase: CallPhase = "opening";
  private readonly detectedObjections: string[] = [];

  /**
   * Send data to frontend via LiveKit data channel
   */
  private async sendDataToFrontend(message: object): Promise<void> {
    const messageStr = JSON.stringify(message);
    console.log("[TOOL] Message to send:", messageStr);

    if (!this.room) {
      console.warn("[TOOL] ✗ No room available, cannot send data");
      return;
    }

    console.log("[TOOL] Local participant:", !!this.room.localParticipant);

    try {
      const encoded = new TextEncoder().encode(messageStr);
      await this.room.localParticipant?.publishData(encoded, { reliable: true });
      console.log("[TOOL] ✓ Data sent to frontend successfully");
    } catch (error) {
      console.error("[TOOL] ✗ Failed to send data:", error);
      throw error;
    }
  }

  /**
   * Create a suggestion and send it to the frontend
   */
  private async createSuggestion(suggestion: {
    type: SuggestionType;
    title: string;
    content: string;
    priority?: number;
    triggerPhase?: CallPhase;
    objectionType?: string;
  }): Promise<void> {
    console.log("[SUGGESTION] Creating suggestion:", suggestion.title);

    // Send to frontend via data channel for immediate display
    await this.sendDataToFrontend({
      action: "suggestion",
      suggestionType: suggestion.type,
      title: suggestion.title,
      content: suggestion.content,
      priority: suggestion.priority ?? 5,
      triggerPhase: suggestion.triggerPhase ?? this.currentPhase,
      objectionType: suggestion.objectionType,
      timestamp: new Date().toISOString(),
    });

    // Also persist to Convex if we have a callId
    if (this.callId && CONVEX_SYSTEM_ADMIN_TOKEN) {
      try {
        await convex.mutation(api.suggestions.createFromAgent, {
          callId: this.callId as Id<"calls">,
          systemToken: CONVEX_SYSTEM_ADMIN_TOKEN,
          suggestionType: suggestion.type,
          title: suggestion.title,
          content: suggestion.content,
          priority: suggestion.priority ?? 5,
          triggerPhase: suggestion.triggerPhase ?? this.currentPhase,
          objectionType: suggestion.objectionType,
        });
        console.log("[SUGGESTION] ✓ Suggestion persisted to Convex");
      } catch (error) {
        console.error("[SUGGESTION] ✗ Failed to persist suggestion:", error);
        // Don't throw - the real-time suggestion was still sent
      }
    }
  }

  constructor(config?: AgentConfig, agent?: AgentData, room?: any, callId?: string) {
    console.log("[AGENT] ========== CONSTRUCTING ASSISTANT ==========");
    console.log("[AGENT] Config provided:", !!config);
    console.log("[AGENT] Agent data provided:", !!agent);
    console.log("[AGENT] Room provided:", !!room);
    if (room) {
      console.log("[AGENT] Room details:", {
        name: room.name,
        sid: room.sid,
        state: room.state,
        hasLocalParticipant: !!room.localParticipant,
      });
    }

    const instructions = config
      ? `${replaceTemplateVariables(config.personality, agent)}

${replaceTemplateVariables(config.objective, agent)}

${config.greeting ? `Start by greeting the user: ${replaceTemplateVariables(config.greeting, agent)}` : ""}

You have access to tools to take notes, extract data, and provide real-time suggestions during the conversation. Use them to:
- Add summary notes about key points discussed
- Mark action items that the user needs to do
- Extract important data fields like names, emails, dates, etc.
- Generate helpful suggestions when you detect objections, opportunities, or key conversation moments
- Suggest closing techniques when appropriate
- Recommend script adjustments based on the conversation flow

IMPORTANT: Actively monitor the conversation for:
1. Objections - When the prospect raises concerns, immediately generate an objection handler suggestion
2. Interest signals - When the prospect shows interest, suggest appropriate closing techniques
3. Information needs - When the prospect asks questions, suggest relevant talking points
4. Phase transitions - Track the call phase (opening, discovery, presentation, objection, closing) and suggest phase-appropriate guidance`
      : `You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
      You eagerly assist users with their questions by providing information from your extensive knowledge.
      Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
      You are curious, friendly, and have a sense of humor.

      You have access to tools to take notes, extract data, and provide real-time suggestions during the conversation. Use them to:
      - Add summary notes about key points discussed
      - Mark action items that the user needs to do
      - Extract important data fields like names, emails, dates, etc.
      - Generate helpful suggestions for conversation guidance`;

    console.log("[AGENT] Instructions after template replacement:", instructions);
    console.log("[AGENT] Registering tools: addNote, updateData");

    super({
      instructions,
      tools: {
        addNote: llm.tool({
          description: `Add a note from the conversation. Use this to capture important information, summaries, or action items.

          Type guidelines:
          - "summary": General notes and key points discussed
          - "action": Action items or tasks the user needs to do
          - "data": Important facts or data points`,
          parameters: z.object({
            content: z.string().meta({ description: "The note content" }),
            type: z
              .enum(["summary", "action", "data"])
              .default("summary")
              .meta({ description: "Type of note" }),
          }),
          execute: async ({ content, type }) => {
            console.log("[TOOL] ========== ADD NOTE CALLED ==========");
            console.log(`[TOOL] Type: ${type}, Content: ${content}`);

            await this.sendDataToFrontend({
              action: "addNote",
              content,
              type,
              timestamp: new Date().toISOString(),
            });

            return `Note added: ${content}`;
          },
        }),
        updateData: llm.tool({
          description:
            "Extract and update a data field from the conversation. Use this to capture structured information like names, emails, phone numbers, addresses, etc.",
          parameters: z.object({
            field: z
              .string()
              .meta({ description: "The field name (e.g., 'name', 'email', 'phone')" }),
            value: z.string().meta({ description: "The field value" }),
          }),
          execute: async ({ field, value }) => {
            console.log("[TOOL] ========== UPDATE DATA CALLED ==========");
            console.log(`[TOOL] Field: ${field}, Value: ${value}`);

            await this.sendDataToFrontend({
              action: "updateData",
              field,
              value,
              timestamp: new Date().toISOString(),
            });

            return `Updated ${field} to ${value}`;
          },
        }),
        suggestObjectionHandler: llm.tool({
          description: `Generate a real-time suggestion for handling a prospect objection. Use this immediately when you detect the prospect raising a concern, doubt, or pushback.

          Common objections include:
          - Price/budget concerns
          - Timing issues ("not now", "busy")
          - Need to consult others ("need to check with...")
          - Already has a solution
          - Skepticism about value
          - Trust/credibility concerns`,
          parameters: z.object({
            objectionType: z.string().meta({
              description:
                "The type of objection (e.g., 'price', 'timing', 'authority', 'need', 'trust')",
            }),
            objectionText: z.string().meta({ description: "What the prospect actually said" }),
            suggestedResponse: z
              .string()
              .meta({ description: "A recommended response to handle this objection" }),
            alternativeApproaches: z
              .string()
              .optional()
              .meta({ description: "Alternative ways to address the objection" }),
          }),
          execute: async ({
            objectionType,
            objectionText,
            suggestedResponse,
            alternativeApproaches,
          }) => {
            console.log("[TOOL] ========== OBJECTION HANDLER CALLED ==========");
            console.log(`[TOOL] Objection: ${objectionType} - "${objectionText}"`);

            this.detectedObjections.push(objectionType);
            this.currentPhase = "objection";

            const content = alternativeApproaches
              ? `**Recommended Response:**\n${suggestedResponse}\n\n**Alternative Approaches:**\n${alternativeApproaches}`
              : suggestedResponse;

            await this.createSuggestion({
              type: "objection_handler",
              title: `Handle: "${objectionType}" objection`,
              content,
              priority: 8, // High priority for objections
              triggerPhase: "objection",
              objectionType,
            });

            return `Objection handler suggestion created for: ${objectionType}`;
          },
        }),
        suggestClosingTechnique: llm.tool({
          description: `Generate a suggestion for closing the conversation or moving to the next step. Use this when:
          - The prospect shows buying signals
          - You've addressed their objections
          - The conversation naturally reaches a decision point
          - It's time to propose next steps`,
          parameters: z.object({
            technique: z.string().meta({
              description:
                "The closing technique to use (e.g., 'assumptive close', 'summary close', 'urgency close', 'alternative close')",
            }),
            context: z.string().meta({ description: "Why this technique is appropriate now" }),
            suggestedScript: z.string().meta({ description: "What to say to close" }),
            nextSteps: z.string().meta({ description: "Proposed next steps if they agree" }),
          }),
          execute: async ({ technique, context, suggestedScript, nextSteps }) => {
            console.log("[TOOL] ========== CLOSING TECHNIQUE CALLED ==========");
            console.log(`[TOOL] Technique: ${technique}`);

            this.currentPhase = "closing";

            await this.createSuggestion({
              type: "phase_guidance",
              title: `Closing: ${technique}`,
              content: `**Why Now:** ${context}\n\n**Script:**\n"${suggestedScript}"\n\n**Next Steps:** ${nextSteps}`,
              priority: 9, // Highest priority for closing
              triggerPhase: "closing",
            });

            return `Closing technique suggestion created: ${technique}`;
          },
        }),
        suggestTalkingPoint: llm.tool({
          description: `Generate a suggestion for a relevant talking point. Use this to:
          - Highlight key product/service benefits
          - Share relevant information based on prospect's interests
          - Provide answers to prospect questions
          - Guide the conversation forward`,
          parameters: z.object({
            topic: z.string().meta({ description: "The topic of the talking point" }),
            content: z.string().meta({ description: "The talking point content - what to say" }),
            relevance: z
              .string()
              .meta({ description: "Why this is relevant to the current conversation" }),
          }),
          execute: async ({ topic, content, relevance }) => {
            console.log("[TOOL] ========== TALKING POINT CALLED ==========");
            console.log(`[TOOL] Topic: ${topic}`);

            await this.createSuggestion({
              type: "talking_point",
              title: topic,
              content: `${content}\n\n**Relevance:** ${relevance}`,
              priority: 6,
              triggerPhase: this.currentPhase,
            });

            return `Talking point suggestion created: ${topic}`;
          },
        }),
        updateCallPhase: llm.tool({
          description: `Update the current phase of the call. Use this to track conversation progress through:
          - opening: Initial greeting and rapport building
          - discovery: Understanding prospect needs and situation
          - presentation: Presenting solutions and value
          - objection: Handling concerns and doubts
          - closing: Moving towards commitment and next steps`,
          parameters: z.object({
            phase: z
              .enum(["opening", "discovery", "presentation", "objection", "closing"])
              .meta({ description: "The current call phase" }),
            reason: z
              .string()
              .meta({ description: "Why the conversation has moved to this phase" }),
          }),
          execute: async ({ phase, reason }) => {
            console.log("[TOOL] ========== PHASE UPDATE CALLED ==========");
            console.log(`[TOOL] New phase: ${phase}, Reason: ${reason}`);

            const previousPhase = this.currentPhase;
            this.currentPhase = phase;

            await this.createSuggestion({
              type: "phase_guidance",
              title: `Phase: ${phase.charAt(0).toUpperCase() + phase.slice(1)}`,
              content: `Conversation moved from "${previousPhase}" to "${phase}".\n\n**Reason:** ${reason}\n\n**Tips for ${phase} phase:** Focus on ${
                phase === "opening"
                  ? "building rapport and establishing trust"
                  : phase === "discovery"
                    ? "asking open-ended questions and active listening"
                    : phase === "presentation"
                      ? "demonstrating value aligned with their needs"
                      : phase === "objection"
                        ? "acknowledging concerns and providing reassurance"
                        : "creating urgency and securing commitment"
              }`,
              priority: 5,
              triggerPhase: phase,
            });

            return `Call phase updated to: ${phase}`;
          },
        }),
        suggestScriptAdjustment: llm.tool({
          description: `Suggest adjustments to the current conversation approach based on how the prospect is responding. Use this when:
          - The current approach isn't resonating
          - The prospect has unique needs requiring customization
          - You notice patterns that suggest a different strategy would work better`,
          parameters: z.object({
            observation: z
              .string()
              .meta({ description: "What you've observed about the conversation" }),
            currentApproach: z.string().meta({ description: "What approach is being used now" }),
            suggestedAdjustment: z.string().meta({ description: "How to adjust the approach" }),
            rationale: z
              .string()
              .meta({ description: "Why this adjustment would be more effective" }),
          }),
          execute: async ({ observation, currentApproach, suggestedAdjustment, rationale }) => {
            console.log("[TOOL] ========== SCRIPT ADJUSTMENT CALLED ==========");
            console.log(`[TOOL] Observation: ${observation}`);

            await this.createSuggestion({
              type: "phase_guidance",
              title: "Script Adjustment Recommended",
              content: `**Observation:** ${observation}\n\n**Current Approach:** ${currentApproach}\n\n**Suggested Adjustment:** ${suggestedAdjustment}\n\n**Why:** ${rationale}`,
              priority: 7,
              triggerPhase: this.currentPhase,
            });

            return "Script adjustment suggestion created";
          },
        }),
      },
    });

    console.log("[AGENT] ✓ Super constructor completed");

    // Store room reference for sending data messages (after super())
    this.room = room;
    this.callId = callId;
    console.log("[AGENT] ✓ Room reference stored");
    console.log("[AGENT] ✓ Call ID stored:", callId ?? "none");
    console.log("[AGENT] ========== ASSISTANT CONSTRUCTION COMPLETE ==========");
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    // Load agent configuration from Convex based on room metadata
    let agentConfig: AgentConfig | undefined;
    let callId: string | undefined;

    try {
      // Access room info from job context before connecting
      // Note: LiveKit job context types don't include room metadata, but it exists at runtime
      const room = ctx.job?.room as unknown as { metadata?: string };
      const metadata = room?.metadata;
      console.log("[AGENT] Room metadata:", metadata);

      if (metadata && metadata !== "") {
        const parsedMetadata: unknown = JSON.parse(metadata);
        console.log("[AGENT] Parsed metadata:", parsedMetadata);

        if (!isRoomMetadata(parsedMetadata)) {
          console.warn("[AGENT] Invalid metadata format");
          throw new Error("Invalid room metadata format");
        }

        const agentId = parsedMetadata.agentId;
        callId = parsedMetadata.callId;

        if (callId) {
          console.log("[AGENT] Call ID from metadata:", callId);
        }

        if (agentId) {
          console.log("[AGENT] Loading config for agent:", agentId);

          // Load agent from Convex using system admin token
          const agent = await convex.query(api.agents.getByIdForAgent, {
            id: agentId as Id<"agents">,
            systemToken: CONVEX_SYSTEM_ADMIN_TOKEN,
          });

          if (agent?.config) {
            agentConfig = agent.config;
            // Store agent data for template replacement
            ctx.proc.userData.agent = agent;
            console.log("[AGENT] Loaded config successfully:", {
              agentName: agent.name,
              sttProvider: agentConfig?.sttProvider,
              llmModel: agentConfig?.llmModel,
              ttsVoice: agentConfig?.ttsVoice,
              hasPersonality: !!agentConfig?.personality,
              hasGreeting: !!agentConfig?.greeting,
            });
          } else {
            console.warn("[AGENT] Agent not found:", agentId);
          }
        } else {
          console.log("[AGENT] No agentId in metadata, using defaults");
        }
      } else {
        console.log("[AGENT] Metadata is empty or undefined, using defaults");
      }
    } catch (error) {
      console.error("[AGENT] Error loading agent config:", error);
      console.log("[AGENT] Falling back to default configuration");
    }

    // Retrieve agent data for template replacement
    const agentData = ctx.proc.userData.agent as AgentData | undefined;

    // Build STT/LLM/TTS configuration from agent config or use defaults
    // Map database values to LiveKit format (provider/model)

    // Map STT provider - handle different provider formats
    let sttConfig = "assemblyai/universal-streaming:en";
    if (agentConfig?.sttProvider) {
      if (agentConfig.sttProvider.includes("/")) {
        sttConfig = agentConfig.sttProvider;
      } else if (agentConfig.sttProvider === "deepgram") {
        sttConfig = "deepgram/nova-2";
      } else if (agentConfig.sttProvider === "assemblyai") {
        sttConfig = "assemblyai/universal-streaming:en";
      } else {
        // Default to assemblyai with the provider name
        sttConfig = `assemblyai/${agentConfig.sttProvider}`;
      }
    }

    // Map LLM model
    let llmConfig = "openai/gpt-4o-mini";
    if (agentConfig?.llmModel) {
      if (agentConfig.llmModel.includes("/")) {
        llmConfig = agentConfig.llmModel;
      } else {
        llmConfig = `openai/${agentConfig.llmModel}`;
      }
    }

    // Map TTS voice - Use Cartesia to avoid WebSocket errors
    // OpenAI TTS causes SynthesizeStream errors, so we use Cartesia instead
    const ttsConfig = "cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc";

    console.log("[AGENT] Using configuration:", {
      stt: sttConfig,
      llm: llmConfig,
      tts: ttsConfig,
    });

    // Set up a voice AI pipeline using configuration from Convex
    const session = new voice.AgentSession({
      // Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
      // See all available models at https://docs.livekit.io/agents/models/stt/
      stt: sttConfig,

      // A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
      // See all providers at https://docs.livekit.io/agents/models/llm/
      llm: llmConfig,

      // Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
      // See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
      tts: ttsConfig,

      // VAD and turn detection are used to determine when the user is speaking and when the agent should respond
      // See more at https://docs.livekit.io/agents/build/turns
      turnDetection: new livekit.turnDetector.MultilingualModel(),
      // Note: vad is prewarmed in the prewarm function and guaranteed to exist here
      vad: ctx.proc.userData.vad as silero.VAD,
    });

    // To use a realtime model instead of a voice pipeline, use the following session setup instead.
    // (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    // 1. Install '@livekit/agents-plugin-openai'
    // 2. Set OPENAI_API_KEY in .env.local
    // 3. Add import `import * as openai from '@livekit/agents-plugin-openai'` to the top of this file
    // 4. Use the following session setup instead of the version above
    // const session = new voice.AgentSession({
    //   llm: new openai.realtime.RealtimeModel({ voice: 'marin' }),
    // });

    // Metrics collection, to measure pipeline performance
    // For more information, see https://docs.livekit.io/agents/build/metrics/
    const usageCollector = new metrics.UsageCollector();
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (event) => {
      metrics.logMetrics(event.metrics);
      usageCollector.collect(event.metrics);
    });

    const logUsage = (): Promise<void> => {
      const summary = usageCollector.getSummary();
      console.log(`Usage: ${JSON.stringify(summary)}`);
      return Promise.resolve();
    };

    ctx.addShutdownCallback(logUsage);

    // Start the session, which initializes the voice pipeline and warms up the models
    await session.start({
      agent: new Assistant(agentConfig, agentData, ctx.room, callId),
      room: ctx.room,
      inputOptions: {
        // LiveKit Cloud enhanced noise cancellation
        // - If self-hosting, omit this parameter
        // - For telephony applications, use `BackgroundVoiceCancellationTelephony` for best results
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    // Join the room and connect to the user
    await ctx.connect();
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "default-agent",
  }),
);
