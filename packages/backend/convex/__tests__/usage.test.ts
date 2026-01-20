import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../schema";

const modules = import.meta.glob("../**/*.ts");

describe("usage module", () => {
  describe("plan limits", () => {
    it("should define correct limits for free plan", async () => {
      const { PLAN_LIMITS } = await import("../lib/usage");

      expect(PLAN_LIMITS.free).toEqual({
        apiCalls: 100,
        maxAgents: 2,
        maxCampaigns: 1,
        maxProspects: 50,
        maxApiKeys: 1,
        maxCallMinutes: 30,
      });
    });

    it("should define correct limits for pro plan", async () => {
      const { PLAN_LIMITS } = await import("../lib/usage");

      expect(PLAN_LIMITS.pro).toEqual({
        apiCalls: 10_000,
        maxAgents: 25,
        maxCampaigns: 25,
        maxProspects: 5000,
        maxApiKeys: 10,
        maxCallMinutes: 1500,
      });
    });

    it("should define unlimited (-1) for enterprise plan", async () => {
      const { PLAN_LIMITS } = await import("../lib/usage");

      expect(PLAN_LIMITS.enterprise.maxAgents).toBe(-1);
      expect(PLAN_LIMITS.enterprise.maxCampaigns).toBe(-1);
      expect(PLAN_LIMITS.enterprise.maxProspects).toBe(-1);
    });
  });

  describe("date helpers", () => {
    it("should return current month in YYYY-MM format", async () => {
      const { getCurrentMonth } = await import("../lib/usage");

      const month = getCurrentMonth();
      expect(month).toMatch(/^\d{4}-\d{2}$/);
    });

    it("should return current date in YYYY-MM-DD format", async () => {
      const { getCurrentDate } = await import("../lib/usage");

      const date = getCurrentDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("quota checking", () => {
    it("should allow usage when under quota", async () => {
      const t = convexTest(schema, modules);

      // Create org
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "Test Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      // Create a subscription with free plan (2 agents max)
      await t.run(async (ctx) => {
        await ctx.db.insert("subscriptions", {
          organizationId: orgId.toString(),
          plan: "free",
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Check quota when no agents exist
      const result = await t.run(async (ctx) => {
        const { checkQuota } = await import("../lib/usage");
        return await checkQuota(ctx, orgId, "agents");
      });

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(0);
      expect(result.limit).toBe(2);
      expect(result.remaining).toBe(2);
      expect(result.plan).toBe("free");
    });

    it("should deny usage when at quota", async () => {
      const t = convexTest(schema, modules);

      // Create org
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "Test Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      // Create a subscription with free plan (2 agents max)
      await t.run(async (ctx) => {
        await ctx.db.insert("subscriptions", {
          organizationId: orgId.toString(),
          plan: "free",
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Create 2 agents (at limit)
      await t.run(async (ctx) => {
        await ctx.db.insert("agents", {
          name: "Agent 1",
          userId: "user1",
          organizationId: orgId,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        await ctx.db.insert("agents", {
          name: "Agent 2",
          userId: "user1",
          organizationId: orgId,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Check quota - should be at limit
      const result = await t.run(async (ctx) => {
        const { checkQuota } = await import("../lib/usage");
        return await checkQuota(ctx, orgId, "agents");
      });

      expect(result.allowed).toBe(false);
      expect(result.current).toBe(2);
      expect(result.limit).toBe(2);
      expect(result.remaining).toBe(0);
    });

    it("should allow unlimited for enterprise plan", async () => {
      const t = convexTest(schema, modules);

      // Create org
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "Enterprise Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      // Create enterprise subscription
      await t.run(async (ctx) => {
        await ctx.db.insert("subscriptions", {
          organizationId: orgId.toString(),
          plan: "enterprise",
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Create many agents
      await t.run(async (ctx) => {
        for (let i = 0; i < 50; i++) {
          await ctx.db.insert("agents", {
            name: `Agent ${i}`,
            userId: "user1",
            organizationId: orgId,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      });

      // Check quota - should still be allowed (unlimited)
      const result = await t.run(async (ctx) => {
        const { checkQuota } = await import("../lib/usage");
        return await checkQuota(ctx, orgId, "agents");
      });

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(50);
      expect(result.limit).toBe(-1); // unlimited
      expect(result.remaining).toBe(-1);
    });

    it("should default to free plan when no subscription exists", async () => {
      const t = convexTest(schema, modules);

      // Create org without subscription
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "No Subscription Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      const result = await t.run(async (ctx) => {
        const { checkQuota } = await import("../lib/usage");
        return await checkQuota(ctx, orgId, "agents");
      });

      expect(result.plan).toBe("free");
      expect(result.limit).toBe(2); // free plan limit
    });
  });

  describe("usage tracking", () => {
    it("should track usage event and update counters", async () => {
      const t = convexTest(schema, modules);

      // Create org
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "Test Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      // Track an API call
      const eventId = await t.run(async (ctx) => {
        const { trackUsage } = await import("../lib/usage");
        return await trackUsage(ctx, {
          organizationId: orgId,
          userId: "user1",
          eventType: "api_call",
        });
      });

      expect(eventId).toBeDefined();

      // Verify event was created
      const event = await t.run(async (ctx) => await ctx.db.get(eventId));

      expect(event).toBeDefined();
      expect(event?.eventType).toBe("api_call");
      expect(event?.organizationId).toBe(orgId);

      // Verify daily usage was created
      const dailyUsage = await t.run(async (ctx) => {
        const { getCurrentDate } = await import("../lib/usage");
        const date = getCurrentDate();
        return await ctx.db
          .query("dailyUsage")
          .withIndex("by_org_date", (q) => q.eq("organizationId", orgId).eq("date", date))
          .first();
      });

      expect(dailyUsage).toBeDefined();
      expect(dailyUsage?.apiCalls).toBe(1);
      expect(dailyUsage?.totalEvents).toBe(1);

      // Verify monthly usage was created
      const monthlyUsage = await t.run(async (ctx) => {
        const { getCurrentMonth } = await import("../lib/usage");
        const month = getCurrentMonth();
        return await ctx.db
          .query("organizationUsage")
          .withIndex("by_org_month", (q) => q.eq("organizationId", orgId).eq("month", month))
          .first();
      });

      expect(monthlyUsage).toBeDefined();
      expect(monthlyUsage?.apiCalls).toBe(1);
    });

    it("should increment existing usage counters", async () => {
      const t = convexTest(schema, modules);

      // Create org
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "Test Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      // Track first event
      await t.run(async (ctx) => {
        const { trackUsage } = await import("../lib/usage");
        return await trackUsage(ctx, {
          organizationId: orgId,
          userId: "user1",
          eventType: "api_call",
        });
      });

      // Track second event
      await t.run(async (ctx) => {
        const { trackUsage } = await import("../lib/usage");
        return await trackUsage(ctx, {
          organizationId: orgId,
          userId: "user1",
          eventType: "api_call",
        });
      });

      // Verify counters incremented
      const dailyUsage = await t.run(async (ctx) => {
        const { getCurrentDate } = await import("../lib/usage");
        const date = getCurrentDate();
        return await ctx.db
          .query("dailyUsage")
          .withIndex("by_org_date", (q) => q.eq("organizationId", orgId).eq("date", date))
          .first();
      });

      expect(dailyUsage?.apiCalls).toBe(2);
      expect(dailyUsage?.totalEvents).toBe(2);
    });

    it("should not increment apiCalls for non-api_call events", async () => {
      const t = convexTest(schema, modules);

      // Create org
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "Test Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      // Track agent created event (not api_call)
      await t.run(async (ctx) => {
        const { trackUsage } = await import("../lib/usage");
        return await trackUsage(ctx, {
          organizationId: orgId,
          userId: "user1",
          eventType: "agent_created",
        });
      });

      // Verify apiCalls is 0 but totalEvents is 1
      const dailyUsage = await t.run(async (ctx) => {
        const { getCurrentDate } = await import("../lib/usage");
        const date = getCurrentDate();
        return await ctx.db
          .query("dailyUsage")
          .withIndex("by_org_date", (q) => q.eq("organizationId", orgId).eq("date", date))
          .first();
      });

      expect(dailyUsage?.apiCalls).toBe(0);
      expect(dailyUsage?.totalEvents).toBe(1);
    });
  });

  describe("usage summary", () => {
    it("should return complete usage summary", async () => {
      const t = convexTest(schema, modules);

      // Create org
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "Test Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      // Create pro subscription
      await t.run(async (ctx) => {
        await ctx.db.insert("subscriptions", {
          organizationId: orgId.toString(),
          plan: "pro",
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Create some agents
      await t.run(async (ctx) => {
        await ctx.db.insert("agents", {
          name: "Agent 1",
          userId: "user1",
          organizationId: orgId,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const summary = await t.run(async (ctx) => {
        const { getUsageSummary } = await import("../lib/usage");
        return await getUsageSummary(ctx, orgId);
      });

      expect(summary.plan).toBe("pro");
      expect(summary.usage.agents.current).toBe(1);
      expect(summary.usage.agents.limit).toBe(25);
      expect(summary.usage.agents.remaining).toBe(24);
      expect(summary.month).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe("enforce quota", () => {
    it("should throw when quota exceeded", async () => {
      const t = convexTest(schema, modules);

      // Create org
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "Test Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      // Create free subscription (2 agents max)
      await t.run(async (ctx) => {
        await ctx.db.insert("subscriptions", {
          organizationId: orgId.toString(),
          plan: "free",
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Create 2 agents (at limit)
      await t.run(async (ctx) => {
        await ctx.db.insert("agents", {
          name: "Agent 1",
          userId: "user1",
          organizationId: orgId,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        await ctx.db.insert("agents", {
          name: "Agent 2",
          userId: "user1",
          organizationId: orgId,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Should throw when trying to enforce quota
      await expect(
        t.run(async (ctx) => {
          const { enforceQuota } = await import("../lib/usage");
          return await enforceQuota(ctx, orgId, "agents");
        }),
      ).rejects.toThrow(/quota exceeded/i);
    });

    it("should not throw when under quota", async () => {
      const t = convexTest(schema, modules);

      // Create org
      const orgId = await t.run(
        async (ctx) =>
          await ctx.db.insert("organizations", {
            name: "Test Org",
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
      );

      // Create pro subscription (25 agents max)
      await t.run(async (ctx) => {
        await ctx.db.insert("subscriptions", {
          organizationId: orgId.toString(),
          plan: "pro",
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Should not throw
      await expect(
        t.run(async (ctx) => {
          const { enforceQuota } = await import("../lib/usage");
          await enforceQuota(ctx, orgId, "agents");
          return "success";
        }),
      ).resolves.toBe("success");
    });
  });
});
