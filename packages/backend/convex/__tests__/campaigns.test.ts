import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("../**/*.ts");

describe("campaigns", () => {
  describe("list", () => {
    it("returns empty array when no campaigns exist", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      const campaigns = await asUser.query(api.campaigns.list, {
        status: undefined,
        organizationId: undefined,
      });
      expect(campaigns).toEqual([]);
    });

    it("requires authentication", async () => {
      const t = convexTest(schema, modules);

      await expect(
        t.query(api.campaigns.list, {
          status: undefined,
          organizationId: undefined,
        }),
      ).rejects.toThrow(/not authenticated|authentication required/i);
    });

    it("returns only authenticated user's campaigns", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

      // Create agents first (required for campaigns)
      const sarahsAgentId = await asSarah.mutation(api.agents.create, {
        name: "Sarah's Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const tomsAgentId = await asTom.mutation(api.agents.create, {
        name: "Tom's Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      // Sarah creates a campaign
      await asSarah.mutation(api.campaigns.create, {
        name: "Sarah's Campaign",
        agentId: sarahsAgentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      // Tom creates a campaign
      await asTom.mutation(api.campaigns.create, {
        name: "Tom's Campaign",
        agentId: tomsAgentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      // Sarah should only see her campaign
      const sarahsCampaigns = await asSarah.query(api.campaigns.list, {
        status: undefined,
        organizationId: undefined,
      });
      expect(sarahsCampaigns).toHaveLength(1);
      expect(sarahsCampaigns[0].name).toBe("Sarah's Campaign");

      // Tom should only see his campaign
      const tomsCampaigns = await asTom.query(api.campaigns.list, {
        status: undefined,
        organizationId: undefined,
      });
      expect(tomsCampaigns).toHaveLength(1);
      expect(tomsCampaigns[0].name).toBe("Tom's Campaign");
    });

    it("filters by status", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create agent
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      // Create campaigns
      const campaignId = await asUser.mutation(api.campaigns.create, {
        name: "Draft Campaign",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      // Start one campaign
      await asUser.mutation(api.campaigns.start, { id: campaignId });

      // Filter by active status
      const activeCampaigns = await asUser.query(api.campaigns.list, {
        status: "active",
        organizationId: undefined,
      });
      expect(activeCampaigns).toHaveLength(1);
      expect(activeCampaigns[0].status).toBe("active");

      // Filter by draft status - should be empty
      const draftCampaigns = await asUser.query(api.campaigns.list, {
        status: "draft",
        organizationId: undefined,
      });
      expect(draftCampaigns).toHaveLength(0);
    });
  });

  describe("getById", () => {
    it("requires authentication", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create agent and campaign
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asUser.mutation(api.campaigns.create, {
        name: "Test Campaign",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      // Try without auth
      await expect(t.query(api.campaigns.getById, { id: campaignId })).rejects.toThrow(
        /not authenticated|authentication required/i,
      );
    });

    it("returns the campaign when owned by user", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create agent and campaign
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asUser.mutation(api.campaigns.create, {
        name: "Test Campaign",
        agentId,
        description: "A test description",
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      const campaign = await asUser.query(api.campaigns.getById, { id: campaignId });
      expect(campaign.name).toBe("Test Campaign");
      expect(campaign.description).toBe("A test description");
      expect(campaign.status).toBe("draft");
    });

    it("throws when campaign owned by another user", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

      // Sarah creates agent and campaign
      const agentId = await asSarah.mutation(api.agents.create, {
        name: "Sarah's Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asSarah.mutation(api.campaigns.create, {
        name: "Sarah's Campaign",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      // Tom tries to access Sarah's campaign
      await expect(asTom.query(api.campaigns.getById, { id: campaignId })).rejects.toThrow(
        /insufficient permissions|permission/i,
      );
    });
  });

  describe("create", () => {
    it("creates a campaign with default values", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create agent
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asUser.mutation(api.campaigns.create, {
        name: "New Campaign",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      const campaign = await asUser.query(api.campaigns.getById, { id: campaignId });
      expect(campaign.name).toBe("New Campaign");
      expect(campaign.status).toBe("draft");
      expect(campaign.totalProspects).toBe(0);
      expect(campaign.callsCompleted).toBe(0);
      expect(campaign.callsInProgress).toBe(0);
      expect(campaign.callsFailed).toBe(0);
      expect(campaign.meetingsBooked).toBe(0);
      expect(campaign.callbacksScheduled).toBe(0);
    });

    it("throws when agent does not exist", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create a valid agent first, then use a fake ID
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      // Delete the agent
      await asUser.mutation(api.agents.remove, { id: agentId });

      // Try to create campaign with deleted agent
      await expect(
        asUser.mutation(api.campaigns.create, {
          name: "New Campaign",
          agentId,
          description: undefined,
          organizationId: undefined,
          scriptId: undefined,
          startDate: undefined,
          endDate: undefined,
          schedule: undefined,
          maxConcurrentCalls: undefined,
          retryFailedCalls: undefined,
          maxRetryAttempts: undefined,
        }),
      ).rejects.toThrow(/not found/i);
    });
  });

  describe("start", () => {
    it("starts a draft campaign", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create agent and campaign
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asUser.mutation(api.campaigns.create, {
        name: "Draft Campaign",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      const result = await asUser.mutation(api.campaigns.start, { id: campaignId });
      expect(result.status).toBe("active");

      const campaign = await asUser.query(api.campaigns.getById, { id: campaignId });
      expect(campaign.status).toBe("active");
    });

    it("cannot start an active campaign", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create agent and campaign
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asUser.mutation(api.campaigns.create, {
        name: "Draft Campaign",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      // Start it once
      await asUser.mutation(api.campaigns.start, { id: campaignId });

      // Try to start again
      await expect(asUser.mutation(api.campaigns.start, { id: campaignId })).rejects.toThrow(
        /invalid.*state|only start draft or paused/i,
      );
    });
  });

  describe("pause", () => {
    it("pauses an active campaign", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create agent and campaign
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asUser.mutation(api.campaigns.create, {
        name: "Draft Campaign",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      // Start then pause
      await asUser.mutation(api.campaigns.start, { id: campaignId });
      const result = await asUser.mutation(api.campaigns.pause, { id: campaignId });

      expect(result.status).toBe("paused");
    });

    it("cannot pause a draft campaign", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create agent and campaign
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asUser.mutation(api.campaigns.create, {
        name: "Draft Campaign",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      await expect(asUser.mutation(api.campaigns.pause, { id: campaignId })).rejects.toThrow(
        /invalid.*state|only pause active/i,
      );
    });
  });

  describe("remove", () => {
    it("deletes a campaign", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      // Create agent and campaign
      const agentId = await asUser.mutation(api.agents.create, {
        name: "Test Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asUser.mutation(api.campaigns.create, {
        name: "To Delete",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      const result = await asUser.mutation(api.campaigns.remove, { id: campaignId });
      expect(result.success).toBe(true);

      // Verify it's gone
      await expect(asUser.query(api.campaigns.getById, { id: campaignId })).rejects.toThrow(
        /not found/i,
      );
    });

    it("cannot delete another user's campaign", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

      // Sarah creates agent and campaign
      const agentId = await asSarah.mutation(api.agents.create, {
        name: "Sarah's Agent",
        description: undefined,
        type: undefined,
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
        instructions: undefined,
        greetingMessage: undefined,
        sttProvider: undefined,
        sttModel: undefined,
        sttLanguage: undefined,
        llmProvider: undefined,
        llmModel: undefined,
        llmTemperature: undefined,
        llmMaxTokens: undefined,
        ttsProvider: undefined,
        ttsVoice: undefined,
        ttsModel: undefined,
        ttsSpeakingRate: undefined,
        vadEnabled: undefined,
        vadProvider: undefined,
        allowInterruptions: undefined,
        minInterruptionDuration: undefined,
        minEndpointingDelay: undefined,
        maxEndpointingDelay: undefined,
        turnDetection: undefined,
        preemptiveGeneration: undefined,
        transcriptionEnabled: undefined,
        maxToolSteps: undefined,
      });

      const campaignId = await asSarah.mutation(api.campaigns.create, {
        name: "Sarah's Campaign",
        agentId,
        description: undefined,
        organizationId: undefined,
        scriptId: undefined,
        startDate: undefined,
        endDate: undefined,
        schedule: undefined,
        maxConcurrentCalls: undefined,
        retryFailedCalls: undefined,
        maxRetryAttempts: undefined,
      });

      // Tom tries to delete Sarah's campaign
      await expect(asTom.mutation(api.campaigns.remove, { id: campaignId })).rejects.toThrow(
        /insufficient permissions|permission/i,
      );
    });
  });
});
