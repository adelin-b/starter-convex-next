import {
  type AgentState,
  BarVisualizer,
  type TrackReference,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const MotionContainer = motion.create("div");

const ANIMATION_TRANSITION = {
  type: "spring",
  stiffness: 675,
  damping: 75,
  mass: 1,
} as const;

// Scale values for animations
const SCALE_NORMAL = 1;
const SCALE_EXPANDED = 5;

// Border radius values
const BORDER_RADIUS_SMALL = 6;
const BORDER_RADIUS_LARGE = 12;

// Animation delays (in seconds)
const ANIMATION_DELAY_OPEN = 0;
const ANIMATION_DELAY_CLOSED = 0.15;

const classNames = {
  // GRID
  // 2 Columns x 3 Rows
  grid: [
    "h-full w-full",
    "grid gap-x-2 place-content-center",
    "grid-cols-[1fr_1fr] grid-rows-[90px_1fr_90px]",
  ],
  // Agent
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 1 / Row 1
  // align: x-end y-center
  agentChatOpenWithSecondTile: ["col-start-1 row-start-1", "self-center justify-self-end"],
  // Agent
  // chatOpen: true,
  // hasSecondTile: false
  // layout: Column 1 / Row 1 / Column-Span 2
  // align: x-center y-center
  agentChatOpenWithoutSecondTile: ["col-start-1 row-start-1", "col-span-2", "place-content-center"],
  // Agent
  // chatOpen: false
  // layout: Column 1 / Row 1 / Column-Span 2 / Row-Span 3
  // align: x-center y-center
  agentChatClosed: ["col-start-1 row-start-1", "col-span-2 row-span-3", "place-content-center"],
  // Second tile
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 2 / Row 1
  // align: x-start y-center
  secondTileChatOpen: ["col-start-2 row-start-1", "self-center justify-self-start"],
  // Second tile
  // chatOpen: false,
  // hasSecondTile: false
  // layout: Column 2 / Row 2
  // align: x-end y-end
  secondTileChatClosed: ["col-start-2 row-start-3", "place-content-end"],
};

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant],
  );
  return trackRef;
}

function getAgentContainerClassName(chatOpen: boolean, hasSecondTile: boolean): string {
  if (!chatOpen) {
    return cn(["grid", classNames.agentChatClosed]);
  }
  if (hasSecondTile) {
    return cn(["grid", classNames.agentChatOpenWithSecondTile]);
  }
  return cn(["grid", classNames.agentChatOpenWithoutSecondTile]);
}

function getSecondTileClassName(chatOpen: boolean): string {
  return cn(["grid", chatOpen ? classNames.secondTileChatOpen : classNames.secondTileChatClosed]);
}

type AudioAgentProps = {
  chatOpen: boolean;
  animationDelay: number;
  agentState: AgentState | undefined;
  agentAudioTrack: TrackReference | undefined;
};

function AudioAgent({ chatOpen, animationDelay, agentState, agentAudioTrack }: AudioAgentProps) {
  return (
    <MotionContainer
      animate={{
        opacity: 1,
        scale: chatOpen ? SCALE_NORMAL : SCALE_EXPANDED,
      }}
      className={cn(
        "aspect-square h-[90px] rounded-md border border-transparent bg-background transition-[border,drop-shadow]",
        chatOpen && "border-input/50 drop-shadow-lg/10 delay-200",
      )}
      initial={{
        opacity: 0,
        scale: 0,
      }}
      key="agent"
      layoutId="agent"
      transition={{
        ...ANIMATION_TRANSITION,
        delay: animationDelay,
      }}
    >
      <BarVisualizer
        barCount={5}
        className={cn("flex h-full items-center justify-center gap-1")}
        options={{ minHeight: 5 }}
        state={agentState}
        trackRef={agentAudioTrack}
      >
        <span
          className={cn([
            "min-h-2.5 w-2.5 rounded-full bg-muted",
            "origin-center transition-colors duration-250 ease-linear",
            "data-[lk-highlighted=true]:bg-foreground data-[lk-muted=true]:bg-muted",
          ])}
        />
      </BarVisualizer>
    </MotionContainer>
  );
}

type AvatarAgentProps = {
  chatOpen: boolean;
  animationDelay: number;
  videoWidth: number;
  videoHeight: number;
  agentVideoTrack: TrackReference | undefined;
};

