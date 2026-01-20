"use client";

import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { CardEmptyState } from "@starter-saas/ui/card-empty-state";
import { DashboardMain } from "@starter-saas/ui/dashboard-layout";
import { DataTable } from "@starter-saas/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@starter-saas/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, MoreVertical, Plus, Trash2, Upload } from "lucide-react";
import { useMemo } from "react";

type Document = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploaded: string;
  status: "processed" | "processing" | "failed";
};

export default function KnowledgeBasePage() {
  // Mock data - replace with actual Convex query
  const documents: Document[] = [];

  // Define columns for DataTable
  const columns = useMemo<ColumnDef<Document>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Document Name",
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        enableSorting: true,
      },
      {
        accessorKey: "type",
        header: "Type",
        enableSorting: true,
        enableFiltering: true,
      },
      {
        accessorKey: "size",
        header: "Size",
        enableSorting: true,
      },
      {
        accessorKey: "uploaded",
        header: "Uploaded",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          let variant: "secondary" | "outline" | "destructive";
          if (status === "processed") {
            variant = "secondary";
          } else if (status === "processing") {
            variant = "outline";
          } else {
            variant = "destructive";
          }
          return <Badge variant={variant}>{status}</Badge>;
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
              <DropdownMenuItem>View</DropdownMenuItem>
              <DropdownMenuItem>Download</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  // Handle batch delete
  const handleBatchDelete = (selectedRows: Document[]) => {
    console.log("Deleting documents:", selectedRows);
    // TODO: Implement batch delete functionality
  };

  return (
    <DashboardMain>
      <div className="flex-1 space-y-6 p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">Knowledge Base</h1>
            <p className="text-muted-foreground">
              Upload and manage documents that your agents can reference
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {documents.length === 0 ? (
          <CardEmptyState
            action={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Your First Document
              </Button>
            }
            description="Upload documents like PDFs, text files, or URLs to provide context to your voice AI agents"
            icon={FileText}
            title="No documents yet"
          />
        ) : (
          <DataTable
            batchActions={[
              {
                action: "delete",
                label: "Delete Selected",
                icon: Trash2,
                onClick: handleBatchDelete,
                variant: "destructive",
              },
            ]}
            columns={columns}
            data={documents}
            defaultView="table"
            emptyStateMessage="No documents found matching your search."
            enabledViews={["table", "list", "gallery"]}
            enableFiltering
            enablePagination
            enableSearch
            enableSelection
            enableSorting
            enableViewSwitcher
            onBatchDelete={handleBatchDelete}
            searchPlaceholder="Search documents by name, type, or status..."
            showDefaultBatchActions
          />
        )}
      </div>
    </DashboardMain>
  );
}
