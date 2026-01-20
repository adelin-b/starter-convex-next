"use client";

import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@starter-saas/ui/tabs";
import { cn } from "@starter-saas/ui/utils";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Bot, Phone, User } from "lucide-react";
import Link from "next/link";
import { useRecordingPlayer } from "../hooks/use-recording-player";
import { generateMockWaveform, useWaveform } from "../hooks/use-waveform";
import type { Bookmark, CallRecording, TranscriptSegment } from "../types/recording";
import { formatDurationHuman } from "../utils/format-time";
import { BookmarkPanel } from "./bookmark-panel";
import { PlaybackControls } from "./playback-controls";
import { ShareModal } from "./share-modal";
import { TranscriptPanel } from "./transcript-panel";
import { WaveformVisualization } from "./waveform-visualization";

type CallRecordingPlayerProps = {
  recording: CallRecording;
  className?: string;
};

export function CallRecordingPlayer({ recording, className }: CallRecordingPlayerProps) {
  const {
    audioRef,
    playbackState,
    currentTranscriptIndex,
    bookmarks,
    togglePlay,
    seek,
    setPlaybackSpeed,
    setVolume,
    toggleMute,
    addBookmark,
    removeBookmark,
    seekToBookmark,
    seekToTranscript,
  } = useRecordingPlayer({
    recordingUrl: recording.recordingUrl,
    transcript: recording.transcript,
    initialBookmarks: recording.bookmarks,
  });

  // Generate waveform data (in production, this would come from the server or be computed lazily)
  const { waveformData, isLoading: waveformLoading } = useWaveform({
    audioUrl: recording.recordingUrl,
    numberOfPeaks: 150,
  });

  // Use mock waveform if real waveform fails to load
  const displayWaveform =
    waveformData || (recording.duration > 0 ? generateMockWaveform(recording.duration) : null);

  return (
    <div className={cn("space-y-6", className)} data-testid="call-recording-player">
      {/* Hidden audio element */}
      {/* biome-ignore lint/a11y/useMediaCaption: Transcript panel provides captions */}
      <audio
        data-testid="audio-element"
        preload="metadata"
        ref={audioRef}
        src={recording.recordingUrl}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/call-history">
            <Button size="icon-sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-2xl tracking-tight">Call Recording</h1>
            <p className="text-muted-foreground text-sm">
              {recording.startedAt
                ? formatDistanceToNow(new Date(recording.startedAt), { addSuffix: true })
                : "Unknown date"}
            </p>
          </div>
        </div>
        <ShareModal
          agentName={recording.agentName}
          bookmarks={bookmarks}
          callId={recording.callId}
          contactName={recording.contactName}
          duration={playbackState.duration}
          recordingUrl={recording.recordingUrl}
          transcript={recording.transcript}
        />
      </div>

      {/* Call info */}
      <div className="flex flex-wrap gap-3">
        {recording.agentName && (
          <Badge className="gap-1.5 py-1" variant="secondary">
            <Bot className="h-3 w-3" />
            {recording.agentName}
          </Badge>
        )}
        {recording.contactName && (
          <Badge className="gap-1.5 py-1" variant="outline">
            <User className="h-3 w-3" />
            {recording.contactName}
          </Badge>
        )}
        {recording.phoneNumber && (
          <Badge className="gap-1.5 py-1" variant="outline">
            <Phone className="h-3 w-3" />
            {recording.phoneNumber}
          </Badge>
        )}
        {recording.duration > 0 && (
          <Badge className="py-1" variant="outline">
            {formatDurationHuman(recording.duration)}
          </Badge>
        )}
      </div>

      {/* Main player card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audio Player</CardTitle>
          <CardDescription>
            Click on the waveform or use the controls to navigate the recording
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Waveform */}
          <WaveformVisualization
            currentTime={playbackState.currentTime}
            duration={playbackState.duration}
            isLoading={waveformLoading && !displayWaveform}
            onSeek={seek}
            waveformData={displayWaveform}
          />

          {/* Playback controls */}
          <PlaybackControls
            onSeek={seek}
            onSetSpeed={setPlaybackSpeed}
            onSetVolume={setVolume}
            onToggleMute={toggleMute}
            onTogglePlay={togglePlay}
            playbackState={playbackState}
          />
        </CardContent>
      </Card>

      {/* Tabs for Transcript and Bookmarks */}
      <Tabs className="w-full" defaultValue="transcript">
        <TabsList>
          <TabsTrigger data-testid="transcript-tab" value="transcript">
            Transcript
            {recording.transcript.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {recording.transcript.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger data-testid="bookmarks-tab" value="bookmarks">
            Bookmarks
            {bookmarks.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {bookmarks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="transcript">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transcript</CardTitle>
              <CardDescription>
                Click on any segment to jump to that point in the recording
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TranscriptPanel
                className="h-80"
                currentIndex={currentTranscriptIndex}
                onSeek={seekToTranscript}
                transcript={recording.transcript}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-4" value="bookmarks">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Moments</CardTitle>
              <CardDescription>
                Bookmark important moments in the call for quick reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookmarkPanel
                bookmarks={bookmarks}
                currentTime={playbackState.currentTime}
                onAddBookmark={addBookmark}
                onRemoveBookmark={removeBookmark}
                onSeekToBookmark={seekToBookmark}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Demo component with mock data for testing
export function CallRecordingPlayerDemo() {
  const mockTranscript: TranscriptSegment[] = [
    {
      id: "1",
      speaker: "agent",
      message: "Hello! Thank you for calling. How can I help you today?",
      timestamp: 0,
    },
    {
      id: "2",
      speaker: "user",
      message: "Hi, I'm calling about my account. I noticed some charges that I don't recognize.",
      timestamp: 5000,
    },
    {
      id: "3",
      speaker: "agent",
      message:
        "I understand. I'd be happy to help you review those charges. Can you please provide your account number?",
      timestamp: 12_000,
    },
    {
      id: "4",
      speaker: "user",
      message: "Sure, it's 12345678.",
      timestamp: 20_000,
    },
    {
      id: "5",
      speaker: "agent",
      message:
        "Thank you. I can see your account now. Which charges would you like me to look into?",
      timestamp: 25_000,
    },
    {
      id: "6",
      speaker: "user",
      message: "There's a charge from last Tuesday for $49.99 that I don't remember making.",
      timestamp: 32_000,
    },
    {
      id: "7",
      speaker: "agent",
      message:
        "I see that charge. It appears to be from an online subscription service. Would you like me to provide more details or help you dispute it?",
      timestamp: 40_000,
    },
    {
      id: "8",
      speaker: "user",
      message: "Yes, please help me dispute it. I didn't authorize that subscription.",
      timestamp: 52_000,
    },
    {
      id: "9",
      speaker: "agent",
      message:
        "Absolutely. I'll initiate a dispute for you right now. You should see the credit within 3-5 business days. Is there anything else I can help you with?",
      timestamp: 60_000,
    },
    {
      id: "10",
      speaker: "user",
      message: "No, that's all. Thank you so much for your help!",
      timestamp: 75_000,
    },
    {
      id: "11",
      speaker: "agent",
      message: "You're welcome! Thank you for calling. Have a great day!",
      timestamp: 82_000,
    },
  ];

  const mockBookmarks: Bookmark[] = [
    {
      id: "b1",
      time: 20_000,
      note: "Customer provided account number",
      createdAt: Date.now(),
    },
    {
      id: "b2",
      time: 52_000,
      note: "Customer requested dispute",
      createdAt: Date.now(),
    },
  ];

  const mockRecording: CallRecording = {
    id: "demo-recording",
    callId: "demo-call",
    recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 90_000, // 1.5 minutes
    transcript: mockTranscript,
    bookmarks: mockBookmarks,
    startedAt: Date.now() - 3_600_000, // 1 hour ago
    agentName: "Customer Service Bot",
    contactName: "John Smith",
    phoneNumber: "+1 (555) 123-4567",
  };

  return <CallRecordingPlayer recording={mockRecording} />;
}
