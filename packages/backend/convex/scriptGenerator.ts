// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import { effectivenessOptions } from "./schema";

// =============================================================================
// Types for Script Generation
// =============================================================================

/**
 * Industry-specific configurations for script generation
 */
const industryConfigs: Record<string, { painPoints: string[]; keywords: string[] }> = {
  technology: {
    painPoints: [
      "legacy system integration",
      "scaling challenges",
      "security concerns",
      "digital transformation",
    ],
    keywords: ["efficiency", "automation", "innovation", "ROI"],
  },
  healthcare: {
    painPoints: [
      "patient experience",
      "compliance requirements",
      "staff efficiency",
      "cost management",
    ],
    keywords: ["patient care", "HIPAA", "outcomes", "quality"],
  },
  finance: {
    painPoints: [
      "regulatory compliance",
      "risk management",
      "customer acquisition",
      "digital banking",
    ],
    keywords: ["security", "compliance", "growth", "efficiency"],
  },
  retail: {
    painPoints: [
      "inventory management",
      "customer experience",
      "omnichannel presence",
      "competition",
    ],
    keywords: ["customer loyalty", "margins", "efficiency", "experience"],
  },
  manufacturing: {
    painPoints: [
      "supply chain disruptions",
      "quality control",
      "labor efficiency",
      "equipment downtime",
    ],
    keywords: ["productivity", "quality", "automation", "reliability"],
  },
  default: {
    painPoints: ["efficiency", "cost reduction", "growth", "competition"],
    keywords: ["value", "results", "partnership", "success"],
  },
};

/**
 * Role-specific talking points
 */
const roleConfigs: Record<string, { focus: string[]; objections: string[] }> = {
  ceo: {
    focus: ["strategic value", "competitive advantage", "ROI", "market position"],
    objections: ["timing", "priorities", "resource allocation"],
  },
  cto: {
    focus: ["technical capabilities", "integration", "scalability", "security"],
    objections: ["complexity", "migration", "technical debt"],
  },
  cfo: {
    focus: ["cost savings", "ROI", "budget alignment", "financial risk"],
    objections: ["cost", "budget constraints", "ROI timeline"],
  },
  vp_sales: {
    focus: ["revenue growth", "sales efficiency", "team productivity", "pipeline"],
    objections: ["learning curve", "adoption", "change management"],
  },
  director: {
    focus: ["team efficiency", "process improvement", "measurable results", "implementation"],
    objections: ["resources", "timeline", "team capacity"],
  },
  manager: {
    focus: ["daily operations", "team productivity", "ease of use", "support"],
    objections: ["training", "workflow disruption", "team buy-in"],
  },
  default: {
    focus: ["value proposition", "problem solving", "results", "support"],
    objections: ["cost", "timing", "need"],
  },
};

// =============================================================================
// Args Schemas
// =============================================================================

const GenerateScriptArgsSchema = z.object({
  prospectId: zid("prospects"),
  // Context for personalization
  industry: z.string().optional(),
  role: z.string().optional(),
  painPoints: z.array(z.string()).optional(),
  companySize: z.enum(["startup", "small", "medium", "enterprise"]).optional(),
  previousInteractions: z.number().optional(),
  // Generation settings
  tone: z.enum(["professional", "casual", "consultative", "assertive"]).optional(),
  scriptLength: z.enum(["concise", "standard", "detailed"]).optional(),
});

