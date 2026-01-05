import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import { todoPriorities, todoStatuses } from "./schema";

// Create args schema
const CreateTodoArgsSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  priority: z.enum(todoPriorities).optional(),
  dueDate: z.number().int().positive().optional(),
});

// Update args schema
const UpdateTodoArgsSchema = z.object({
  id: zid("todos"),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(todoPriorities).optional(),
  status: z.enum(todoStatuses).optional(),
  dueDate: z.number().int().positive().optional(),
});

/**
 * List all todos for the current user
 */
export const list = zodQuery({
  args: {
    status: z.enum(todoStatuses).optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view todos");
    }

    if (args.status) {
      const status = args.status;
      return await context.db
        .query("todos")
        .withIndex("by_user_status", (q) => q.eq("userId", identity.subject).eq("status", status))
        .collect();
    }

    return await context.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

/**
 * Get a single todo by ID
 */
export const getById = zodQuery({
  args: { id: zid("todos") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view todo");
    }

    const todo = await context.db.get(id);
    if (!todo) {
      throw AppErrors.notFound("Todo", id);
    }

    // Ensure user owns this todo
    if (todo.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this todo");
    }

    return todo;
  },
});

/**
 * Create a new todo
 */
export const create = zodMutation({
  args: CreateTodoArgsSchema.shape,
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create todo");
    }

    const now = Date.now();
    return await context.db.insert("todos", {
      ...args,
      status: "pending",
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing todo
 */
export const update = zodMutation({
  args: UpdateTodoArgsSchema.shape,
  handler: async (context, { id, ...updates }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update todo");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Todo", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this todo");
    }

    const now = Date.now();
    let completedAt: number | undefined;
    if (updates.status === "completed" && existing.status !== "completed") {
      completedAt = now;
    } else if (updates.status === "completed") {
      completedAt = existing.completedAt;
    }

    await context.db.patch(id, {
      ...updates,
      updatedAt: now,
      completedAt,
    });

    return id;
  },
});

/**
 * Delete a todo
 */
export const remove = zodMutation({
  args: { id: zid("todos") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("delete todo");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Todo", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("delete this todo");
    }

    await context.db.delete(id);
    return { success: true };
  },
});

/**
 * Toggle todo completion status
 */
export const toggleComplete = zodMutation({
  args: { id: zid("todos") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("toggle todo");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Todo", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("toggle this todo");
    }

    const now = Date.now();
    const newStatus = existing.status === "completed" ? "pending" : "completed";
    const completedAt = newStatus === "completed" ? now : undefined;

    await context.db.patch(id, {
      status: newStatus,
      updatedAt: now,
      completedAt,
    });

    return { id, status: newStatus };
  },
});
