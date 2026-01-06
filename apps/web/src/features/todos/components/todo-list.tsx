"use client";

import { t } from "@lingui/core/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { TodoStatus } from "@starter-saas/backend/convex/schema";
import { assertNever } from "@starter-saas/shared/assert-never";
import { CardEmptyState } from "@starter-saas/ui/card-empty-state";
import { AlertCircle, ClipboardList } from "lucide-react";
import { useQueryWithStatus } from "@/lib/convex-hooks";
import { TodoItem } from "./todo-item";

/**
 * Get sort order for todo status.
 * Uses exhaustive switch with assertNever for compile-time safety.
 */
function getStatusOrder(status: TodoStatus): number {
  switch (status) {
    case "pending":
      return 0;
    case "in_progress":
      return 1;
    case "completed":
      return 2;
    default:
      assertNever(status);
  }
}

export function TodoList() {
  const {
    data: todos,
    isPending,
    isError,
    error,
  } = useQueryWithStatus(api.todos.list, { status: undefined });

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div className="h-16 animate-pulse rounded-lg border bg-card" key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        <span>{error?.message ?? t`Failed to load todos`}</span>
      </div>
    );
  }

  // Handle case when query returns undefined or empty
  if (!todos || todos.length === 0) {
    return (
      <CardEmptyState
        description="Create your first todo to get started"
        icon={ClipboardList}
        title="No todos yet"
      />
    );
  }

  // Sort: pending first, then in_progress, then completed
  const sortedTodos = [...todos].sort(
    (a, b) => getStatusOrder(a.status) - getStatusOrder(b.status),
  );

  return (
    <div className="space-y-3">
      {sortedTodos.map((todo) => (
        <TodoItem key={todo._id} todo={todo} />
      ))}
    </div>
  );
}
