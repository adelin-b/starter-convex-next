"use client";

import { useChat, useRemoteParticipants } from "@livekit/components-react";
import { ChatTextIcon, PhoneDisconnectIcon } from "@phosphor-icons/react/dist/ssr";
import { Track } from "livekit-client";
import { type HTMLAttributes, useCallback, useState } from "react";
import { useSession } from "@/components/call-center/session-provider";
import { TrackToggle } from "@/components/livekit/agent-control-bar/track-toggle";
import { Button } from "@/components/livekit/button";
import { Toggle } from "@/components/livekit/toggle";
import { cn } from "@/lib/utils";
import { ChatInput } from "./chat-input";
import { type UseInputControlsProps, useInputControls } from "./hooks/use-input-controls";
import { usePublishPermissions } from "./hooks/use-publish-permissions";
import { TrackSelector } from "./track-selector";

export type ControlBarControls = {
  leave?: boolean;
  camera?: boolean;
  microphone?: boolean;
  screenShare?: boolean;
  chat?: boolean;
};

export interface AgentControlBarProps extends UseInputControlsProps {
  controls?: ControlBarControls;
  onDisconnect?: () => void;
  onChatOpenChange?: (open: boolean) => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

/**
 * A control bar specifically designed for voice assistant interfaces
 */
export function AgentControlBar({
  controls,
  saveUserChoices = true,
  className,
  onDisconnect,
  onDeviceError,
  onChatOpenChange,
  ...props
}: AgentControlBarProps & HTMLAttributes<HTMLDivElement>) {
  const { send } = useChat();
  const participants = useRemoteParticipants();
  const [chatOpen, setChatOpen] = useState(false);
  const publishPermissions = usePublishPermissions();
  const { isSessionActive, endSession } = useSession();

  const {
    micTrackRef,
    cameraToggle,
    microphoneToggle,
    screenShareToggle,
    handleAudioDeviceChange,
    handleVideoDeviceChange,
    handleMicrophoneDeviceSelectError,
    handleCameraDeviceSelectError,
  } = useInputControls({ onDeviceError, saveUserChoices });

  const handleSendMessage = async (message: string) => {
    await send(message);
  };

  const handleToggleTranscript = useCallback(
    (open: boolean) => {
      setChatOpen(open);
      onChatOpenChange?.(open);
    },
    [onChatOpenChange, setChatOpen],
  );

  const handleDisconnect = useCallback(() => {
    endSession();
    onDisconnect?.();
  }, [endSession, onDisconnect]);

  const visibleControls = {
    leave: controls?.leave ?? true,
    microphone: controls?.microphone ?? publishPermissions.microphone,
    screenShare: controls?.screenShare ?? publishPermissions.screenShare,
    camera: controls?.camera ?? publishPermissions.camera,
    chat: controls?.chat ?? publishPermissions.data,
  };

  const isAgentAvailable = participants.some((p) => p.isAgent);

  return (
    <div
      aria-label="Voice assistant controls"
      className={cn(
        "flex flex-col rounded-[31px] border border-input/50 bg-background p-3 drop-shadow-md/3 dark:border-muted",
        className,
      )}
      role="group"
      {...props}
    >
      {/* Chat Input */}
      {visibleControls.chat && (
        <ChatInput
          chatOpen={chatOpen}
          isAgentAvailable={isAgentAvailable}
          onSend={handleSendMessage}
        />
      )}

      <div className="flex gap-1">
        <div className="flex grow gap-1">
          {/* Toggle Microphone */}
          {visibleControls.microphone && (
            <TrackSelector
              aria-label="Toggle microphone"
              audioTrackRef={micTrackRef}
              disabled={microphoneToggle.pending}
              kind="audioinput"
              onActiveDeviceChange={handleAudioDeviceChange}
              onMediaDeviceError={handleMicrophoneDeviceSelectError}
              onPressedChange={microphoneToggle.toggle}
              pressed={microphoneToggle.enabled}
              source={Track.Source.Microphone}
            />
          )}

          {/* Toggle Camera */}
          {visibleControls.camera && (
            <TrackSelector
              aria-label="Toggle camera"
              disabled={cameraToggle.pending}
              kind="videoinput"
              onActiveDeviceChange={handleVideoDeviceChange}
              onMediaDeviceError={handleCameraDeviceSelectError}
              onPressedChange={cameraToggle.toggle}
              pending={cameraToggle.pending}
              pressed={cameraToggle.enabled}
              source={Track.Source.Camera}
            />
          )}

          {/* Toggle Screen Share */}
          {visibleControls.screenShare && (
            <TrackToggle
              aria-label="Toggle screen share"
              disabled={screenShareToggle.pending}
              onPressedChange={screenShareToggle.toggle}
              pressed={screenShareToggle.enabled}
              size="icon"
              source={Track.Source.ScreenShare}
              variant="secondary"
            />
          )}

          {/* Toggle Transcript */}
          <Toggle
            aria-label="Toggle transcript"
            onPressedChange={handleToggleTranscript}
            pressed={chatOpen}
            size="icon"
            variant="secondary"
          >
            <ChatTextIcon weight="bold" />
          </Toggle>
        </div>

        {/* Disconnect */}
        {visibleControls.leave && (
          <Button
            className="font-mono"
            disabled={!isSessionActive}
            onClick={handleDisconnect}
            variant="destructive"
          >
            <PhoneDisconnectIcon weight="bold" />
            <span className="hidden md:inline">END CALL</span>
            <span className="inline md:hidden">END</span>
          </Button>
        )}
      </div>
    </div>
  );
}
