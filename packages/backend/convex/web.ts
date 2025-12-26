import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Subscribe action for web forms
 * This is a placeholder - implement actual subscription logic
 */
export const subscribe = action({
  args: {
    email: v.string(),
    group: v.optional(v.string()),
  },
  handler: (_ctx, args) => {
    // TODO: Implement actual subscription logic (e.g., send to email service)
    console.log("Subscribe action called with:", args);

    return { success: true };
  },
});
