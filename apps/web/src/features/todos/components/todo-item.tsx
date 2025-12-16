"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Doc } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Checkbox } from "@starter-saas/ui/checkbox";
import { cn } from "@starter-saas/ui/utils";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useCallback } from "react";

interface TodoItemProps {
  todo: Doc<"todos">;
}

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
        isCompleted && "opacity-60"
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium truncate",
            isCompleted && "line-through text-muted-foreground"
          )}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {todo.description}
          </p>
        )}
      </div>

      {todo.priority && (
        <Badge variant="outline" className={priorityColors[todo.priority]}>
          {todo.priority}
        </Badge>
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleDelete}
        aria-label="Delete todo"
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
