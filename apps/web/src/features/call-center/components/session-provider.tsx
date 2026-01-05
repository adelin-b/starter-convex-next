"use client";

import { RoomContext } from "@livekit/components-react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { toastAlert } from "@/components/livekit/alert-toast";
import { useRoom } from "@/hooks/use-room";
import { APP_CONFIG_DEFAULTS, type AppConfig } from "@/lib/agent/app-config";

const SessionContext = createContext<{
  appConfig: AppConfig;
  isSessionActive: boolean;
  startSession: () => void;
  endSession: () => void;
  makeOutboundCall: (phoneNumber: string, agentName?: string) => Promise<void>;
}>({
  appConfig: APP_CONFIG_DEFAULTS,
  isSessionActive: false,
  startSession: () => {
    /* Default no-op implementation */
  },
  endSession: () => {
    /* Default no-op implementation */
  },
  makeOutboundCall: async () => {
    /* Default no-op implementation */
  },
});

type SessionProviderProps = {
  appConfig: AppConfig;
  children: React.ReactNode;
};

export const SessionProvider = ({ appConfig, children }: SessionProviderProps) => {
  const { room, isSessionActive, startSession, endSession } = useRoom(appConfig);

  const makeOutboundCall = useCallback(
    async (phoneNumber: string, agentName?: string) => {
      try {
        const response = await fetch("/api/sip/outbound-call", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber, agentName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to initiate outbound call");
        }

        const _data = await response.json();

        toastAlert({
          title: "Call initiated",
          description: `Calling ${phoneNumber} with ${agentName || "default"} agent...`,
        });

        // Start the session after initiating the call
        // The room is created by the SIP participant, so we can join it
        startSession();
      } catch (error) {
        toastAlert({
          title: "Failed to make call",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    [startSession],
  );

  const contextValue = useMemo(
    () => ({
      appConfig,
      isSessionActive,
      startSession,
      endSession,
      makeOutboundCall,
    }),
    [appConfig, isSessionActive, startSession, endSession, makeOutboundCall],
  );

  return (
    <RoomContext.Provider value={room}>
      <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
    </RoomContext.Provider>
  );
};

export function useSession() {
  return useContext(SessionContext);
}
