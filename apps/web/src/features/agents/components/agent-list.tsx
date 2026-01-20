"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Doc } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { CardEmptyState } from "@starter-saas/ui/card-empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@starter-saas/ui/table";
import { Bot, Pencil, Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryWithStatus } from "@/lib/convex-hooks";

type Agent = Doc<"agents">;

export function AgentList() {
  const router = useRouter();
  const { data: agents, isPending } = useQueryWithStatus(api.agents.list, {
    type: undefined,
    isActive: undefined,
    organizationId: undefined,
    limit: undefined,
  });

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div className="h-16 animate-pulse rounded-lg border bg-card" key={i} />
        ))}
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <CardEmptyState
        action={
          <Button onClick={() => router.push("/agents/new" as Parameters<typeof router.push>[0])}>
            <Plus className="mr-2 size-4" />
            Create Your First Agent
          </Button>
        }
        description="Create your first AI agent to start automating tasks"
        icon={Bot}
        title="No agents yet"
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fields</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent: Agent) => (
            <AgentRow agent={agent} key={agent._id} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AgentRow({ agent }: { agent: Agent }) {
  const router = useRouter();
  const fieldCount = agent.dataSchema?.fields?.length ?? 0;
  const updatedDate = agent.updatedAt ?? agent._creationTime;

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/agents/${agent._id}` as Parameters<typeof router.push>[0])}
    >
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{agent.name}</span>
          {agent.description && (
            <span className="line-clamp-1 text-muted-foreground text-xs">{agent.description}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{agent.type ?? "chat"}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={agent.isActive !== false ? "default" : "secondary"}>
          {agent.isActive !== false ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-sm">{fieldCount} fields</span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-sm">
          {new Date(updatedDate).toLocaleDateString()}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/agents/${agent._id}` as Parameters<typeof router.push>[0]);
            }}
            size="sm"
            variant="ghost"
          >
            <Pencil className="mr-1 size-4" />
            Edit
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/agents/${agent._id}/test` as Parameters<typeof router.push>[0]);
            }}
            size="sm"
            variant="ghost"
          >
            <Play className="mr-1 size-4" />
            Test
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