function AvatarAgent({
  chatOpen,
  animationDelay,
  videoWidth,
  videoHeight,
  agentVideoTrack,
}: AvatarAgentProps) {
  return (
    <MotionContainer
      animate={{
        maskImage:
          "radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 500px, transparent 500px)",
        filter: "blur(0px)",
        borderRadius: chatOpen ? BORDER_RADIUS_SMALL : BORDER_RADIUS_LARGE,
      }}
      className={cn(
        "overflow-hidden bg-black drop-shadow-xl/80",
        chatOpen ? "h-[90px]" : "h-auto w-full",
      )}
      initial={{
        scale: 1,
        opacity: 1,
        maskImage:
          "radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 20px, transparent 20px)",
        filter: "blur(20px)",
      }}
      key="avatar"
      layoutId="avatar"
      transition={{
        ...ANIMATION_TRANSITION,
        delay: animationDelay,
        maskImage: {
          duration: 1,
        },
        filter: {
          duration: 1,
        },
      }}
    >
      <VideoTrack
        className={cn(chatOpen && "size-[90px] object-cover")}
        height={videoHeight}
        trackRef={agentVideoTrack}
        width={videoWidth}
      />
    </MotionContainer>
  );
}

type SecondaryTrackProps = {
  animationDelay: number;
  cameraTrack: TrackReference | undefined;
  screenShareTrack: TrackReference | undefined;
};

function SecondaryTrack({ animationDelay, cameraTrack, screenShareTrack }: SecondaryTrackProps) {
  const activeTrack = cameraTrack || screenShareTrack;
  if (!activeTrack) {
    return null;
  }

  return (
    <MotionContainer
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className="drop-shadow-lg/20"
      exit={{
        opacity: 0,
        scale: 0,
      }}
      initial={{
        opacity: 0,
        scale: 0,
      }}
      key="camera"
      layout="position"
      layoutId="camera"
      transition={{
        ...ANIMATION_TRANSITION,
        delay: animationDelay,
      }}
    >
      <VideoTrack
        className="aspect-square w-[90px] rounded-md bg-muted object-cover"
        height={activeTrack.publication.dimensions?.height ?? 0}
        trackRef={activeTrack}
        width={activeTrack.publication.dimensions?.width ?? 0}
      />
    </MotionContainer>
  );
}

type TileLayoutProps = {
  chatOpen: boolean;
};

export function TileLayout({ chatOpen }: TileLayoutProps) {
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);

  const isCameraEnabled = Boolean(cameraTrack && !cameraTrack.publication.isMuted);
  const isScreenShareEnabled = Boolean(screenShareTrack && !screenShareTrack.publication.isMuted);
  const hasSecondTile = isCameraEnabled || isScreenShareEnabled;

  const animationDelay = chatOpen ? ANIMATION_DELAY_OPEN : ANIMATION_DELAY_CLOSED;
  const isAvatar = agentVideoTrack !== undefined;
  const videoWidth = agentVideoTrack?.publication.dimensions?.width ?? 0;
  const videoHeight = agentVideoTrack?.publication.dimensions?.height ?? 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 bottom-32 z-50 md:top-12 md:bottom-40">
      <div className="relative mx-auto h-full max-w-2xl px-4 md:px-0">
        <div className={cn(classNames.grid)}>
          <div className={getAgentContainerClassName(chatOpen, hasSecondTile)}>
            <AnimatePresence mode="popLayout">
              {!isAvatar && (
                <AudioAgent
                  agentAudioTrack={agentAudioTrack}
                  agentState={agentState}
                  animationDelay={animationDelay}
                  chatOpen={chatOpen}
                />
              )}
              {isAvatar && (
                <AvatarAgent
                  agentVideoTrack={agentVideoTrack}
                  animationDelay={animationDelay}
                  chatOpen={chatOpen}
                  videoHeight={videoHeight}
                  videoWidth={videoWidth}
                />
              )}
            </AnimatePresence>
          </div>

          <div className={getSecondTileClassName(chatOpen)}>
            <AnimatePresence>
              {hasSecondTile && (
                <SecondaryTrack
                  animationDelay={animationDelay}
                  cameraTrack={isCameraEnabled ? cameraTrack : undefined}
                  screenShareTrack={isScreenShareEnabled ? screenShareTrack : undefined}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
