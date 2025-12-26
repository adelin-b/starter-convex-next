"use client";

import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { CardEmptyState } from "@starter-saas/ui/card-empty-state";
import type { DataTableColumn } from "@starter-saas/ui/data-table";
import { DataTable } from "@starter-saas/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@starter-saas/ui/dropdown-menu";
import { Progress } from "@starter-saas/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Pause, PhoneCall, Play, Plus, Upload } from "lucide-react";
import { useMemo } from "react";

const PERCENTAGE_MULTIPLIER = 100;

function getCampaignBadgeVariant(status: string) {
  if (status === "running") {
    return "default";
  }
  if (status === "completed") {
    return "secondary";
  }
  return "outline";
}

type Campaign = {
  id: string;
  name: string;
  agent: string;
  status: "running" | "paused" | "completed" | "canceled";
  createdAt: Date;
  total: number;
  completed: number;
  successful: number;
  failed: number;
  pending: number;
};

export default function BatchCallPage() {
  // Mock data - replace with actual Convex query
  const campaigns: Campaign[] = [];

  // Define columns for DataTable
  const columns = useMemo<DataTableColumn<Campaign>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Campaign Name",
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        enableSorting: true,
      },
      {
        id: "agent",
        accessorKey: "agent",
        header: "Agent",
        enableSorting: true,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={getCampaignBadgeVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
        enableSorting: true,
        enableFiltering: true,
      },
      {
        id: "progress",
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => {
          const progress = (row.original.completed / row.original.total) * PERCENTAGE_MULTIPLIER;
          return (
            <div className="space-y-1">
              <div className="text-sm">
                {row.original.completed} / {row.original.total}
              </div>
              <Progress className="h-2 w-24" value={progress} />
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "successful",
        accessorKey: "successful",
        header: "Successful",
        cell: ({ row }) => (
          <span className="font-medium text-green-600">{row.original.successful}</span>
        ),
        enableSorting: true,
      },
      {
        id: "failed",
        accessorKey: "failed",
        header: "Failed",
        cell: ({ row }) => <span className="font-medium text-red-600">{row.original.failed}</span>,
        enableSorting: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm">
            {formatDistanceToNow(row.original.createdAt, { addSuffix: true })}
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.status === "running" && (
              <Button size="sm" variant="outline">
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {row.original.status === "paused" && (
              <Button size="sm" variant="outline">
                <Play className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8" size="icon" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Export Results</DropdownMenuItem>
                <DropdownMenuSeparator />
                {row.original.status === "paused" && <DropdownMenuItem>Resume</DropdownMenuItem>}
                <DropdownMenuItem className="text-destructive">Cancel Campaign</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Batch Call</h1>
          <p className="text-muted-foreground">Create and manage bulk calling campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <CardEmptyState
          action={
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          }
          description="Create your first batch call campaign by uploading a CSV file with contact information"
          icon={PhoneCall}
          title="No campaigns yet"
        />
      ) : (
        <DataTable
          columns={columns}
          data={campaigns}
          defaultView="table"
          emptyStateMessage="No campaigns found matching your search."
          enabledViews={["table", "list"]}
          enableFiltering
          enablePagination
          enableSearch
          enableSorting
          enableViewSwitcher
          searchPlaceholder="Search campaigns by name, agent, or status..."
          showDefaultBatchActions={false}
        />
      )}
    </div>
  );
}
