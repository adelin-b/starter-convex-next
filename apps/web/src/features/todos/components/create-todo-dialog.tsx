"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { todoPriorities } from "@starter-saas/backend/convex/schema";
import { Button } from "@starter-saas/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@starter-saas/ui/dialog";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import { Textarea } from "@starter-saas/ui/textarea";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";

export function CreateTodoDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<(typeof todoPriorities)[number] | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTodo = useMutation(api.todos.create);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await createTodo({
          title: title.trim(),
          description: description.trim() || undefined,
          priority: priority || undefined,
        });
        setOpen(false);
        setTitle("");
        setDescription("");
        setPriority("");
      } finally {
        setIsSubmitting(false);
      }
    },
    [createTodo, title, description, priority],
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New Todo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Todo</DialogTitle>
            <DialogDescription>
              Add a new todo to your list. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
                value={title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={3}
                value={description}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority (optional)</Label>
              <Select
                onValueChange={(value) => setPriority(value as (typeof todoPriorities)[number])}
                value={priority}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSubmitting || !title.trim()} type="submit">
              {isSubmitting ? "Creating..." : "Create Todo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
