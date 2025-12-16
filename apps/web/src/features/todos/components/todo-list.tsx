"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import { CardEmptyState } from "@starter-saas/ui/card-empty-state";
import { useQuery } from "convex/react";
import { ClipboardList } from "lucide-react";
import { TodoItem } from "./todo-item";

export function TodoList() {
  const todos = useQuery(api.todos.list, {});

  if (todos === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-lg border bg-card animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <CardEmptyState
        icon={ClipboardList}
        title="No todos yet"
        description="Create your first todo to get started"
      />
    );
  }

  // Sort: pending first, then in_progress, then completed
  const sortedTodos = [...todos].sort((a, b) => {
    const order = { pending: 0, in_progress: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-3">
      {sortedTodos.map((todo) => (
        <TodoItem key={todo._id} todo={todo} />
      ))}
    </div>
  );
}
