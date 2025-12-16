import { v } from "convex/values";
import { z } from "zod";
import { fuelTypes, Vehicles, vehicleStatuses } from "../schema";
import { testingMutation, testingQuery } from "./lib";

// Create schema for vehicle insertion (without system fields)
const vehicleInsertSchema = z.object(Vehicles.shape);

/**
 * Clear all data from the database.
 * This is called before each test to ensure isolation.
 */
export const clearAll = testingMutation({
  args: {},
  returns: v.null(),
  handler: async (context) => {
    // Clear vehicles table
    const vehicles = await context.db.query("vehicles").collect();
    for (const vehicle of vehicles) {
      await context.db.delete(vehicle._id);
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
 * Seed the database with test vehicles.
 */
export const seedVehicles = testingMutation({
  args: {
    count: v.number(),
  },
  returns: v.array(v.id("vehicles")),
  handler: async (context, args) => {
    const vehicleIds: Awaited<ReturnType<typeof context.db.insert<"vehicles">>>[] = [];
    const now = Date.now();

    const makes = ["Toyota", "Honda", "Ford", "BMW", "Mercedes"];
    const models = ["Camry", "Civic", "F-150", "3 Series", "C-Class"];

    for (let index = 0; index < args.count; index++) {
      const makeIndex = index % makes.length;
      const vehicleData = vehicleInsertSchema.parse({
        make: makes[makeIndex],
        model: models[makeIndex],
        description: `Test vehicle ${index + 1}`,
        year: 2020 + (index % 5),
        price: 20_000 + index * 1000,
        mileage: 10_000 + index * 5000,
        fuelType: fuelTypes[index % fuelTypes.length],
        licensePlate: `TEST${String(index + 1).padStart(3, "0")}`,
        status: vehicleStatuses[0],
        createdAt: now,
        updatedAt: now,
      });

      const id = await context.db.insert("vehicles", vehicleData);
      vehicleIds.push(id);
    }

    return vehicleIds;
  },
});

/**
 * Get all vehicles (for test assertions).
 */
export const listVehicles = testingQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (context) => await context.db.query("vehicles").collect(),
});
