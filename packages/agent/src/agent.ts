/**
 * Data Assistant Agent for AG Grid Operations
 * This agent helps with data analysis, filtering, sorting, and grid operations
 */

// Import CopilotKit helpers
import {
  CopilotKitStateAnnotation,
  convertActionsToDynamicStructuredTools,
} from "@copilotkit/sdk-js/langgraph";
import type { Action } from "@copilotkit/shared";
import { type AIMessage, SystemMessage } from "@langchain/core/messages";
import type { Runnable, RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { Annotation, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import type { FilterModel, SortModelItem } from "ag-grid-community";
import { z } from "zod";

// Data row type for grid data
type DataRow = {
  id: number;
  name: string;
  email: string;
  department: string;
  apiCalls: number;
  revenue: number;
  status: string;
  lastActive: string;
  conversionRate: string;
};

// Define our agent state with data grid context
const AgentStateAnnotation = Annotation.Root({
  gridData: Annotation<DataRow[]>,
  selectedRows: Annotation<number[]>,
  filters: Annotation<FilterModel>,
  sortModel: Annotation<SortModelItem[]>,
  ...CopilotKitStateAnnotation.spec,
});

type AgentState = typeof AgentStateAnnotation.State;

// Tool to analyze data
const analyzeData = tool(
  (args) => {
    const { column, operation } = args;
    // This would be implemented with actual data analysis
    return `Analysis complete for column ${column} with operation ${operation}. 
    Example results: Average: 45.5, Min: 10, Max: 100, Count: 50`;
  },
  {
    name: "analyzeData",
    description: "Analyze data in a specific column",
    schema: z.object({
      column: z.string().describe("The column to analyze"),
      operation: z
        .enum(["sum", "average", "min", "max", "count", "unique"])
        .describe("The analysis operation to perform"),
    }),
  },
);

// Tool to generate data insights
const generateInsights = tool(
  (args) => {
    const { dataType } = args;
    return `Key insights for ${dataType} data:
    1. Growth trend observed over the last quarter
    2. Peak usage on weekdays between 2-4 PM
    3. 80% of revenue comes from 20% of customers
    4. API usage is within normal limits`;
  },
  {
    name: "generateInsights",
    description: "Generate insights from the current data view",
    schema: z.object({
      dataType: z.string().describe("The type of data to analyze"),
    }),
  },
);

// Tool to export data
const exportData = tool(
  (args) => {
    const { format, includeFilters } = args;
    return `Data export initiated in ${format} format. 
    ${includeFilters ? "Filters applied." : "All data included."}
    Export will be downloaded shortly.`;
  },
  {
    name: "exportData",
    description: "Export grid data in various formats",
    schema: z.object({
      format: z.enum(["csv", "excel", "pdf", "json"]).describe("Export format"),
      includeFilters: z.boolean().describe("Whether to include only filtered data"),
    }),
  },
);

// Array of tools
const tools = [analyzeData, generateInsights, exportData];

// Chat node to handle conversations
async function chat_node(state: AgentState, _config: RunnableConfig) {
  // Use Ollama if configured, otherwise use OpenAI
  const model = process.env.OLLAMA_BASE_URL
    ? new ChatOpenAI({
        temperature: 0,
        model: process.env.OLLAMA_MODEL || "qwen3:8b",
        openAIApiKey: "ollama",
        configuration: {
          baseURL: `${process.env.OLLAMA_BASE_URL}/v1`,
        },
      })
    : new ChatOpenAI({ temperature: 0, model: "gpt-4o" });

  // Bind tools including CopilotKit actions
  const _copilotTools = convertActionsToDynamicStructuredTools(state.copilotkit?.actions || []);

  // Combine agent tools with CopilotKit actions
  const allTools = [...tools, ..._copilotTools];

  // Handle tool binding with proper type
  // Note: LangChain's Runnable type is compatible with ChatOpenAI but not strictly typed
  let modelWithTools: Runnable = model as unknown as Runnable;
  if ("bindTools" in model && typeof model.bindTools === "function") {
    try {
      // Bind ALL tools (agent tools + CopilotKit actions) to the model
      modelWithTools = model.bindTools(allTools) as unknown as Runnable;
    } catch {
      modelWithTools = model as unknown as Runnable;
    }
  }

  // System message with context about the data grid
  const systemMessage = new SystemMessage({
    content: `You are a helpful data analysis assistant integrated with AG Grid. 
    You can help users analyze data, create filters, sort columns, export data, and provide insights.
    Current grid state:
    - Total rows: ${state.gridData?.length || 0}
    - Selected rows: ${state.selectedRows?.length || 0}
    - Active filters: ${Object.keys(state.filters || {}).length}
    Speak in a friendly, professional tone.`,
  });

  const response = await modelWithTools.invoke([systemMessage, ...state.messages]);

  return {
    messages: response,
  };
}

// Determine whether to continue or end
function shouldContinue({ messages, copilotkit }: AgentState) {
  // Cast to AIMessage to access tool_calls property
  // Note: CJS/ESM module resolution creates incompatible BaseMessage types, but runtime behavior is correct
  const lastMessage = messages.at(-1) as unknown as AIMessage;

  // If the LLM makes a tool call, then we route to the "tool_node"
  if (lastMessage.tool_calls?.length) {
    const actions = copilotkit?.actions;
    const toolCallName = lastMessage.tool_calls[0]?.name;

    // Only route to tool node if it's not a CopilotKit action
    if (!actions || actions.every((action: Action) => action.name !== toolCallName)) {
      return "tool_node";
    }
  }

  // Otherwise, stop (reply to the user)
  return "__end__";
}

// Define the workflow graph
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chat_node)
  .addNode("tool_node", new ToolNode(tools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue);

const memory = new MemorySaver();

export const graph: Runnable = workflow.compile({
  checkpointer: memory,
});
