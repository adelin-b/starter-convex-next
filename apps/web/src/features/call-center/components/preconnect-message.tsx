"use client";

import type { ReceivedChatMessage } from "@livekit/components-react";
import { AnimatePresence, motion } from "motion/react";
import { ShimmerText } from "@/components/livekit/shimmer-text";
import { cn } from "@/lib/utils";

const MotionMessage = motion.create("p");

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      transition: {
        ease: "easeIn",
        duration: 0.5,
        delay: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        ease: "easeIn",
        duration: 0.5,
        delay: 0,
      },
    },
  },
  initial: "hidden",
  animate: "visible",
  exit: "hidden",
} as const;

type PreConnectMessageProps = {
  messages?: ReceivedChatMessage[];
  className?: string;
};

export function PreConnectMessage({ className, messages = [] }: PreConnectMessageProps) {
  return (
    <AnimatePresence>
      {messages.length === 0 && (
        <MotionMessage
          {...VIEW_MOTION_PROPS}
          aria-hidden={messages.length > 0}
          className={cn("pointer-events-none text-center", className)}
        >
          <ShimmerText className="font-semibold text-sm">
            Agent is listening, ask it a question
          </ShimmerText>
        </MotionMessage>
      )}
    </AnimatePresence>
  );
}
