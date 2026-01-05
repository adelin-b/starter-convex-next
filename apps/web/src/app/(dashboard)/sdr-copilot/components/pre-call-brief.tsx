"use client";

// UI constants
const MAX_DISPLAYED_CALLS = 3;

import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Separator } from "@starter-saas/ui/separator";
import { formatDistanceToNow } from "date-fns";
import {
  Building2,
  Calendar,
  Clock,
  Edit,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  User,
} from "lucide-react";

type ProspectBrief = {
  prospect: {
    _id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber: string;
    email?: string;
    company?: string;
    title?: string;
    status: string;
    notes?: string;
    tags?: string[];
    totalCallAttempts: number;
    lastContactedAt?: number;
    lastCallResult?: string;
  };
  callHistory: Array<{
    _id: string;
    createdAt: number;
    outcome?: string;
    duration?: number;
    notes?: string;
  }>;
  prepNotes?: {
    briefSummary: string;
    talkingPoints: string[];
    suggestedArguments: string[];
    vehicleInterests?: string[];
  } | null;
  script?: {
    name: string;
    category?: string;
  } | null;
  stats: {
    totalCalls: number;
    lastContactAt?: number;
    lastOutcome?: string;
  };
};

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    new: "bg-blue-500",
    contacted: "bg-yellow-500",
    interested: "bg-green-500",
    meeting_scheduled: "bg-emerald-500",
    callback_scheduled: "bg-orange-500",
    not_interested: "bg-red-500",
    invalid_contact: "bg-gray-500",
    do_not_call: "bg-red-700",
  };
  return colors[status] || "bg-gray-500";
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function ContactCard({
  prospect,
  fullName,
}: {
  prospect: ProspectBrief["prospect"];
  fullName: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{fullName}</CardTitle>
              {prospect.company && (
                <p className="text-muted-foreground text-sm">
                  {prospect.title ? `${prospect.title} at ` : ""}
                  {prospect.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor(prospect.status)}`} />
            <span className="text-sm">{formatStatus(prospect.status)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{prospect.phoneNumber}</span>
          </div>
          {prospect.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{prospect.email}</span>
            </div>
          )}
          {prospect.company && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{prospect.company}</span>
            </div>
          )}
        </div>
        {prospect.tags && prospect.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {prospect.tags.map((tag) => (
              <Badge className="text-xs" key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CallStatsCard({
  stats,
  callHistory,
}: {
  stats: ProspectBrief["stats"];
  callHistory: ProspectBrief["callHistory"];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PhoneCall className="h-4 w-4" />
          Call History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-3">
            <p className="font-bold text-2xl">{stats.totalCalls}</p>
            <p className="text-muted-foreground text-xs">Total Calls</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="font-medium text-sm">
              {stats.lastOutcome ? formatStatus(stats.lastOutcome) : "—"}
            </p>
            <p className="text-muted-foreground text-xs">Last Outcome</p>
          </div>
        </div>

        {stats.lastContactAt && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="h-4 w-4" />
            <span>
              Last contact:{" "}
              {formatDistanceToNow(new Date(stats.lastContactAt), { addSuffix: true })}
            </span>
          </div>
        )}

        {callHistory.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <p className="font-medium text-sm">Recent Calls</p>
            {callHistory.slice(0, MAX_DISPLAYED_CALLS).map((call) => (
              <div
                className="flex items-center justify-between rounded-md bg-muted/50 p-2 text-xs"
                key={call._id}
              >
                <span>{formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}</span>
                <Badge className="text-xs" variant="outline">
                  {call.outcome || "No outcome"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NotesCard({
  prospect,
  prepNotes,
}: {
  prospect: ProspectBrief["prospect"];
  prepNotes: ProspectBrief["prepNotes"];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Notes & Prep
          </CardTitle>
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {prospect.notes && (
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground text-xs">NOTES</p>
            <p className="text-sm">{prospect.notes}</p>
          </div>
        )}

        {prepNotes?.briefSummary && (
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground text-xs">BRIEF</p>
            <p className="text-sm">{prepNotes.briefSummary}</p>
          </div>
        )}

        {prepNotes?.talkingPoints && prepNotes.talkingPoints.length > 0 && (
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground text-xs">TALKING POINTS</p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {prepNotes.talkingPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {prepNotes?.vehicleInterests && prepNotes.vehicleInterests.length > 0 && (
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground text-xs">VEHICLE INTERESTS</p>
            <div className="flex flex-wrap gap-1">
              {prepNotes.vehicleInterests.map((vehicle) => (
                <Badge className="text-xs" key={vehicle} variant="outline">
                  {vehicle}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!(prospect.notes || prepNotes) && (
          <div className="py-4 text-center text-muted-foreground text-sm">
            <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No prep notes yet</p>
            <Button size="sm" variant="link">
              Add talking points
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PreCallBrief({ brief }: { brief: ProspectBrief }) {
  const { prospect, callHistory, prepNotes, stats } = brief;

  const fullName =
    prospect.firstName || prospect.lastName
      ? `${prospect.firstName || ""} ${prospect.lastName || ""}`.trim()
      : "Unknown Contact";

  return (
    <div className="space-y-4">
      <ContactCard fullName={fullName} prospect={prospect} />
      <CallStatsCard callHistory={callHistory} stats={stats} />
      <NotesCard prepNotes={prepNotes} prospect={prospect} />
    </div>
  );
}
