"use client";

import type { useTrackToggle } from "@livekit/components-react";
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  MonitorArrowUpIcon,
  SpinnerIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Track } from "livekit-client";
import * as React from "react";
import { Toggle } from "@/components/livekit/toggle";
import { cn } from "@/lib/utils";

function getSourceIcon(source: Track.Source, enabled: boolean, pending = false) {
  if (pending) {
    return SpinnerIcon;
  }

  switch (source) {
    case Track.Source.Microphone:
      return enabled ? MicrophoneIcon : MicrophoneSlashIcon;
    case Track.Source.Camera:
      return enabled ? VideoCameraIcon : VideoCameraSlashIcon;
    case Track.Source.ScreenShare:
      return MonitorArrowUpIcon;
    default:
      return React.Fragment;
  }
}

export type TrackToggleProps = React.ComponentProps<typeof Toggle> & {
  source: Parameters<typeof useTrackToggle>[0]["source"];
  pending?: boolean;
};

export function TrackToggle({ source, pressed, pending, className, ...props }: TrackToggleProps) {
  const IconComponent = getSourceIcon(source, pressed ?? false, pending);

  return (
    <Toggle aria-label={`Toggle ${source}`} className={cn(className)} pressed={pressed} {...props}>
      <IconComponent className={cn(pending && "animate-spin")} weight="bold" />
      {props.children}
    </Toggle>
  );
}
