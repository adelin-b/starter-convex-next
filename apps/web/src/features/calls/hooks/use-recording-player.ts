"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Bookmark, PlaybackSpeed, PlaybackState, TranscriptSegment } from "../types/recording";

type UseRecordingPlayerProps = {
  recordingUrl: string;
  transcript?: TranscriptSegment[];
  initialBookmarks?: Bookmark[];
};

type UseRecordingPlayerReturn = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playbackState: PlaybackState;
  currentTranscriptIndex: number;
  bookmarks: Bookmark[];
  // Playback controls
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (timeMs: number) => void;
  seekToPercent: (percent: number) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  // Bookmark controls
  addBookmark: (note: string) => void;
  removeBookmark: (id: string) => void;
  seekToBookmark: (bookmark: Bookmark) => void;
  // Transcript navigation
  seekToTranscript: (segment: TranscriptSegment) => void;
};

export function useRecordingPlayer({
  recordingUrl: _recordingUrl,
  transcript = [],
  initialBookmarks = [],
}: UseRecordingPlayerProps): UseRecordingPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackSpeed: 1,
    volume: 1,
    isMuted: false,
    isLoading: true,
  });

  // Calculate current transcript index based on playback time
  const currentTranscriptIndex = transcript.findIndex((segment, index) => {
    const nextSegment = transcript[index + 1];
    if (!nextSegment) {
      return segment.timestamp <= playbackState.currentTime;
    }
    return (
      segment.timestamp <= playbackState.currentTime &&
      nextSegment.timestamp > playbackState.currentTime
    );
  });

  // Setup audio element and event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: audio.currentTime * 1000,
      }));
    };

    const handleDurationChange = () => {
      setPlaybackState((prev) => ({
        ...prev,
        duration: audio.duration * 1000,
        isLoading: false,
      }));
    };

    const handlePlay = () => {
      setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };

    const handleLoadStart = () => {
      setPlaybackState((prev) => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setPlaybackState((prev) => ({ ...prev, isLoading: false }));
    };

    const handleVolumeChange = () => {
      setPlaybackState((prev) => ({
        ...prev,
        volume: audio.volume,
        isMuted: audio.muted,
      }));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("volumechange", handleVolumeChange);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("volumechange", handleVolumeChange);
    };
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (playbackState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playbackState.isPlaying, play, pause]);

  const seek = useCallback((timeMs: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeMs / 1000;
    }
  }, []);

  const seekToPercent = useCallback(
    (percent: number) => {
      const timeMs = (percent / 100) * playbackState.duration;
      seek(timeMs);
    },
    [playbackState.duration, seek],
  );

  const setPlaybackSpeed = useCallback((speed: PlaybackSpeed) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      setPlaybackState((prev) => ({ ...prev, playbackSpeed: speed }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  }, []);

  const addBookmark = useCallback(
    (note: string) => {
      const newBookmark: Bookmark = {
        id: crypto.randomUUID(),
        time: playbackState.currentTime,
        note,
        createdAt: Date.now(),
      };
      setBookmarks((prev) => [...prev, newBookmark].sort((a, b) => a.time - b.time));
    },
    [playbackState.currentTime],
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const seekToBookmark = useCallback(
    (bookmark: Bookmark) => {
      seek(bookmark.time);
    },
    [seek],
  );

  const seekToTranscript = useCallback(
    (segment: TranscriptSegment) => {
      seek(segment.timestamp);
    },
    [seek],
  );

  return {
    audioRef,
    playbackState,
    currentTranscriptIndex,
    bookmarks,
    play,
    pause,
    togglePlay,
    seek,
    seekToPercent,
    setPlaybackSpeed,
    setVolume,
    toggleMute,
    addBookmark,
    removeBookmark,
    seekToBookmark,
    seekToTranscript,
  };
}
