"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { CardEmptyState } from "@starter-saas/ui/card-empty-state";
import { DataTable } from "@starter-saas/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@starter-saas/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Download, MoreVertical, PhoneCall, Play } from "lucide-react";
import { useMemo } from "react";

const PASSING_SCORE_THRESHOLD = 70;

type Call = {
  id: string;
  timestamp: Date;
  agent: string;
  contact: string;
  duration: string;
  status: "completed" | "failed" | "no-answer";
  score?: number;
};

export default function CallHistoryPage() {
  // Mock data - replace with actual Convex query
  const calls: Call[] = [];

  // Define columns for DataTable
  const columns = useMemo<ColumnDef<Call>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Time",
        cell: ({ row }) => (
          <div className="text-sm">
            {formatDistanceToNow(row.original.timestamp, { addSuffix: true })}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "agent",
        header: "Agent",
        cell: ({ row }) => <div className="font-medium">{row.original.agent}</div>,
        enableSorting: true,
      },
      {
        accessorKey: "contact",
        header: "Contact",
        enableSorting: true,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "completed" ? "secondary" : "outline"}>
            {row.original.status}
          </Badge>
        ),
        enableSorting: true,
        enableFiltering: true,
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: ({ row }) => {
          const { score } = row.original;
          if (!score) {
            return null;
          }
          return (
            <Badge variant={score >= PASSING_SCORE_THRESHOLD ? "default" : "destructive"}>
              {score}%
            </Badge>
          );
        },
        enableSorting: true,
        enableFiltering: true,
      },
      {
        id: "actions",
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8" size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Play className="mr-2 h-4 w-4" />
                Play Recording
              </DropdownMenuItem>
              <DropdownMenuItem>View Transcript</DropdownMenuItem>
              <DropdownMenuItem>View Data</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  // Handle export action
  const handleExport = (selectedRows: Call[]) => {
    console.log("Exporting calls:", selectedRows);
    // TODO: Implement export functionality
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Call History</h1>
          <p className="text-muted-foreground">
            View and analyze all voice calls made by your agents
          </p>
        </div>
      </div>

      {calls.length === 0 ? (
        <CardEmptyState
          description="When your agents start making calls, they'll appear here with recordings and analytics"
          icon={PhoneCall}
          title="No calls yet"
        />
      ) : (
        <DataTable
          batchActions={[
            {
              action: "export",
              label: "Export Selected",
              icon: Download,
              onClick: handleExport,
            },
          ]}
          columns={columns}
          data={calls}
          defaultView="table"
          emptyStateMessage="No calls found matching your search."
          enabledViews={["table", "list"]}
          enableFiltering
          enablePagination
          enableSearch
          enableSelection
          enableSorting
          enableViewSwitcher
          onBatchExport={handleExport}
          searchPlaceholder="Search calls by agent, contact, or status..."
          showDefaultBatchActions
        />
      )}
    </div>
  );
}