const UpdateGeneratedScriptArgsSchema = z.object({
  id: zid("aiGeneratedScripts"),
  opening: z.string().optional(),
  discovery: z.string().optional(),
  presentation: z.string().optional(),
  objectionHandling: z.string().optional(),
  closing: z.string().optional(),
  wasUsed: z.boolean().optional(),
  effectiveness: z.enum(effectivenessOptions).optional(),
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate personalized opening hook based on prospect context
 */
function generateOpening(
  prospectName: string,
  company: string | undefined,
  industry: string,
  role: string,
  tone: string,
): string {
  const roleConfig = roleConfigs[role.toLowerCase()] || roleConfigs.default;
  const industryConfig = industryConfigs[industry.toLowerCase()] || industryConfigs.default;

  const greeting = tone === "casual" ? "Hi" : "Hello";
  const companyMention = company ? ` at ${company}` : "";

  const hooks = [
    `${greeting} ${prospectName}, I hope I'm catching you at a good time. I've been researching ${company || "your company"} and noticed some exciting developments in your ${industryConfig.keywords[0]} initiatives.`,
    `${greeting} ${prospectName}, thank you for taking my call. I understand you're focused on ${roleConfig.focus[0]}${companyMention}, and I have some insights that might be valuable.`,
    `${greeting} ${prospectName}, I'll be brief and respectful of your time. I'm reaching out because we've helped similar ${industry} companies address ${industryConfig.painPoints[0]}.`,
  ];

  return hooks[Math.floor(Math.random() * hooks.length)];
}

/**
 * Generate discovery questions tailored to role and industry
 */
function generateDiscovery(
  industry: string,
  role: string,
  painPoints: string[],
  scriptLength: string,
): string {
  const roleConfig = roleConfigs[role.toLowerCase()] || roleConfigs.default;
  const industryConfig = industryConfigs[industry.toLowerCase()] || industryConfigs.default;

  const relevantPainPoints =
    painPoints.length > 0 ? painPoints : industryConfig.painPoints.slice(0, 2);

  const questions = [
    "**Primary Questions:**",
    `1. "What's currently your biggest challenge when it comes to ${relevantPainPoints[0]}?"`,
    `2. "How is ${relevantPainPoints[1] || roleConfig.focus[0]} impacting your team's productivity?"`,
    `3. "What would success look like for you in the next 6-12 months?"`,
  ];

  if (scriptLength === "detailed") {
    questions.push(
      "",
      "**Follow-up Questions:**",
      `4. "Have you explored any solutions for this before? What worked and what didn't?"`,
      `5. "Who else in your organization would be involved in evaluating a solution like this?"`,
      `6. "What's your timeline for making a decision on this?"`,
    );
  }

  questions.push(
    "",
    "**Active Listening Prompts:**",
    `- "That's really insightful. Can you tell me more about..."`,
    `- "I've heard that from other ${industry} leaders. How has that specifically affected..."`,
    `- "Interesting. What's driving that priority right now?"`,
  );

  return questions.join("\n");
}

/**
 * Generate presentation talking points
 */
function generatePresentation(
  industry: string,
  role: string,
  painPoints: string[],
  companySize: string,
): string {
  const roleConfig = roleConfigs[role.toLowerCase()] || roleConfigs.default;
  const industryConfig = industryConfigs[industry.toLowerCase()] || industryConfigs.default;

  const relevantPainPoints =
    painPoints.length > 0 ? painPoints : industryConfig.painPoints.slice(0, 2);

  const sizeContext =
    {
      startup: "agile companies like yours",
      small: "growing organizations",
      medium: "mid-market companies",
      enterprise: "enterprise organizations",
    }[companySize] || "companies like yours";

  return `**Value Proposition:**
Based on what you've shared about ${relevantPainPoints[0]}, here's how we can help:

**Key Benefits for ${role.toUpperCase()}:**
1. **${roleConfig.focus[0]}:** We've helped ${sizeContext} achieve 30%+ improvement in this area.
2. **${roleConfig.focus[1]}:** Our solution is specifically designed to address the ${industry} industry's unique challenges.
3. **${industryConfig.keywords[0]}:** Quick implementation with minimal disruption to your current workflows.

**Proof Points:**
- "We recently worked with a similar ${companySize || "sized"} ${industry} company facing the same ${relevantPainPoints[0]} challenge..."
- "Their ${roleConfig.focus[0]} improved by X% within the first 90 days..."
- "The implementation took just X weeks and required minimal IT involvement..."

**Key Differentiators:**
- Industry-specific expertise in ${industry}
- Proven track record with ${roleConfig.focus[0]}
- Dedicated support throughout the partnership`;
}

/**
 * Generate objection handling responses
 */
function generateObjectionHandling(role: string, industry: string, tone: string): string {
  const roleConfig = roleConfigs[role.toLowerCase()] || roleConfigs.default;
  const industryConfig = industryConfigs[industry.toLowerCase()] || industryConfigs.default;

  const objections = roleConfig.objections;
  const acknowledge = tone === "casual" ? "I hear you" : "I completely understand";

  return `**Common Objections & Responses:**

**"The timing isn't right" / "${objections[0]}"**
${acknowledge}. Many of our ${industry} clients felt the same way initially. What we've found is that the ${industryConfig.painPoints[0]} challenges often compound over time. Would it be helpful to at least understand what a solution could look like, so you're prepared when the timing is better?

**"We don't have budget" / "${objections[1]}"**
I appreciate you being upfront about that. Let me ask - if cost weren't a factor, would this be something you'd want to explore? [If yes] Great, because we have flexible options that have worked for companies in similar situations. We could also look at the ROI timeline to see how quickly this could pay for itself.

**"We're already working with someone" / "We have an existing solution"**
That's great that you're already addressing this. Many of our current clients came to us while using other solutions. What specifically is working well for you? [Listen] And where do you see room for improvement?

**"I need to think about it" / "Send me some information"**
Of course. Before I do that, I want to make sure I'm sending you the most relevant information. Based on our conversation about ${roleConfig.focus[0]}, what specifically would you want to see covered?

**"I'm not the right person"**
I appreciate you letting me know. Based on what we discussed about ${industryConfig.painPoints[0]}, who in your organization would be the best person to speak with about this?`;
}

/**
 * Generate closing strategies
 */
function generateClosing(
  prospectName: string,
  role: string,
  tone: string,
  scriptLength: string,
): string {
  const roleConfig = roleConfigs[role.toLowerCase()] || roleConfigs.default;
  const closeStyle = tone === "assertive" ? "direct" : "consultative";

  let closing = `**Next Steps & Closing:**

**Summary Approach:**
"${prospectName}, based on our conversation today, it sounds like ${roleConfig.focus[0]} is a key priority for you. I've made note of [specific pain points mentioned]. Here's what I'd like to suggest as a next step..."

**Call-to-Action Options:**`;

  if (closeStyle === "direct") {
    closing += `

1. **Discovery Meeting:** "I'd like to set up a 30-minute deep dive where we can map out exactly how we'd address your ${roleConfig.focus[0]} challenges. Does [specific day/time] work for you?"

2. **Demo:** "The best way to see if this is a fit is a quick demo tailored to your specific needs. I have availability [day/time] - would that work?"

3. **Pilot/Trial:** "Many ${role}s like to see it in action before committing. Would you be open to a pilot program?"`;
  } else {
    closing += `

1. **Collaborative Discovery:** "Would it be valuable to schedule a working session where we can explore this together? I'd bring some industry benchmarks and we can see how they compare to your current situation."

2. **Stakeholder Meeting:** "Based on what you've shared, it sounds like [other stakeholders] might have valuable input. Would it make sense to include them in our next conversation?"

3. **Resource Share:** "I have a case study from a ${role} at a similar company that faced the exact challenge you described. Can I send that over, and we can reconnect [timeframe] to discuss?"`;
  }

  if (scriptLength === "detailed") {
    closing += `

**Alternative Closes:**
- "What would need to happen for us to move forward on this?"
- "On a scale of 1-10, how interested are you in exploring this further? [If <8] What would make it a 10?"
- "If we could solve [specific pain point], would that be worth a 15-minute follow-up conversation?"

**Booking Technique:**
"I'm looking at my calendar now. I have [Option A] or [Option B] available. Which works better for you?"`;
  }

  closing += `

**Graceful Exit (if not interested):**
"I appreciate your time today, ${prospectName}. Even if now isn't the right time, would it be okay if I followed up in [timeframe] to see if anything has changed?"`;

  return closing;
}

// =============================================================================
// Queries
// =============================================================================

/**
 * Get generated scripts for a prospect
 */
export const getByProspect = zodQuery({
  args: {
    prospectId: zid("prospects"),
    limit: z.number().int().positive().max(20).optional(),
  },
  handler: async (context, { prospectId, limit = 10 }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view generated scripts");
    }

    const scripts = await context.db
      .query("aiGeneratedScripts")
      .withIndex("by_prospectId", (q) => q.eq("prospectId", prospectId))
      .order("desc")
      .take(limit);

    // Filter to only user's scripts
    return scripts.filter((script) => script.userId === identity.subject);
  },
});

/**
 * Get a single generated script by ID
 */
export const getById = zodQuery({
  args: { id: zid("aiGeneratedScripts") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view generated script");
    }

    const script = await context.db.get(id);
    if (!script) {
      throw AppErrors.notFound("Generated Script", id);
    }

    if (script.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this script");
    }

    return script;
  },
});

