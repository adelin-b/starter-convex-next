// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodQuery } from "./lib/functions";

// =============================================================================
// Agent Templates Queries
// =============================================================================

/**
 * List all agent templates (public and user's own)
 */
export const list = zodQuery({
  args: {
    includePublic: z.boolean().optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    let templates = await context.db.query("agentTemplates").collect();

    // Filter based on access
    if (args.includePublic) {
      // Include public templates and user's own templates
      templates = templates.filter(
        (t) => t.isPublic || (identity && t.userId === identity.subject),
      );
    } else if (identity) {
      // Only user's templates
      templates = templates.filter((t) => t.userId === identity.subject);
    } else {
      // Only public templates for unauthenticated users
      templates = templates.filter((t) => t.isPublic);
    }

    return templates;
  },
});

/**
 * Get a single agent template by ID
 */
export const getById = zodQuery({
  args: {
    id: zid("agentTemplates"),
  },
  handler: async (context, { id }) => {
    const template = await context.db.get(id);
    if (!template) {
      throw AppErrors.notFound("AgentTemplate", id);
    }

    const identity = await context.auth.getUserIdentity();

    // Check access - public templates are accessible to all
    if (!template.isPublic && (!identity || template.userId !== identity.subject)) {
      throw AppErrors.insufficientPermissions("view this template");
    }

    return template;
  },
});
