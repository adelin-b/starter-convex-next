import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("../**/*.ts");

describe("todos", () => {
  describe("list", () => {
    it("returns empty array when no todos exist", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      const todos = await asUser.query(api.todos.list, { status: undefined });
      expect(todos).toEqual([]);
    });

    it("returns only authenticated user's todos", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

      await asSarah.mutation(api.todos.create, {
        title: "Sarah's task",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      await asTom.mutation(api.todos.create, {
        title: "Tom's task",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });

      const sarahTodos = await asSarah.query(api.todos.list, { status: undefined });
      expect(sarahTodos).toHaveLength(1);
      expect(sarahTodos[0].title).toBe("Sarah's task");

      const tomTodos = await asTom.query(api.todos.list, { status: undefined });
      expect(tomTodos).toHaveLength(1);
      expect(tomTodos[0].title).toBe("Tom's task");
    });

    it("filters by status when provided", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const todoId = await asUser.mutation(api.todos.create, {
        title: "Task 1",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      await asUser.mutation(api.todos.create, {
        title: "Task 2",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      await asUser.mutation(api.todos.update, {
        id: todoId,
        title: undefined,
        description: undefined,
        priority: undefined,
        status: "completed",
        dueDate: undefined,
      });

      const pendingTodos = await asUser.query(api.todos.list, { status: "pending" });
      expect(pendingTodos).toHaveLength(1);
      expect(pendingTodos[0].title).toBe("Task 2");

      const completedTodos = await asUser.query(api.todos.list, { status: "completed" });
      expect(completedTodos).toHaveLength(1);
      expect(completedTodos[0].title).toBe("Task 1");
    });

    it("throws error when not authenticated", async () => {
      const t = convexTest(schema, modules);

      await expect(t.query(api.todos.list, { status: undefined })).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("returns the requested todo", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const todoId = await asUser.mutation(api.todos.create, {
        title: "My Task",
        description: "Description here",
        priority: "high",
        dueDate: undefined,
      });

      const todo = await asUser.query(api.todos.getById, { id: todoId });
      expect(todo).toMatchObject({
        title: "My Task",
        description: "Description here",
        priority: "high",
        status: "pending",
      });
    });

    it("throws error when accessing other user's todo", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

      const todoId = await asSarah.mutation(api.todos.create, {
        title: "Sarah's task",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });

      await expect(asTom.query(api.todos.getById, { id: todoId })).rejects.toThrow(/permission/i);
    });
  });

  describe("create", () => {
    it("creates a new todo with required fields", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const todoId = await asUser.mutation(api.todos.create, {
        title: "New Task",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      expect(todoId).toBeDefined();

      const todo = await asUser.query(api.todos.getById, { id: todoId });
      expect(todo.title).toBe("New Task");
      expect(todo.status).toBe("pending");
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });

    it("creates todo with optional fields", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const dueDate = Date.now() + 86_400_000; // Tomorrow
      const todoId = await asUser.mutation(api.todos.create, {
        title: "Task with details",
        description: "A detailed description",
        priority: "high",
        dueDate,
      });

      const todo = await asUser.query(api.todos.getById, { id: todoId });
      expect(todo).toMatchObject({
        title: "Task with details",
        description: "A detailed description",
        priority: "high",
        dueDate,
      });
    });

    it("throws error when not authenticated", async () => {
      const t = convexTest(schema, modules);

      await expect(
        t.mutation(api.todos.create, {
          title: "Task",
          description: undefined,
          priority: undefined,
          dueDate: undefined,
        }),
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("updates todo fields", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const todoId = await asUser.mutation(api.todos.create, {
        title: "Original",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      await asUser.mutation(api.todos.update, {
        id: todoId,
        title: "Updated Title",
        description: undefined,
        priority: "medium",
        status: undefined,
        dueDate: undefined,
      });

      const todo = await asUser.query(api.todos.getById, { id: todoId });
      expect(todo.title).toBe("Updated Title");
      expect(todo.priority).toBe("medium");
    });

    it("sets completedAt when status changes to completed", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const todoId = await asUser.mutation(api.todos.create, {
        title: "Task",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      await asUser.mutation(api.todos.update, {
        id: todoId,
        title: undefined,
        description: undefined,
        priority: undefined,
        status: "completed",
        dueDate: undefined,
      });

      const todo = await asUser.query(api.todos.getById, { id: todoId });
      expect(todo.status).toBe("completed");
      expect(todo.completedAt).toBeDefined();
    });

    it("throws error when updating other user's todo", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

      const todoId = await asSarah.mutation(api.todos.create, {
        title: "Sarah's task",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });

      await expect(
        asTom.mutation(api.todos.update, {
          id: todoId,
          title: "Hacked",
          description: undefined,
          priority: undefined,
          status: undefined,
          dueDate: undefined,
        }),
      ).rejects.toThrow(/permission/i);
    });
  });

  describe("remove", () => {
    it("deletes the todo", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const todoId = await asUser.mutation(api.todos.create, {
        title: "To Delete",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      const result = await asUser.mutation(api.todos.remove, { id: todoId });

      expect(result).toEqual({ success: true });

      const todos = await asUser.query(api.todos.list, { status: undefined });
      expect(todos).toHaveLength(0);
    });

    it("throws error when deleting other user's todo", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

      const todoId = await asSarah.mutation(api.todos.create, {
        title: "Sarah's task",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });

      await expect(asTom.mutation(api.todos.remove, { id: todoId })).rejects.toThrow(/permission/i);
    });
  });

  describe("toggleComplete", () => {
    it("toggles from pending to completed", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const todoId = await asUser.mutation(api.todos.create, {
        title: "Task",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      const result = await asUser.mutation(api.todos.toggleComplete, { id: todoId });

      expect(result).toMatchObject({ id: todoId, status: "completed" });

      const todo = await asUser.query(api.todos.getById, { id: todoId });
      expect(todo.status).toBe("completed");
      expect(todo.completedAt).toBeDefined();
    });

    it("toggles from completed back to pending", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const todoId = await asUser.mutation(api.todos.create, {
        title: "Task",
        description: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      await asUser.mutation(api.todos.toggleComplete, { id: todoId }); // Complete
      const result = await asUser.mutation(api.todos.toggleComplete, { id: todoId }); // Uncomplete

      expect(result).toMatchObject({ id: todoId, status: "pending" });

      const todo = await asUser.query(api.todos.getById, { id: todoId });
      expect(todo.status).toBe("pending");
      expect(todo.completedAt).toBeUndefined();
    });
  });
});
