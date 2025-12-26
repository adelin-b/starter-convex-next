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
import { Download, MessageSquare, MoreVertical } from "lucide-react";
import { useMemo } from "react";

type Chat = {
  id: string;
  timestamp: Date;
  agent: string;
  user: string;
  messageCount: number;
  duration: string;
  status: "completed" | "in-progress" | "abandoned";
};

export default function ChatHistoryPage() {
  // Mock data - replace with actual Convex query
  const chats: Chat[] = [];

  // Define columns for DataTable
  const columns = useMemo<ColumnDef<Chat>[]>(
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
        accessorKey: "user",
        header: "User",
        enableSorting: true,
      },
      {
        accessorKey: "messageCount",
        header: "Messages",
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
        id: "actions",
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8" size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Transcript</DropdownMenuItem>
              <DropdownMenuItem>View Data</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  // Handle export action
  const handleExport = (selectedRows: Chat[]) => {
    console.log("Exporting chats:", selectedRows);
    // TODO: Implement export functionality
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Chat History</h1>
          <p className="text-muted-foreground">
            View and analyze all chat conversations with your agents
          </p>
        </div>
      </div>

      {chats.length === 0 ? (
        <CardEmptyState
          description="When users interact with your agents via chat, conversations will appear here with full transcripts"
          icon={MessageSquare}
          title="No chat conversations yet"
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
          data={chats}
          defaultView="table"
          emptyStateMessage="No conversations found matching your search."
          enabledViews={["table", "list", "feed"]}
          enableFiltering
          enablePagination
          enableSearch
          enableSelection
          enableSorting
          enableViewSwitcher
          feedTimestampColumn="timestamp"
          onBatchExport={handleExport}
          searchPlaceholder="Search conversations by agent, user, or status..."
          showDefaultBatchActions
        />
      )}
    </div>
  );
}
