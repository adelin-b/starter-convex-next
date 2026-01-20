"use client";

import { useParams } from "next/navigation";
import { CallRecordingPlayerDemo } from "@/features/calls";

export default function CallRecordingPage() {
  const params = useParams();
  const _callId = params.id as string;

  // For now, we'll use the demo component which has mock data
  // In production, this would fetch the actual call data from Convex
  // const { data: call, isPending, isError } = useQueryWithStatus(
  //   api.calls.getWithDetails,
  //   { id: callId as Id<"calls"> }
  // );

  // TODO: When integrating with real data, replace CallRecordingPlayerDemo with:
  // <CallRecordingPlayer recording={transformCallToRecording(call)} />

  return (
    <div className="flex-1 p-8 pt-6" data-testid="call-recording-page">
      <CallRecordingPlayerDemo />
    </div>
  );
}
