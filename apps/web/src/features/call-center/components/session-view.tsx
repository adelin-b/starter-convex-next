"use client";

import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import {
  AgentControlBar,
  type ControlBarControls,
} from "@/components/livekit/agent-control-bar/agent-control-bar";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useConnectionTimeout } from "@/hooks/use-connection-timout";
import { useDebugMode } from "@/hooks/use-debug";
import type { AppConfig } from "@/lib/agent/app-config";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/livekit/scroll-area/scroll-area";
import { ChatTranscript } from "./chat-transcript";
import { PreConnectMessage } from "./preconnect-message";
import { TileLayout } from "./tile-layout";

const MotionBottom = motion.create("div");

const IN_DEVELOPMENT = process.env.NODE_ENV !== "production";
const CONNECTION_TIMEOUT_MS = 200_000; // 200 seconds
const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: "0%",
    },
    hidden: {
      opacity: 0,
      translateY: "100%",
    },
  },
  initial: "hidden",
  animate: "visible",
  exit: "hidden",
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: "easeOut",
  },
} as const;

type FadeProps = {
  top?: boolean;
  bottom?: boolean;
  className?: string;
};

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        "pointer-events-none h-4 bg-linear-to-b from-background to-transparent",
        top && "bg-linear-to-b",
        bottom && "bg-linear-to-t",
        className,
      )}
    />
  );
}
type SessionViewProps = {
  appConfig: AppConfig;
};

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<"section"> & SessionViewProps) => {
  useConnectionTimeout(CONNECTION_TIMEOUT_MS);
  useDebugMode({ enabled: IN_DEVELOPMENT });

  const messages = useChatMessages();
  const [chatOpen, setChatOpen] = useState(false);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  return (
    <section className="relative z-10 h-full w-full overflow-hidden bg-background" {...props}>
      {/* Chat Transcript */}
      <div
        className={cn(
          "fixed inset-0 grid grid-cols-1 grid-rows-1",
          !chatOpen && "pointer-events-none",
        )}
      >
        <Fade className="absolute inset-x-4 top-0 h-40" top />
        <ScrollArea className="px-4 pt-40 pb-[150px] md:px-6 md:pb-[180px]">
          <ChatTranscript
            className="mx-auto max-w-2xl space-y-3 transition-opacity duration-300 ease-out"
            hidden={!chatOpen}
            messages={messages}
          />
        </ScrollArea>
      </div>

      {/* Tile Layout */}
      <TileLayout chatOpen={chatOpen} />

      {/* Bottom */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage className="pb-4" messages={messages} />
        )}
        <div className="relative mx-auto max-w-2xl bg-background pb-3 md:pb-12">
          <Fade bottom className="-translate-y-full absolute inset-x-0 top-0 h-4" />
          <AgentControlBar controls={controls} onChatOpenChange={setChatOpen} />
        </div>
      </MotionBottom>
    </section>
  );
};
