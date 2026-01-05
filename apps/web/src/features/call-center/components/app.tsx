"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { RoomAudioRenderer, StartAudio } from "@livekit/components-react";
import { Toaster } from "@/components/livekit/toaster";
import type { AppConfig } from "@/lib/agent/app-config";
import { ConversationPanel } from "./conversation-panel";
import { SessionProvider } from "./session-provider";
import { ViewController } from "./view-controller";

type AppProps = {
  appConfig: AppConfig;
};

export function App({ appConfig }: AppProps) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <SessionProvider appConfig={appConfig}>
        <main className="h-svh p-4">
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Agent Control Section */}
            <div className="flex items-center justify-center">
              <ViewController />
            </div>

            {/* Conversation Panel Section */}
            <div className="hidden flex-col lg:flex">
              <ConversationPanel />
            </div>
          </div>
        </main>
        <StartAudio label="Start Audio" />
        <RoomAudioRenderer />
        <Toaster />
      </SessionProvider>
    </CopilotKit>
  );
}
