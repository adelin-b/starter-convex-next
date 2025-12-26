"use client";

import { useMaybeRoomContext, useMediaDeviceSelect } from "@livekit/components-react";
import { cva } from "class-variance-authority";
import type { LocalAudioTrack, LocalVideoTrack } from "livekit-client";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/livekit/select";
import { cn } from "@/lib/utils";

type DeviceSelectProps = React.ComponentProps<typeof SelectTrigger> & {
  kind: MediaDeviceKind;
  variant?: "default" | "small";
  track?: LocalAudioTrack | LocalVideoTrack | undefined;
  requestPermissions?: boolean;
  onMediaDeviceError?: (error: Error) => void;
  onDeviceListChange?: (devices: MediaDeviceInfo[]) => void;
  onActiveDeviceChange?: (deviceId: string) => void;
};

const selectVariants = cva(
  "disabled:not-allowed w-full cursor-pointer rounded-full px-3 py-2 text-sm",
  {
    variants: {
      size: {
        default: "w-[180px]",
        sm: "w-auto",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export function TrackDeviceSelect({
  kind,
  track,
  size = "default",
  requestPermissions = false,
  onMediaDeviceError,
  onDeviceListChange,
  onActiveDeviceChange,
  ...props
}: DeviceSelectProps) {
  const room = useMaybeRoomContext();
  const [open, setOpen] = useState(false);
  const [requestPermissionsState, setRequestPermissionsState] = useState(requestPermissions);
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    room,
    kind,
    track,
    requestPermissions: requestPermissionsState,
    onError: onMediaDeviceError,
  });

  useEffect(() => {
    onDeviceListChange?.(devices);
  }, [devices, onDeviceListChange]);

  // When the select opens, ensure that media devices are re-requested in case when they were last
  // requested, permissions were not granted
  useLayoutEffect(() => {
    if (open) {
      setRequestPermissionsState(true);
    }
  }, [open]);

  const handleActiveDeviceChange = (deviceId: string) => {
    setActiveMediaDevice(deviceId);
    onActiveDeviceChange?.(deviceId);
  };

  const filteredDevices = useMemo(() => devices.filter((d) => d.deviceId !== ""), [devices]);

  if (filteredDevices.length < 2) {
    return null;
  }

  return (
    <Select
      onOpenChange={setOpen}
      onValueChange={handleActiveDeviceChange}
      open={open}
      value={activeDeviceId}
    >
      <SelectTrigger className={cn(selectVariants({ size }), props.className)}>
        {size !== "sm" && (
          <SelectValue className="font-mono text-sm" placeholder={`Select a ${kind}`} />
        )}
      </SelectTrigger>
      <SelectContent>
        {filteredDevices.map((device) => (
          <SelectItem className="font-mono text-xs" key={device.deviceId} value={device.deviceId}>
            {device.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
