"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import { CardEmptyState } from "@starter-saas/ui/card-empty-state";
import { ClipboardList } from "lucide-react";
import { useQueryWithStatus } from "@/lib/convex-hooks";
import { TodoItem } from "./todo-item";

export function TodoList() {
  const { data: todos, isPending } = useQueryWithStatus(api.todos.list, {});

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div className="h-16 animate-pulse rounded-lg border bg-card" key={i} />
        ))}
      </div>
    );
  }

  // Handle case when query returns undefined (auth loading, error, etc.)
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
  const sortedTodos = [...todos].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, in_progress: 1, completed: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  return (
    <div className="space-y-3">
      {sortedTodos.map((todo) => (
        <TodoItem key={todo._id} todo={todo} />
      ))}
    </div>
  );
}
