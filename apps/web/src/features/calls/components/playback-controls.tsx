"use client";

import { Button } from "@starter-saas/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@starter-saas/ui/dropdown-menu";
import { Slider } from "@starter-saas/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@starter-saas/ui/tooltip";
import { cn } from "@starter-saas/ui/utils";
import { Gauge, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { PLAYBACK_SPEEDS, type PlaybackSpeed, type PlaybackState } from "../types/recording";
import { formatTime } from "../utils/format-time";

type PlaybackControlsProps = {
  playbackState: PlaybackState;
  onTogglePlay: () => void;
  onSeek: (timeMs: number) => void;
  onSetSpeed: (speed: PlaybackSpeed) => void;
  onSetVolume: (volume: number) => void;
  onToggleMute: () => void;
  className?: string;
};

export function PlaybackControls({
  playbackState,
  onTogglePlay,
  onSeek,
  onSetSpeed,
  onSetVolume,
  onToggleMute,
  className,
}: PlaybackControlsProps) {
  const { isPlaying, currentTime, duration, playbackSpeed, volume, isMuted, isLoading } =
    playbackState;

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10_000); // Skip back 10 seconds
    onSeek(newTime);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10_000); // Skip forward 10 seconds
    onSeek(newTime);
  };

  const handleSliderChange = (value: number[]) => {
    const percent = value[0];
    const newTime = (percent / 100) * duration;
    onSeek(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("space-y-4", className)} data-testid="playback-controls">
      {/* Progress slider */}
      <div className="space-y-2">
        <Slider
          className="cursor-pointer"
          data-testid="playback-slider"
          disabled={isLoading || duration === 0}
          max={100}
          onValueChange={handleSliderChange}
          step={0.1}
          value={[progress]}
        />
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Volume controls */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="mute-button"
                onClick={onToggleMute}
                size="icon-sm"
                variant="ghost"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
          </Tooltip>

          <Slider
            className="w-20"
            data-testid="volume-slider"
            max={100}
            onValueChange={(value) => onSetVolume(value[0] / 100)}
            step={1}
            value={[isMuted ? 0 : volume * 100]}
          />
        </div>

        {/* Center: Playback controls */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="skip-back-button"
                disabled={isLoading || currentTime === 0}
                onClick={handleSkipBack}
                size="icon"
                variant="ghost"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Skip back 10s</TooltipContent>
          </Tooltip>

          <Button
            className="h-12 w-12 rounded-full"
            data-testid="play-pause-button"
            disabled={isLoading || duration === 0}
            onClick={onTogglePlay}
            size="icon"
            variant="default"
          >
            {isLoading && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            )}
            {!isLoading && isPlaying && <Pause className="h-5 w-5" />}
            {!(isLoading || isPlaying) && <Play className="ml-0.5 h-5 w-5" />}
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="skip-forward-button"
                disabled={isLoading || currentTime >= duration}
                onClick={handleSkipForward}
                size="icon"
                variant="ghost"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Skip forward 10s</TooltipContent>
          </Tooltip>
        </div>

        {/* Right: Speed control */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="min-w-[4rem]"
                    data-testid="speed-button"
                    size="sm"
                    variant="outline"
                  >
                    <Gauge className="mr-1 h-4 w-4" />
                    {playbackSpeed}x
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Playback speed</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {PLAYBACK_SPEEDS.map((speed) => (
                <DropdownMenuItem
                  className={cn("cursor-pointer", speed === playbackSpeed && "bg-accent")}
                  key={speed}
                  onClick={() => onSetSpeed(speed)}
                >
                  {speed}x {speed === 1 && "(Normal)"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
