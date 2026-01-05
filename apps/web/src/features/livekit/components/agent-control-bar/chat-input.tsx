import { PaperPlaneRightIcon, SpinnerIcon } from "@phosphor-icons/react/dist/ssr";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/livekit/button";

const MOTION_PROPS = {
  variants: {
    hidden: {
      height: 0,
      opacity: 0,
      marginBottom: 0,
    },
    visible: {
      height: "auto",
      opacity: 1,
      marginBottom: 12,
    },
  },
  initial: "hidden",
  transition: {
    duration: 0.3,
    ease: "easeOut",
  },
} as const;

type ChatInputProps = {
  chatOpen: boolean;
  isAgentAvailable?: boolean;
  onSend?: (message: string) => void;
};

// Default no-op handler
const defaultOnSend = async () => {
  // Intentionally empty - default handler does nothing
};

export function ChatInput({
  chatOpen,
  isAgentAvailable = false,
  onSend = defaultOnSend,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSending(true);
      await onSend(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const isDisabled = isSending || !isAgentAvailable || message.trim().length === 0;

  useEffect(() => {
    if (chatOpen && isAgentAvailable) {
      return;
    }
    // when not disabled refocus on input
    inputRef.current?.focus();
  }, [chatOpen, isAgentAvailable]);

  return (
    <motion.div
      inert={!chatOpen}
      {...MOTION_PROPS}
      animate={chatOpen ? "visible" : "hidden"}
      className="flex w-full items-start overflow-hidden border-input/50 border-b"
    >
      <form
        className="mb-3 flex grow items-end gap-2 rounded-md pl-1 text-sm"
        onSubmit={handleSubmit}
      >
        <input
          className="h-8 flex-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!chatOpen}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type something..."
          ref={inputRef}
          type="text"
          value={message}
        />
        <Button
          className="self-start"
          disabled={isDisabled}
          size="icon"
          title={isSending ? "Sending..." : "Send"}
          type="submit"
          variant={isDisabled ? "secondary" : "primary"}
        >
          {isSending ? (
            <SpinnerIcon className="animate-spin" weight="bold" />
          ) : (
            <PaperPlaneRightIcon weight="bold" />
          )}
        </Button>
      </form>
    </motion.div>
  );
}
