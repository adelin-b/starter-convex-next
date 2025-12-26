# Ollama Service

This package provides Ollama as a Turborepo service that runs automatically when needed.

## How it works

When you run `bun run dev` from the project root:

1. Apps that depend on Ollama will trigger this service to start
2. The service checks if Ollama is already running
3. If not running, it starts `ollama serve`
4. It automatically pulls the default model (qwen3:8b) if not available
5. All logs are visible in the main terminal output

## Configuration

Set these environment variables in your root `.env`:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
```

## Dependent Packages

The following packages depend on this service:

- `@starter-saas/agent` - LangGraph agent for data analysis
- `@starter-saas/app` - Main app with CopilotKit integration

## Manual Control

If you need to run Ollama separately:

```bash
ollama serve
```

To pull models manually:

```bash
bun run ollama:pull
```
