import { v } from "convex/values";
import { z } from "zod";
import { Todos, todoPriorities, todoStatuses } from "../schema";
import { testingMutation, testingQuery } from "./lib";

// Create schema for todo insertion (without system fields)
const todoInsertSchema = z.object(Todos.shape);

/**
 * Clear all data from the database.
 * This is called before each test to ensure isolation.
 */
export const clearAll = testingMutation({
  args: {},
  returns: v.null(),
  handler: async (context) => {
    // Clear todos table
    const todos = await context.db.query("todos").collect();
    for (const todo of todos) {
      await context.db.delete(todo._id);
    }

    return null;
  },
});

/**
 * Create a test user via better-auth's internal mechanism.
 * Since better-auth manages its own tables as a component,
 * we create a session by calling the auth endpoint directly.
 *
 * For E2E testing, the recommended approach is to:
 * 1. Use the actual sign-up flow in tests, OR
 * 2. Create users via better-auth's admin API
 *
 * This mutation returns the info needed to set up auth cookies.
 */
export const createTestUser = testingMutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.optional(v.string()),
  },
  returns: v.object({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  }),
  // biome-ignore lint/suspicious/useAwait: Convex handler signature requires async
  handler: async (_context, args) => {
    // Note: Since better-auth is a Convex component, direct DB access
    // to auth tables requires using the component's APIs.
    // For now, we return the user info and let the E2E test
    // handle auth via the actual sign-up/sign-in flow.
    //
    // In a production setup, you'd use better-auth's admin API:
    // - POST /api/auth/admin/create-user
    // - POST /api/auth/admin/impersonate
    //
    // For E2E tests, using the real auth flow is actually preferred
    // as it tests the full stack.

    return {
      userId: `test-user-${Date.now()}`,
      email: args.email,
      name: args.name,
    };
  },
});

/**
 * Seed the database with test todos.
 */
export const seedTodos = testingMutation({
  args: {
    count: v.number(),
    userId: v.string(),
  },
  returns: v.array(v.id("todos")),
  handler: async (context, args) => {
    const todoIds: Awaited<ReturnType<typeof context.db.insert<"todos">>>[] = [];
    const now = Date.now();

    const titles = ["Review code", "Write tests", "Fix bugs", "Deploy app", "Update docs"];

    for (let index = 0; index < args.count; index++) {
      const titleIndex = index % titles.length;
      const todoData = todoInsertSchema.parse({
        title: `${titles[titleIndex]} ${index + 1}`,
        description: `Test todo description ${index + 1}`,
        status: todoStatuses[index % todoStatuses.length],
        priority: todoPriorities[index % todoPriorities.length],
        userId: args.userId,
        createdAt: now,
        updatedAt: now,
      });

      const id = await context.db.insert("todos", todoData);
      todoIds.push(id);
    }

    return todoIds;
  },
});

/**
 * Get all todos (for test assertions).
 */
export const listTodos = testingQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (context) => await context.db.query("todos").collect(),
});
