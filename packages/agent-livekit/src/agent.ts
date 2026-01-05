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
import * as livekit from "@livekit/agents-plugin-livekit";
import * as silero from "@livekit/agents-plugin-silero";
import { BackgroundVoiceCancellation } from "@livekit/noise-cancellation-node";
import { api } from "@starter-saas/backend/convex/_generated/api.js";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel.js";
import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { z } from "zod";

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
      .replace(/\{\{agent_name\}\}/g, agentName)
      .replace(/\{\{_name\}\}/g, agentName)
      .replace(/\{\{facility_name\}\}/g, facilityName)
      .replace(/\{\{agent_description\}\}/g, agentDescription)
      // Then replace single braces
      .replace(/{agent_name}/g, agentName)
      .replace(/{_name}/g, agentName)
      .replace(/{facility_name}/g, facilityName)
      .replace(/{agent_description}/g, agentDescription)
  );
}

// Type for room metadata
type RoomMetadata = {
  agentId?: string;
};

// Type guard for room metadata
function isRoomMetadata(value: unknown): value is RoomMetadata {
  return (
    typeof value === "object" &&
    value !== null &&
    (!("agentId" in value) || typeof (value as RoomMetadata).agentId === "string")
  );
}

class Assistant extends voice.Agent {
  private readonly room?: any;

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

  constructor(config?: AgentConfig, agent?: AgentData, room?: any) {
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

You have access to tools to take notes and extract data during the conversation. Use them to:
- Add summary notes about key points discussed
- Mark action items that the user needs to do
- Extract important data fields like names, emails, dates, etc.`
      : `You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
      You eagerly assist users with their questions by providing information from your extensive knowledge.
      Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
      You are curious, friendly, and have a sense of humor.

      You have access to tools to take notes and extract data during the conversation. Use them to:
      - Add summary notes about key points discussed
      - Mark action items that the user needs to do
      - Extract important data fields like names, emails, dates, etc.`;

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
            content: z.string().describe("The note content"),
            type: z.enum(["summary", "action", "data"]).describe("Type of note").default("summary"),
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
            field: z.string().describe("The field name (e.g., 'name', 'email', 'phone')"),
            value: z.string().describe("The field value"),
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
      },
    });

    console.log("[AGENT] ✓ Super constructor completed");

    // Store room reference for sending data messages (after super())
    this.room = room;
    console.log("[AGENT] ✓ Room reference stored");
    console.log("[AGENT] ========== ASSISTANT CONSTRUCTION COMPLETE ==========");
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex agent initialization logic required for LiveKit configuration
  entry: async (ctx: JobContext) => {
    // Load agent configuration from Convex based on room metadata
    let agentConfig: AgentConfig | undefined;

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
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
      metrics.logMetrics(ev.metrics);
      usageCollector.collect(ev.metrics);
    });

    const logUsage = (): Promise<void> => {
      const summary = usageCollector.getSummary();
      console.log(`Usage: ${JSON.stringify(summary)}`);
      return Promise.resolve();
    };

    ctx.addShutdownCallback(logUsage);

    // Start the session, which initializes the voice pipeline and warms up the models
    await session.start({
      agent: new Assistant(agentConfig, agentData, ctx.room),
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
