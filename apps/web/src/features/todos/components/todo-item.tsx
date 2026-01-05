"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Doc } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Checkbox } from "@starter-saas/ui/checkbox";
import { cn } from "@starter-saas/ui/utils";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useCallback } from "react";

type TodoItemProps = {
  todo: Doc<"todos">;
};

const priorityColors = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
} as const;

export function TodoItem({ todo }: TodoItemProps) {
  const toggleComplete = useMutation(api.todos.toggleComplete);
  const removeTodo = useMutation(api.todos.remove);

  const handleToggle = useCallback(async () => {
    await toggleComplete({ id: todo._id });
  }, [toggleComplete, todo._id]);

  const handleDelete = useCallback(async () => {
    await removeTodo({ id: todo._id });
  }, [removeTodo, todo._id]);

  const isCompleted = todo.status === "completed";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-4 transition-opacity",
        isCompleted && "opacity-60",
      )}
    >
      <Checkbox
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        checked={isCompleted}
        onCheckedChange={handleToggle}
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-medium",
            isCompleted && "text-muted-foreground line-through",
          )}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-0.5 truncate text-muted-foreground text-sm">{todo.description}</p>
        )}
      </div>

      {todo.priority && (
        <Badge className={priorityColors[todo.priority]} variant="outline">
          {todo.priority}
        </Badge>
      )}

      <Button
        aria-label="Delete todo"
        className="text-muted-foreground hover:text-destructive"
        onClick={handleDelete}
        size="icon-sm"
        variant="ghost"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
