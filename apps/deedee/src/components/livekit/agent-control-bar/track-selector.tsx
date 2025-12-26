"use client";

import {
  BarVisualizer,
  type TrackReferenceOrPlaceholder,
  type useTrackToggle,
} from "@livekit/components-react";
import { TrackDeviceSelect } from "@/components/livekit/agent-control-bar/track-device-select";
import { TrackToggle } from "@/components/livekit/agent-control-bar/track-toggle";
import { cn } from "@/lib/utils";

type TrackSelectorProps = {
  kind: MediaDeviceKind;
  source: Parameters<typeof useTrackToggle>[0]["source"];
  pressed?: boolean;
  pending?: boolean;
  disabled?: boolean;
  className?: string;
  audioTrackRef?: TrackReferenceOrPlaceholder;
  onPressedChange?: (pressed: boolean) => void;
  onMediaDeviceError?: (error: Error) => void;
  onActiveDeviceChange?: (deviceId: string) => void;
};

export function TrackSelector({
  kind,
  source,
  pressed,
  pending,
  disabled,
  className,
  audioTrackRef,
  onPressedChange,
  onMediaDeviceError,
  onActiveDeviceChange,
}: TrackSelectorProps) {
  return (
    <div className={cn("flex items-center gap-0", className)}>
      <TrackToggle
        className="peer/track group/track has-[.audiovisualizer]:w-auto has-[~_button]:rounded-r-none has-[~_button]:pr-2 has-[~_button]:pl-3"
        disabled={disabled}
        onPressedChange={onPressedChange}
        pending={pending}
        pressed={pressed}
        size="icon"
        source={source}
        variant="primary"
      >
        {audioTrackRef && (
          <BarVisualizer
            barCount={3}
            className="audiovisualizer flex h-6 w-auto items-center justify-center gap-0.5"
            options={{ minHeight: 5 }}
            trackRef={audioTrackRef}
          >
            <span
              className={cn([
                "h-full w-0.5 origin-center rounded-2xl",
                "group-data-[state=off]/track:bg-destructive group-data-[state=on]/track:bg-foreground",
                "data-lk-muted:bg-muted",
              ])}
            />
          </BarVisualizer>
        )}
      </TrackToggle>
      <hr className="-mr-px relative z-10 hidden h-4 w-px border-none bg-border has-[~_button]:block peer-data-[state=off]/track:bg-destructive/20" />
      <TrackDeviceSelect
        className={cn([
          "rounded-l-none pl-2",
          "peer-data-[state=off]/track:text-destructive",
          "hover:text-foreground focus:text-foreground",
          "hover:peer-data-[state=off]/track:text-foreground",
          "focus:peer-data-[state=off]/track:text-destructive",
        ])}
        kind={kind}
        onActiveDeviceChange={onActiveDeviceChange}
        onMediaDeviceError={onMediaDeviceError}
        requestPermissions={false}
        size="sm"
      />
    </div>
  );
}
