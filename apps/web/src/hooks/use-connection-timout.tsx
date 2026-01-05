import { type AgentState, useRoomContext, useVoiceAssistant } from "@livekit/components-react";
import { useEffect } from "react";
import { toastAlert } from "@/components/livekit/alert-toast";

function isAgentAvailable(agentState: AgentState) {
  return agentState === "listening" || agentState === "thinking" || agentState === "speaking";
}

export function useConnectionTimeout(timeout = 20_000) {
  const room = useRoomContext();
  const { state: agentState } = useVoiceAssistant();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isAgentAvailable(agentState)) {
        const reason =
          agentState === "connecting"
            ? "Agent did not join the room. "
            : "Agent connected but did not complete initializing. ";

        toastAlert({
          title: "Session ended",
          description: (
            <p className="w-full">
              {reason}
              <a
                className="whitespace-nowrap underline"
                href="https://docs.livekit.io/agents/start/voice-ai/"
                rel="noopener noreferrer"
                target="_blank"
              >
                See quickstart guide
              </a>
              .
            </p>
          ),
        });

        room.disconnect();
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [agentState, room, timeout]);
}
