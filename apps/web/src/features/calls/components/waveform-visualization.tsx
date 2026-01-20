"use client";

import { cn } from "@starter-saas/ui/utils";
import { useCallback, useEffect, useRef } from "react";
import type { WaveformData } from "../types/recording";

type WaveformVisualizationProps = {
  waveformData: WaveformData | null;
  currentTime: number;
  duration: number;
  onSeek?: (timeMs: number) => void;
  className?: string;
  barWidth?: number;
  barGap?: number;
  playedColor?: string;
  unplayedColor?: string;
  isLoading?: boolean;
};

export function WaveformVisualization({
  waveformData,
  currentTime,
  duration,
  onSeek,
  className,
  barWidth = 3,
  barGap = 2,
  playedColor = "hsl(var(--primary))",
  unplayedColor = "hsl(var(--muted-foreground) / 0.3)",
  isLoading = false,
}: WaveformVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!(canvas && container && waveformData)) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const { peaks } = waveformData;
    const totalBarWidth = barWidth + barGap;
    const barsCount = Math.floor(rect.width / totalBarWidth);
    const progress = duration > 0 ? currentTime / duration : 0;
    const progressBars = Math.floor(barsCount * progress);

    // Calculate which peaks to use (interpolate if necessary)
    const peaksPerBar = peaks.length / barsCount;

    for (let i = 0; i < barsCount; i++) {
      // Get the average peak value for this bar
      const startPeak = Math.floor(i * peaksPerBar);
      const endPeak = Math.floor((i + 1) * peaksPerBar);
      let peakValue = 0;
      for (let j = startPeak; j < endPeak && j < peaks.length; j++) {
        peakValue = Math.max(peakValue, peaks[j]);
      }

      // Calculate bar height (minimum 4px for visibility)
      const barHeight = Math.max(4, peakValue * (rect.height - 8));
      const x = i * totalBarWidth;
      const y = (rect.height - barHeight) / 2;

      // Set color based on playback progress
      ctx.fillStyle = i < progressBars ? playedColor : unplayedColor;

      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 1);
      ctx.fill();
    }
  }, [waveformData, currentTime, duration, barWidth, barGap, playedColor, unplayedColor]);

  // Draw waveform on mount and when dependencies change
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Redraw on window resize
  useEffect(() => {
    const handleResize = () => {
      drawWaveform();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawWaveform]);

  // Handle click to seek
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!(onSeek && containerRef.current) || duration <= 0) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const timeMs = percent * duration;
      onSeek(timeMs);
    },
    [onSeek, duration],
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex h-16 items-center justify-center rounded-lg border bg-muted/50",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground text-sm">Loading waveform...</span>
        </div>
      </div>
    );
  }

  if (!waveformData) {
    return (
      <div
        className={cn(
          "flex h-16 items-center justify-center rounded-lg border bg-muted/50",
          className,
        )}
      >
        <span className="text-muted-foreground text-sm">No waveform data available</span>
      </div>
    );
  }

  const progress = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Waveform click is supplementary to playback controls
    <div
      aria-label="Audio waveform"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress}
      className={cn(
        "relative h-16 cursor-pointer rounded-lg border bg-muted/30 transition-colors hover:bg-muted/50",
        className,
      )}
      data-testid="waveform-visualization"
      onClick={handleClick}
      ref={containerRef}
      role="slider"
      tabIndex={0}
    >
      <canvas
        className="absolute inset-0 h-full w-full"
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
