import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
  LangChainAdapter,
  LangGraphAgent,
  OpenAIAdapter,
} from "@copilotkit/runtime";
import { ChatOpenAI } from "@langchain/openai";
import type { NextRequest } from "next/server";
import OpenAI from "openai";

/**
 * ============================================================================
 * DIRECT LLM MODE: LangChainAdapter / OpenAIAdapter
 * ============================================================================
 * Use when: You want simple chat functionality with a direct LLM connection
 * - No complex agent workflows
 * - No state management
 * - Quick responses from Ollama (local) or OpenAI (cloud)
 *
 * This is the FALLBACK mode when no LangGraph agent is configured.
 */
function createDirectLLMAdapter() {
  console.log("[CopilotKit API] Creating direct LLM adapter (fallback mode)...");
  console.log("[CopilotKit API] Environment check:", {
    hasOllamaUrl: !!process.env.OLLAMA_BASE_URL,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    ollamaUrl: process.env.OLLAMA_BASE_URL,
    ollamaModel: process.env.OLLAMA_MODEL,
  });

  // Option 1: Local Ollama model (no API costs, runs offline)
  if (process.env.OLLAMA_BASE_URL) {
    console.log("[CopilotKit API] Using Ollama (local LLM) via LangChainAdapter");
    const ollamaModel = new ChatOpenAI({
      model: process.env.OLLAMA_MODEL || "qwen3:8b",
      apiKey: "ollama", // Ollama doesn't need a real key but LangChain requires it
      configuration: {
        baseURL: `${process.env.OLLAMA_BASE_URL}/v1`,
      },
    });

    const adapter = new LangChainAdapter({
      chainFn: async ({ messages, tools }) => {
        try {
          console.log("[CopilotKit API] Ollama chainFn called:", {
            messageCount: messages.length,
            toolCount: tools?.length || 0,
          });
          // Note: CopilotKit uses @langchain/core v0.3, but app uses v1.0
          // BaseMessage types differ between versions but are runtime-compatible
          // Using 'any' cast since TypeScript can't recognize cross-version compatibility
          const result = await ollamaModel.bindTools(tools).stream(messages as any);
          console.log("[CopilotKit API] Ollama stream created successfully");
          return result as any;
        } catch (error) {
          console.error("[CopilotKit API] Ollama chainFn error:", error);
          throw error;
        }
      },
    });

    console.log("[CopilotKit API] ✓ Ollama LangChain adapter created (direct LLM mode)");
    return adapter;
  }

  // Option 2: OpenAI cloud API
  if (process.env.OPENAI_API_KEY) {
    console.log("[CopilotKit API] Using OpenAI (cloud LLM) via OpenAIAdapter");
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const adapter = new OpenAIAdapter({
      // Note: OpenAI SDK types are compatible at runtime but may have version mismatches
      openai: openaiClient as any,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });

    console.log("[CopilotKit API] ✓ OpenAI adapter created (direct LLM mode)");
    return adapter;
  }

  // Option 3: No LLM configured - empty adapter
  console.log("[CopilotKit API] ⚠ No LLM configured, using empty adapter");
  return new ExperimentalEmptyAdapter();
}

/**
 * ============================================================================
 * LANGGRAPH AGENT MODE: LangGraphAgent
 * ============================================================================
 * Use when: You have a complex LangGraph agent with workflows, state, tools
 * - Full agent capabilities (memory, multi-step reasoning, etc.)
 * - Runs on separate LangGraph server
 * - NO LangChainAdapter needed - LangGraph handles everything
 *
 * This is the PRIMARY mode when LANGGRAPH_DEPLOYMENT_URL is set.
 */
function createLangGraphAgent() {
  if (!process.env.LANGGRAPH_DEPLOYMENT_URL) {
    console.log(
      "[CopilotKit API] No LangGraph agent configured (LANGGRAPH_DEPLOYMENT_URL not set)",
    );
    return {};
  }

  const agentName = process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_NAME || "data-assistant";

  console.log("[CopilotKit API] Creating LangGraph agent (complex agent mode)...");
  console.log("[CopilotKit API] Agent config:", {
    agentName,
    deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL,
    hasLangSmithKey: !!process.env.LANGSMITH_API_KEY,
  });

  const agent = new LangGraphAgent({
    deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL,
    graphId: agentName,
    ...(process.env.LANGSMITH_API_KEY && {
      langsmithApiKey: process.env.LANGSMITH_API_KEY,
    }),
  });

  console.log("[CopilotKit API] ✓ LangGraph agent created (complex agent mode)");

  return {
    [agentName]: agent,
  };
}

export const POST = async (req: NextRequest) => {
  try {
    console.log("[CopilotKit API] POST request received");

    // ========================================================================
    // STEP 1: Create LangGraph Agent (if configured)
    // ========================================================================
    // This is for COMPLEX agent workflows with state, memory, multi-step reasoning
    const langGraphAgents = createLangGraphAgent();
    const hasLangGraphAgent = Object.keys(langGraphAgents).length > 0;

    // ========================================================================
    // STEP 2: Create Direct LLM Adapter (fallback)
    // ========================================================================
    // This is for SIMPLE chat when no LangGraph agent is available
    // NOTE: This adapter is IGNORED when a LangGraph agent is present!
    const directLLMAdapter = createDirectLLMAdapter();

    if (hasLangGraphAgent) {
      console.log("[CopilotKit API] 🚀 Using LangGraph agent (directLLMAdapter will be ignored)");
    } else {
      console.log("[CopilotKit API] 💬 Using direct LLM adapter (no LangGraph agent)");
    }

    // ========================================================================
    // STEP 3: Create Runtime
    // ========================================================================
    // The runtime uses EITHER the LangGraph agent OR the direct LLM adapter
    const runtime = new CopilotRuntime({
      agents: langGraphAgents, // Empty object {} if no LangGraph configured
    });

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: directLLMAdapter,
      endpoint: "/api/copilotkit",
    });

    const response = await handleRequest(req);
    console.log("[CopilotKit API] Request handled successfully");
    return response;
  } catch (error) {
    // ResponseAborted is expected when streaming completes or client disconnects
    // It's not an actual error, so we can safely ignore it
    const errorName = error?.constructor?.name;
    if (
      errorName === "ResponseAborted" ||
      (error instanceof Error && error.message.includes("ResponseAborted"))
    ) {
      console.log("[CopilotKit API] Stream completed (ResponseAborted)");
      return new Response(null, { status: 200 });
    }

    // Log actual errors
    console.error("[CopilotKit API] Error handling request:", error);
    console.error("[CopilotKit API] Error type:", errorName);
    console.error(
      "[CopilotKit API] Error message:",
      error instanceof Error ? error.message : String(error),
    );

    throw error;
  }
};
