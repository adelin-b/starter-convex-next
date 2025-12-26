"use client";

import { useRoomContext } from "@livekit/components-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { useSession } from "./session-provider";
import { SessionView } from "./session-view";
import { WelcomeView } from "./welcome-view";

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(SessionView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: "hidden",
  animate: "visible",
  exit: "hidden",
  transition: {
    duration: 0.5,
    ease: "linear",
  },
} as const;

export function ViewController() {
  const room = useRoomContext();
  const isSessionActiveRef = useRef(false);
  const { appConfig, isSessionActive, startSession, makeOutboundCall } = useSession();

  // animation handler holds a reference to stale isSessionActive value
  isSessionActiveRef.current = isSessionActive;

  // disconnect room after animation completes
  const handleAnimationComplete = () => {
    if (!isSessionActiveRef.current && room.state !== "disconnected") {
      room.disconnect();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {/* Welcome screen */}
      {!isSessionActive && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          onMakeOutboundCall={makeOutboundCall}
          onStartCall={startSession}
          startButtonText={appConfig.startButtonText}
        />
      )}
      {/* Session view */}
      {isSessionActive && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          appConfig={appConfig}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </AnimatePresence>
  );
}