/**
 * List all generated scripts for the current user
 */
export const list = zodQuery({
  args: {
    limit: z.number().int().positive().max(50).optional(),
  },
  handler: async (context, { limit = 20 }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view generated scripts");
    }

    return await context.db
      .query("aiGeneratedScripts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit);
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Generate a personalized call script for a prospect
 */
export const generate = zodMutation({
  args: GenerateScriptArgsSchema.shape,
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("generate script");
    }

    const startTime = Date.now();

    // Get prospect details
    const prospect = await context.db.get(args.prospectId);
    if (!prospect) {
      throw AppErrors.notFound("Prospect", args.prospectId);
    }

    if (prospect.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("generate script for this prospect");
    }

    // Extract prospect context
    const prospectName = prospect.firstName
      ? `${prospect.firstName}${prospect.lastName ? ` ${prospect.lastName}` : ""}`
      : "there";
    const company = prospect.company;
    const role = args.role || prospect.title || "default";
    const industry = args.industry || "default";
    const painPoints = args.painPoints || [];
    const companySize = args.companySize || "medium";
    const tone = args.tone || "professional";
    const scriptLength = args.scriptLength || "standard";

    // Get previous calls context - filter by userId first, then by prospectId
    const userCalls = await context.db
      .query("calls")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(100);

    const previousCalls = userCalls
      .filter((call) => call.prospectId === args.prospectId)
      .slice(0, 5);

    const previousCallsContext = previousCalls.map((call) => ({
      id: call._id,
      status: call.status,
      duration: call.duration,
      createdAt: call.createdAt,
    }));

    // Generate each phase
    const opening = generateOpening(prospectName, company, industry, role, tone);
    const discovery = generateDiscovery(industry, role, painPoints, scriptLength);
    const presentation = generatePresentation(industry, role, painPoints, companySize);
    const objectionHandling = generateObjectionHandling(role, industry, tone);
    const closing = generateClosing(prospectName, role, tone, scriptLength);

    const generationTime = Date.now() - startTime;
    const now = Date.now();

    // Build context objects for storage
    const prospectContextData = {
      name: prospectName,
      company,
      industry,
      role,
      painPoints,
      companySize,
      tone,
      scriptLength,
    };

    const previousCallsContextData =
      previousCallsContext.length > 0 ? previousCallsContext : undefined;

    // Store the generated script
    const scriptId = await context.db.insert("aiGeneratedScripts", {
      organizationId: prospect.organizationId,
      prospectId: args.prospectId,
      userId: identity.subject,
      opening,
      discovery,
      presentation,
      objectionHandling,
      closing,
      prospectContext: prospectContextData as unknown as undefined,
      previousCallsContext: previousCallsContextData as unknown as undefined,
      vehicleInterests: [],
      generatedBy: "manual", // Using template-based generation
      modelUsed: "template-v1",
      generationTime,
      wasUsed: false,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: scriptId,
      opening,
      discovery,
      presentation,
      objectionHandling,
      closing,
      generationTime,
    };
  },
});

/**
 * Update a generated script (for manual edits)
 */
export const update = zodMutation({
  args: UpdateGeneratedScriptArgsSchema.shape,
  handler: async (context, { id, ...updates }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update generated script");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Generated Script", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this script");
    }

    await context.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Mark a script as used
 */
export const markAsUsed = zodMutation({
  args: { id: zid("aiGeneratedScripts") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("mark script as used");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Generated Script", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this script");
    }

    await context.db.patch(id, {
      wasUsed: true,
      updatedAt: Date.now(),
    });

    return { id, wasUsed: true };
  },
});

/**
 * Rate script effectiveness
 */
export const rateEffectiveness = zodMutation({
  args: {
    id: zid("aiGeneratedScripts"),
    effectiveness: z.enum(effectivenessOptions),
  },
  handler: async (context, { id, effectiveness }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("rate script");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Generated Script", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("rate this script");
    }

    await context.db.patch(id, {
      effectiveness,
      updatedAt: Date.now(),
    });

    return { id, effectiveness };
  },
});

/**
 * Delete a generated script
 */
export const remove = zodMutation({
  args: { id: zid("aiGeneratedScripts") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("delete generated script");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Generated Script", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("delete this script");
    }

    await context.db.delete(id);
    return { success: true };
  },
});
