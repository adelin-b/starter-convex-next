"use client";

import { useEffect, useState } from "react";
import type { WaveformData } from "../types/recording";

type UseWaveformProps = {
  audioUrl: string;
  numberOfPeaks?: number;
};

type UseWaveformReturn = {
  waveformData: WaveformData | null;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Custom hook to generate waveform data from an audio file
 * Uses the Web Audio API to analyze the audio and extract peaks
 */
export function useWaveform({
  audioUrl,
  numberOfPeaks = 100,
}: UseWaveformProps): UseWaveformReturn {
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      setIsLoading(false);
      return;
    }

    const audioContext = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
    let cancelled = false;

    async function analyzeAudio() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        if (cancelled) {
          return;
        }

        // Get the audio data from the first channel
        const channelData = audioBuffer.getChannelData(0);
        const samplesPerPeak = Math.floor(channelData.length / numberOfPeaks);
        const peaks: number[] = [];

        for (let i = 0; i < numberOfPeaks; i++) {
          const start = i * samplesPerPeak;
          const end = start + samplesPerPeak;
          let max = 0;

          for (let j = start; j < end && j < channelData.length; j++) {
            const abs = Math.abs(channelData[j]);
            if (abs > max) {
              max = abs;
            }
          }

          peaks.push(max);
        }

        // Normalize peaks to 0-1 range
        const maxPeak = Math.max(...peaks);
        const normalizedPeaks = peaks.map((p) => (maxPeak > 0 ? p / maxPeak : 0));

        setWaveformData({
          peaks: normalizedPeaks,
          duration: audioBuffer.duration * 1000, // Convert to milliseconds
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to analyze audio"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    analyzeAudio();

    return () => {
      cancelled = true;
      audioContext.close();
    };
  }, [audioUrl, numberOfPeaks]);

  return { waveformData, isLoading, error };
}

/**
 * Generate mock waveform data for demo/testing purposes
 */
export function generateMockWaveform(duration: number, numberOfPeaks = 100): WaveformData {
  const peaks: number[] = [];
  for (let i = 0; i < numberOfPeaks; i++) {
    // Generate a random waveform that looks somewhat natural
    const base = 0.3 + Math.random() * 0.4;
    const variation = Math.sin(i * 0.3) * 0.2 + Math.sin(i * 0.7) * 0.1;
    peaks.push(Math.max(0.1, Math.min(1, base + variation)));
  }
  return { peaks, duration };
}
