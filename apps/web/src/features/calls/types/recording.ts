// Types for call recording player functionality

export type TranscriptSegment = {
  id: string;
  speaker: "user" | "agent" | "system";
  message: string;
  timestamp: number; // Time in milliseconds from start of recording
  duration?: number;
  confidence?: number;
};

export type Bookmark = {
  id: string;
  time: number; // Time in milliseconds
  note: string;
  createdAt: number;
};

export type CallRecording = {
  id: string;
  callId: string;
  recordingUrl: string;
  duration: number; // Total duration in milliseconds
  transcript: TranscriptSegment[];
  bookmarks: Bookmark[];
  startedAt?: number;
  endedAt?: number;
  agentName?: string;
  contactName?: string;
  phoneNumber?: string;
};

export type PlaybackState = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
};

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

export type WaveformData = {
  peaks: number[];
  duration: number;
};

export type ShareOptions = {
  includeTranscript: boolean;
  includeBookmarks: boolean;
  startTime?: number;
  endTime?: number;
};
