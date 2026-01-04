/**
 * Stub CopilotKit route for when LLM dependencies are not installed.
 * Returns a 503 Service Unavailable response indicating the AI service is not configured.
 */
export const POST = async () => new Response(
    JSON.stringify({
      error: "CopilotKit service not configured",
      message: "Install @langchain/openai and configure LLM environment variables to enable AI features",
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }
  );
