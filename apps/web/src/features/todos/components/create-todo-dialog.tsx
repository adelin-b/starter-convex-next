"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trans } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import { todoPriorities } from "@starter-saas/backend/convex/schema";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@starter-saas/ui/form";
import { Input } from "@starter-saas/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import { Textarea } from "@starter-saas/ui/textarea";
import {
  getConvexErrorMessage,
  useConvexFormErrors,
} from "@starter-saas/ui/use-convex-form-errors";
import { useMutation } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schema derived from backend types
const CreateTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  priority: z.enum(todoPriorities).optional(),
});

type CreateTodoData = z.infer<typeof CreateTodoSchema>;

// Priority display labels
const priorityLabels: Record<(typeof todoPriorities)[number], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function CreateTodoDialog() {
  const [open, setOpen] = useState(false);
  const createTodo = useMutation(api.todos.create);

  const form = useForm<CreateTodoData>({
    resolver: zodResolver(CreateTodoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: undefined,
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = form;

  const { handleConvexError } = useConvexFormErrors(form);

  const onSubmit = async (data: CreateTodoData) => {
    try {
      await createTodo({
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        priority: data.priority,
        dueDate: undefined,
      });
      reset();
      setOpen(false);
      toast.success("Todo created successfully");
    } catch (error) {
      if (handleConvexError(error)) {
        return;
      }
      toast.error(getConvexErrorMessage(error, "Failed to create todo"));
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            <Trans>New Todo</Trans>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans>Create Todo</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Add a new todo to your list. Fill in the details below.</Trans>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Title</Trans>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="What needs to be done?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Description (optional)</Trans>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans>Priority (optional)</Trans>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {todoPriorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priorityLabels[priority]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button onClick={() => setOpen(false)} type="button" variant="outline">
                <Trans>Cancel</Trans>
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    <Trans>Creating...</Trans>
                  </>
                ) : (
                  <Trans>Create Todo</Trans>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
