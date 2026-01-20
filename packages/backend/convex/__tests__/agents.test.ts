import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("../**/*.ts");

describe("agents", () => {
  describe("list", () => {
    it("returns empty array when no agents exist", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "TestUser" });

      const agents = await asUser.query(api.agents.list, {
        type: undefined,
        isActive: undefined,
        organizationId: undefined,
        limit: undefined,
      });
      expect(agents).toEqual([]);
    });

    it("returns only authenticated user's agents", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

      await asSarah.mutation(api.agents.create, {
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
      await asTom.mutation(api.agents.create, {
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

      const sarahAgents = await asSarah.query(api.agents.list, {
        type: undefined,
        isActive: undefined,
        organizationId: undefined,
        limit: undefined,
      });
      expect(sarahAgents).toHaveLength(1);
      expect(sarahAgents[0].name).toBe("Sarah's Agent");

      const tomAgents = await asTom.query(api.agents.list, {
        type: undefined,
        isActive: undefined,
        organizationId: undefined,
        limit: undefined,
      });
      expect(tomAgents).toHaveLength(1);
      expect(tomAgents[0].name).toBe("Tom's Agent");
    });

    it("filters by type when provided", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      await asUser.mutation(api.agents.create, {
        name: "Chat Agent",
        type: "chat",
        description: undefined,
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
      await asUser.mutation(api.agents.create, {
        name: "Voice Agent",
        type: "voice",
        description: undefined,
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

      const chatAgents = await asUser.query(api.agents.list, {
        type: "chat",
        isActive: undefined,
        organizationId: undefined,
        limit: undefined,
      });
      expect(chatAgents).toHaveLength(1);
      expect(chatAgents[0].name).toBe("Chat Agent");

      const voiceAgents = await asUser.query(api.agents.list, {
        type: "voice",
        isActive: undefined,
        organizationId: undefined,
        limit: undefined,
      });
      expect(voiceAgents).toHaveLength(1);
      expect(voiceAgents[0].name).toBe("Voice Agent");
    });

    it("filters by isActive when provided", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const agentId = await asUser.mutation(api.agents.create, {
        name: "Active Agent",
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

      // Toggle to inactive
      await asUser.mutation(api.agents.toggleActive, { id: agentId });

      const activeAgents = await asUser.query(api.agents.list, {
        type: undefined,
        isActive: true,
        organizationId: undefined,
        limit: undefined,
      });
      expect(activeAgents).toHaveLength(0);

      const inactiveAgents = await asUser.query(api.agents.list, {
        type: undefined,
        isActive: false,
        organizationId: undefined,
        limit: undefined,
      });
      expect(inactiveAgents).toHaveLength(1);
    });

    it("throws error when not authenticated", async () => {
      const t = convexTest(schema, modules);

      await expect(
        t.query(api.agents.list, {
          type: undefined,
          isActive: undefined,
          organizationId: undefined,
          limit: undefined,
        }),
      ).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("returns the requested agent", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const agentId = await asUser.mutation(api.agents.create, {
        name: "My Agent",
        description: "Test description",
        type: "chat",
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

      const agent = await asUser.query(api.agents.getById, { id: agentId });
      expect(agent).toMatchObject({
        name: "My Agent",
        description: "Test description",
        type: "chat",
        isActive: true,
      });
    });

    it("throws error when accessing other user's agent", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

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

      await expect(asTom.query(api.agents.getById, { id: agentId })).rejects.toThrow(/permission/i);
    });
  });

  describe("create", () => {
    it("creates a new agent with required fields", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const agentId = await asUser.mutation(api.agents.create, {
        name: "New Agent",
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
      expect(agentId).toBeDefined();

      const agent = await asUser.query(api.agents.getById, { id: agentId });
      expect(agent.name).toBe("New Agent");
      expect(agent.isActive).toBe(true);
      expect(agent.createdAt).toBeDefined();
      expect(agent.updatedAt).toBeDefined();
    });

    it("creates agent with optional fields", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const agentId = await asUser.mutation(api.agents.create, {
        name: "Full Agent",
        description: "A complete agent",
        type: "voice",
        instructions: "Be helpful",
        greetingMessage: "Hello!",
        organizationId: undefined,
        templateId: undefined,
        folderId: undefined,
        dataSchema: undefined,
        config: undefined,
        integrations: undefined,
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

      const agent = await asUser.query(api.agents.getById, { id: agentId });
      expect(agent).toMatchObject({
        name: "Full Agent",
        description: "A complete agent",
        type: "voice",
        instructions: "Be helpful",
        greetingMessage: "Hello!",
      });
    });

    it("throws error when not authenticated", async () => {
      const t = convexTest(schema, modules);

      await expect(
        t.mutation(api.agents.create, {
          name: "Agent",
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
        }),
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("updates agent fields", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const agentId = await asUser.mutation(api.agents.create, {
        name: "Original",
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

      await asUser.mutation(api.agents.update, {
        id: agentId,
        name: "Updated Name",
        description: "New description",
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
        isActive: undefined,
        order: undefined,
      });

      const agent = await asUser.query(api.agents.getById, { id: agentId });
      expect(agent.name).toBe("Updated Name");
      expect(agent.description).toBe("New description");
    });

    it("throws error when updating other user's agent", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

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

      await expect(
        asTom.mutation(api.agents.update, {
          id: agentId,
          name: "Hacked",
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
          isActive: undefined,
          order: undefined,
        }),
      ).rejects.toThrow(/permission/i);
    });
  });

  describe("remove", () => {
    it("deletes the agent", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const agentId = await asUser.mutation(api.agents.create, {
        name: "To Delete",
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
      const result = await asUser.mutation(api.agents.remove, { id: agentId });

      expect(result).toEqual({ success: true });

      const agents = await asUser.query(api.agents.list, {
        type: undefined,
        isActive: undefined,
        organizationId: undefined,
        limit: undefined,
      });
      expect(agents).toHaveLength(0);
    });

    it("throws error when deleting other user's agent", async () => {
      const t = convexTest(schema, modules);
      const asSarah = t.withIdentity({ name: "Sarah" });
      const asTom = t.withIdentity({ name: "Tom" });

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

      await expect(asTom.mutation(api.agents.remove, { id: agentId })).rejects.toThrow(
        /permission/i,
      );
    });
  });

  describe("toggleActive", () => {
    it("toggles from active to inactive", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const agentId = await asUser.mutation(api.agents.create, {
        name: "Agent",
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
      const result = await asUser.mutation(api.agents.toggleActive, { id: agentId });

      expect(result).toMatchObject({ id: agentId, isActive: false });

      const agent = await asUser.query(api.agents.getById, { id: agentId });
      expect(agent.isActive).toBe(false);
    });

    it("toggles from inactive back to active", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "User" });

      const agentId = await asUser.mutation(api.agents.create, {
        name: "Agent",
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
      await asUser.mutation(api.agents.toggleActive, { id: agentId }); // Deactivate
      const result = await asUser.mutation(api.agents.toggleActive, { id: agentId }); // Reactivate

      expect(result).toMatchObject({ id: agentId, isActive: true });

      const agent = await asUser.query(api.agents.getById, { id: agentId });
      expect(agent.isActive).toBe(true);
    });
  });
});
