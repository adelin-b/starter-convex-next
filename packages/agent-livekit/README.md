# @starter-saas/agent-livekit

LiveKit voice agent service for the DeeDee voice AI assistant platform.

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
LIVEKIT_URL=wss://your-livekit-instance.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
CONVEX_URL=https://your-project.convex.cloud
CONVEX_SYSTEM_ADMIN_TOKEN=your_convex_system_admin_token
```

### 2. Download Required Model Files

Before first run, download the LiveKit model files:

```bash
bun run tsx src/agent.ts download-files
```

### 3. Run the Agent

```bash
bun dev
```

## Development

- **Dev**: `bun dev` - Run agent in development mode
- **Download Models**: `tsx src/agent.ts download-files` - Download required AI model files

## Architecture

The agent loads configuration dynamically from Convex based on room metadata:

- Connects to LiveKit Cloud
- Loads agent config from Convex (`agents:getByIdForAgent`)
- Configures STT/LLM/TTS pipeline per agent
- Handles voice interactions with users

## Integration

Imports Convex types from `@starter-saas/backend`:

```typescript
import { api } from '@starter-saas/backend/convex/_generated/api';
```

Note: TypeScript build may show errors from backend package. Use `tsx` directly for development as shown above.
