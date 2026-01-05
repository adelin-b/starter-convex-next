import { SipClient } from "livekit-server-sdk";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, agentName } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Validate environment variables
    const livekitUrl = process.env.LIVEKIT_URL;
    const livekitApiKey = process.env.LIVEKIT_API_KEY;
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

    if (!(livekitUrl && livekitApiKey && livekitApiSecret)) {
      console.error("Missing LiveKit credentials");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Initialize SIP client
    const sipClient = new SipClient(
      livekitUrl.replace("wss://", "https://"),
      livekitApiKey,
      livekitApiSecret,
    );

    // Generate a unique room name for this call
    const roomName = `outbound-call-${Date.now()}`;

    // Get outbound trunk ID
    const sipTrunkId = process.env.LIVEKIT_SIP_OUTBOUND_TRUNK_ID;

    if (!sipTrunkId) {
      console.error("Missing LIVEKIT_SIP_OUTBOUND_TRUNK_ID");
      return NextResponse.json({ error: "SIP trunk not configured" }, { status: 500 });
    }

    // Create a SIP participant (outbound call)
    // Method signature: createSipParticipant(sipTrunkId, phoneNumber, roomName, opts?)
    const sipParticipant = await sipClient.createSipParticipant(sipTrunkId, phoneNumber, roomName, {
      participantIdentity: `sip-caller-${Date.now()}`,
      participantName: `Outbound to ${phoneNumber}`,
      // If agent name is provided, configure the room to use that agent
      ...(agentName && {
        roomConfig: {
          agents: [{ agentName }],
        },
      }),
    });

    return NextResponse.json({
      success: true,
      participantId: sipParticipant.participantId,
      participantIdentity: sipParticipant.participantIdentity,
      roomName: sipParticipant.roomName,
      sipCallId: sipParticipant.sipCallId,
    });
  } catch (error) {
    console.error("Error making outbound call:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate outbound call",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
