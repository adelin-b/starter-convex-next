import { useLocalParticipantPermissions } from "@livekit/components-react";
import { Track } from "livekit-client";

// Protocol source values - avoids importing protocol package to reduce bundle size
const PROTOCOL_SOURCE_UNKNOWN = 0;
const PROTOCOL_SOURCE_CAMERA = 1;
const PROTOCOL_SOURCE_MICROPHONE = 2;
const PROTOCOL_SOURCE_SCREEN_SHARE = 3;

const trackSourceToProtocol = (source: Track.Source) => {
  // NOTE: this mapping avoids importing the protocol package as that leads to a significant bundle size increase
  switch (source) {
    case Track.Source.Camera:
      return PROTOCOL_SOURCE_CAMERA;
    case Track.Source.Microphone:
      return PROTOCOL_SOURCE_MICROPHONE;
    case Track.Source.ScreenShare:
      return PROTOCOL_SOURCE_SCREEN_SHARE;
    default:
      return PROTOCOL_SOURCE_UNKNOWN;
  }
};

export type PublishPermissions = {
  camera: boolean;
  microphone: boolean;
  screenShare: boolean;
  data: boolean;
};

export function usePublishPermissions(): PublishPermissions {
  const localPermissions = useLocalParticipantPermissions();

  const canPublishSource = (source: Track.Source) =>
    !!localPermissions?.canPublish &&
    (localPermissions.canPublishSources.length === 0 ||
      localPermissions.canPublishSources.includes(trackSourceToProtocol(source)));

  return {
    camera: canPublishSource(Track.Source.Camera),
    microphone: canPublishSource(Track.Source.Microphone),
    screenShare: canPublishSource(Track.Source.ScreenShare),
    data: localPermissions?.canPublishData ?? false,
  };
}
