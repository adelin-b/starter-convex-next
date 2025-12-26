# @starter-saas/agent

LangGraph-powered AI agent for data analysis and AG Grid operations.

## Overview

This agent provides intelligent data analysis capabilities for the main application. It integrates with CopilotKit to offer conversational AI features for working with data grids.

## Features

- Data analysis and insights
- AG Grid operations (filtering, sorting, exporting)
- Natural language data queries
- Powered by Ollama for local AI inference

## Configuration

The agent uses environment variables from the root `.env` file:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b

# Agent endpoint
LANGGRAPH_DEPLOYMENT_URL=http://localhost:8124
```

## Development

The agent starts automatically when you run `bun run dev` from the project root. It will:

1. Wait for Ollama service to be ready
2. Start LangGraph server on port 8124
3. The main app will connect to it automatically

## Architecture

```
@starter-saas/app (CopilotKit Frontend)
    ↓
/api/copilotkit (Runtime)
    ↓
@starter-saas/agent (LangGraph on :8124)
    ↓
@starter-saas/ollama-service (Ollama on :11434)
```

## Standalone Usage

To run the agent independently:

```bash
cd packages/agent
bun install
bun run dev
```

Note: Ensure Ollama is running first.
