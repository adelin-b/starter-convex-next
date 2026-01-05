"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useRoomContext } from "@livekit/components-react";
import { Card } from "@starter-saas/ui/card";
import { ScrollArea } from "@starter-saas/ui/scroll-area";
import { RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";
import { useChatMessages } from "@/hooks/use-chat-messages";

// Constants for random ID generation
const RANDOM_ID_BASE = 36;
const RANDOM_ID_SUBSTRING_START = 7;

type Note = {
  id: string;
  content: string;
  timestamp: Date;
  type: "summary" | "action" | "data";
};

type ExtractedData = {
  [key: string]: string | number | boolean;
};

function getNoteClassName(type: Note["type"]): string {
  if (type === "action") {
    return "border-blue-500 bg-blue-50 dark:bg-blue-950";
  }
  if (type === "data") {
    return "border-green-500 bg-green-50 dark:bg-green-950";
  }
  return "border-gray-300 bg-gray-50 dark:bg-gray-900";
}

export function ConversationPanel() {
  const chatMessages = useChatMessages();
  const [notes, setNotes] = useState<Note[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const room = useRoomContext();

  // Debug: Log component mount and room state
  useEffect(() => {
    console.log("[CONVERSATION] Component mounted");
    console.log("[CONVERSATION] Room state:", room ? "connected" : "not connected");
    if (room) {
      console.log("[CONVERSATION] Room details:", {
        name: room.name,
        state: room.state,
        participants: room.remoteParticipants?.size || 0,
      });
    }
  }, [room]);

  // Listen for data messages from LiveKit agent
  useEffect(() => {
    if (!room) {
      console.log("[CONVERSATION] No room available, skipping data listener setup");
      return;
    }

    console.log("[CONVERSATION] Setting up data listener for room:", room.name);

    const handleDataReceived = (payload: Uint8Array, participant: any, kind: any) => {
      console.log("[CONVERSATION] ========== DATA RECEIVED ==========");
      console.log("[CONVERSATION] Payload length:", payload.length);
      console.log("[CONVERSATION] Participant:", participant?.identity || "unknown");
      console.log("[CONVERSATION] Kind:", kind);

      try {
        const decoded = new TextDecoder().decode(payload);
        console.log("[CONVERSATION] Decoded string:", decoded);

        const message = JSON.parse(decoded);
        console.log("[CONVERSATION] Parsed message:", message);
        console.log("[CONVERSATION] Message action:", message.action);

        if (message.action === "addNote") {
          console.log("[CONVERSATION] Processing addNote action");
          const newNote: Note = {
            id: Math.random().toString(RANDOM_ID_BASE).substring(RANDOM_ID_SUBSTRING_START),
            content: message.content,
            timestamp: new Date(message.timestamp),
            type: message.type as Note["type"],
          };
          console.log("[CONVERSATION] Created note:", newNote);
          setNotes((prev) => {
            console.log("[CONVERSATION] Adding note to state, current count:", prev.length);
            return [...prev, newNote];
          });
          console.log("[CONVERSATION] Note added successfully");
        } else if (message.action === "updateData") {
          console.log("[CONVERSATION] Processing updateData action");
          console.log("[CONVERSATION] Field:", message.field, "Value:", message.value);
          setExtractedData((prev) => {
            const updated = { ...prev, [message.field]: message.value };
            console.log("[CONVERSATION] Updated data state:", updated);
            return updated;
          });
          console.log("[CONVERSATION] Data updated successfully");
        } else {
          console.warn("[CONVERSATION] Unknown action:", message.action);
        }
      } catch (error) {
        console.error("[CONVERSATION] Failed to parse data message:", error);
        console.error("[CONVERSATION] Raw payload:", payload);
      }
    };

    console.log("[CONVERSATION] Registering DataReceived event handler");
    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      console.log("[CONVERSATION] Cleaning up data listener");
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  // Make conversation state readable by CopilotKit
  useCopilotReadable({
    description: "Current conversation messages and context",
    value: chatMessages.map((msg) => ({
      role: msg.from?.identity || "unknown",
      message: msg.message,
      timestamp: msg.timestamp,
    })),
  });

  // Action to add notes from the agent
  useCopilotAction({
    name: "addNote",
    description: "Add a note from the conversation",
    parameters: [
      {
        name: "content",
        type: "string",
        description: "The note content",
        required: true,
      },
      {
        name: "type",
        type: "string",
        description: "Type of note: summary, action, or data",
        enum: ["summary", "action", "data"],
        required: false,
      },
    ],
    handler: ({ content, type = "summary" }) => {
      const newNote: Note = {
        id: Math.random().toString(RANDOM_ID_BASE).substring(RANDOM_ID_SUBSTRING_START),
        content,
        timestamp: new Date(),
        type: type as Note["type"],
      };
      setNotes((prev) => [...prev, newNote]);
      return `Note added: ${content}`;
    },
  });

  // Action to extract and update data
  useCopilotAction({
    name: "updateData",
    description: "Update extracted data from conversation",
    parameters: [
      {
        name: "field",
        type: "string",
        description: "The field name",
        required: true,
      },
      {
        name: "value",
        type: "string",
        description: "The field value",
        required: true,
      },
    ],
    handler: ({ field, value }) => {
      setExtractedData((prev) => ({ ...prev, [field]: value }));
      return `Updated ${field} to ${value}`;
    },
  });

  // Note: Auto-generation of notes removed to prevent duplicates
  // The agent should use the addNote and updateData CopilotKit actions instead

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Notes Section */}
      <Card className="flex-1 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Conversation Notes</h3>
        </div>

        <ScrollArea className="h-[200px]">
          {notes.length === 0 ? (
            <div className="text-muted-foreground text-sm italic">
              Notes will appear here as you speak...
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  className={`rounded-md border-l-2 p-2 text-sm ${getNoteClassName(note.type)}`}
                  key={note.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1">{note.content}</p>
                    <span className="whitespace-nowrap text-muted-foreground text-xs">
                      {note.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Extracted Data Section */}
      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-sm">Extracted Data</h3>

        {Object.keys(extractedData).length === 0 ? (
          <div className="text-muted-foreground text-sm italic">
            Data fields will populate as information is collected...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(extractedData).map(([key, value]) => (
              <div className="space-y-1" key={key}>
                <div className="font-medium text-muted-foreground text-xs capitalize">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="rounded-md bg-muted p-2 font-mono text-sm">{String(value)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Live Transcript */}
      <Card className="flex-1 p-4">
        <h3 className="mb-3 font-semibold text-sm">Live Transcript</h3>

        <ScrollArea className="h-[200px]">
          {chatMessages.length === 0 ? (
            <div className="text-muted-foreground text-sm italic">
              Conversation transcript will appear here...
            </div>
          ) : (
            <div className="space-y-2">
              {chatMessages.map((msg, idx) => (
                <div className="text-sm" key={idx}>
                  <span className="font-medium text-muted-foreground text-xs">
                    {msg.from?.isAgent ? "Agent" : "You"}:{" "}
                  </span>
                  <span>{msg.message}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
