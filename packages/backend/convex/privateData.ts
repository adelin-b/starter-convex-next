// Server-only enforcement handled by package.json exports

import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (identity === null) {
      return {
        message: "Not authenticated",
      };
    }
    return {
      message: "This is private",
    };
  },
});
