import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import schema from "../schema";

type Organization = Doc<"organizations">;
type OrganizationMember = Doc<"organizationMembers">;

const modules = import.meta.glob("../**/*.ts");

describe("organizations", () => {
  describe("getAll", () => {
    it("returns all organizations for admin", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });

      // Seed admin
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      // Create test orgs via seed
      await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "some-user",
        organizationName: "Org A",
        description: undefined,
        email: undefined,
        phone: undefined,
      });
      await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "another-user",
        organizationName: "Org B",
        description: undefined,
        email: undefined,
        phone: undefined,
      });

      const result = await asAdmin.query(api.organizations.getAll, {
        limit: undefined,
        cursor: undefined,
      });
      expect(result.items).toHaveLength(2);
      expect(result.items.map((o: Organization) => o.name).sort()).toEqual(["Org A", "Org B"]);
      expect(result.isDone).toBe(true);
    });

    it("throws error when not admin", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ subject: "regular-user", name: "User" });

      await expect(
        asUser.query(api.organizations.getAll, { limit: undefined, cursor: undefined }),
      ).rejects.toThrow(/admin/i);
    });

    it("throws error when not authenticated", async () => {
      const t = convexTest(schema, modules);
      await expect(
        t.query(api.organizations.getAll, { limit: undefined, cursor: undefined }),
      ).rejects.toThrow();
    });

    it("supports pagination with limit", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      // Create 3 orgs
      for (let i = 1; i <= 3; i++) {
        await t.mutation(internal.organizations.seedTestOrganization, {
          userId: `user-${i}`,
          organizationName: `Org ${i}`,
          description: undefined,
          email: undefined,
          phone: undefined,
        });
      }

      // Get first page with limit 2
      const page1 = await asAdmin.query(api.organizations.getAll, { limit: 2, cursor: undefined });
      expect(page1.items).toHaveLength(2);
      expect(page1.isDone).toBe(false);
      expect(page1.cursor).toBeDefined();

      // Get second page
      const page2 = await asAdmin.query(api.organizations.getAll, {
        limit: 2,
        cursor: page1.cursor,
      });
      expect(page2.items).toHaveLength(1);
      expect(page2.isDone).toBe(true);
    });
  });

  describe("getById", () => {
    it("returns organization by id", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });

      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });
      const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "owner",
        organizationName: "Test Org",
        description: "A test organization",
        email: undefined,
        phone: undefined,
      });

      const org = await asAdmin.query(api.organizations.getById, { id: organizationId });
      expect(org.name).toBe("Test Org");
      expect(org.description).toBe("A test organization");
      expect(org.status).toBe("active");
    });

    it("throws error for non-existent organization", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      // Create and get a valid ID format, then delete it
      const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "owner",
        organizationName: "To Delete",
        description: undefined,
        email: undefined,
        phone: undefined,
      });
      await asAdmin.mutation(api.organizations.remove, { id: organizationId });

      await expect(
        asAdmin.query(api.organizations.getById, { id: organizationId }),
      ).rejects.toThrow(/not found/i);
    });
  });

  describe("create", () => {
    it("creates organization with required fields", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      const org = await asAdmin.mutation(api.organizations.create, {
        name: "New Corp",
        description: undefined,
        address: undefined,
        phone: undefined,
        email: undefined,
        plan: undefined,
      });
      expect(org?.name).toBe("New Corp");
      expect(org?.status).toBe("active");
      expect(org?.createdAt).toBeDefined();
    });

    it("creates organization with optional fields", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      const org = await asAdmin.mutation(api.organizations.create, {
        name: "Full Corp",
        description: "A fully configured org",
        address: "123 Main St",
        phone: "+1-555-0123",
        email: "contact@fullcorp.com",
        plan: undefined,
      });

      expect(org).toMatchObject({
        name: "Full Corp",
        description: "A fully configured org",
        address: "123 Main St",
        phone: "+1-555-0123",
        email: "contact@fullcorp.com",
        status: "active",
      });
    });

    it("throws error on duplicate name", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      await asAdmin.mutation(api.organizations.create, {
        name: "Unique Corp",
        description: undefined,
        address: undefined,
        phone: undefined,
        email: undefined,
        plan: undefined,
      });

      await expect(
        asAdmin.mutation(api.organizations.create, {
          name: "Unique Corp",
          description: undefined,
          address: undefined,
          phone: undefined,
          email: undefined,
          plan: undefined,
        }),
      ).rejects.toThrow(/duplicate/i);
    });
  });

  describe("updateOrganization", () => {
    it("updates organization fields", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "owner",
        organizationName: "Old Name",
        description: undefined,
        email: undefined,
        phone: undefined,
      });

      const updated = await asAdmin.mutation(api.organizations.updateOrganization, {
        id: organizationId,
        name: "New Name",
        description: "Updated description",
        address: undefined,
        phone: undefined,
        email: undefined,
      });

      expect(updated?.name).toBe("New Name");
      expect(updated?.description).toBe("Updated description");
    });

    it("throws error on duplicate name update", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "owner1",
        organizationName: "Existing Org",
        description: undefined,
        email: undefined,
        phone: undefined,
      });
      const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "owner2",
        organizationName: "My Org",
        description: undefined,
        email: undefined,
        phone: undefined,
      });

      await expect(
        asAdmin.mutation(api.organizations.updateOrganization, {
          id: organizationId,
          name: "Existing Org",
          description: undefined,
          address: undefined,
          phone: undefined,
          email: undefined,
        }),
      ).rejects.toThrow(/duplicate/i);
    });
  });

  describe("updateStatus", () => {
    it("updates organization status", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "owner",
        organizationName: "Active Org",
        description: undefined,
        email: undefined,
        phone: undefined,
      });

      const result = await asAdmin.mutation(api.organizations.updateStatus, {
        id: organizationId,
        status: "inactive",
      });

      expect(result).toEqual({ success: true });

      const org = await asAdmin.query(api.organizations.getById, { id: organizationId });
      expect(org.status).toBe("inactive");
    });
  });

  describe("remove", () => {
    it("deletes organization and its members", async () => {
      const t = convexTest(schema, modules);
      const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
      await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

      const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "owner",
        organizationName: "To Delete",
        description: undefined,
        email: undefined,
        phone: undefined,
      });

      // Add another member
      await asAdmin.mutation(api.organizations.addMember, {
        userId: "member1",
        organizationId,
        roles: ["member"],
      });

      const result = await asAdmin.mutation(api.organizations.remove, { id: organizationId });
      expect(result).toEqual({ success: true });

      // Verify org is deleted
      await expect(
        asAdmin.query(api.organizations.getById, { id: organizationId }),
      ).rejects.toThrow(/not found/i);

      // Verify members were also deleted (getAllMembers filters orphans)
      const members = await asAdmin.query(api.organizations.getAllMembers, {});
      expect(
        members.filter((m: OrganizationMember) => m.organizationId === organizationId),
      ).toHaveLength(0);
    });
  });

  describe("organization members", () => {
    describe("addMember", () => {
      it("adds member to organization", async () => {
        const t = convexTest(schema, modules);
        const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
          userId: "owner",
          organizationName: "Test Org",
          description: undefined,
          email: undefined,
          phone: undefined,
        });

        const member = await asAdmin.mutation(api.organizations.addMember, {
          userId: "new-member",
          organizationId,
          roles: ["member"],
        });

        expect(member?.userId).toBe("new-member");
        expect(member?.roles).toEqual(["member"]);
      });

      it("throws error on duplicate membership", async () => {
        const t = convexTest(schema, modules);
        const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
          userId: "owner",
          organizationName: "Test Org",
          description: undefined,
          email: undefined,
          phone: undefined,
        });

        await asAdmin.mutation(api.organizations.addMember, {
          userId: "member1",
          organizationId,
          roles: ["member"],
        });

        await expect(
          asAdmin.mutation(api.organizations.addMember, {
            userId: "member1",
            organizationId,
            roles: ["admin"],
          }),
        ).rejects.toThrow(/duplicate/i);
      });
    });

    describe("updateMemberRoles", () => {
      it("updates member roles", async () => {
        const t = convexTest(schema, modules);
        const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
          userId: "owner",
          organizationName: "Test Org",
          description: undefined,
          email: undefined,
          phone: undefined,
        });

        const member = await asAdmin.mutation(api.organizations.addMember, {
          userId: "member1",
          organizationId,
          roles: ["member"],
        });

        const updated = await asAdmin.mutation(api.organizations.updateMemberRoles, {
          memberId: member!._id,
          roles: ["admin", "member"],
        });

        expect(updated?.roles).toEqual(["admin", "member"]);
      });
    });

    describe("removeMember", () => {
      it("removes member from organization", async () => {
        const t = convexTest(schema, modules);
        const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
          userId: "owner",
          organizationName: "Test Org",
          description: undefined,
          email: undefined,
          phone: undefined,
        });

        const member = await asAdmin.mutation(api.organizations.addMember, {
          userId: "to-remove",
          organizationId,
          roles: ["member"],
        });

        const result = await asAdmin.mutation(api.organizations.removeMember, {
          memberId: member!._id,
        });

        expect(result).toEqual({ success: true });
      });
    });

    // NOTE: getOrganizationMembers requires betterAuth component for user fetching.
    // Skipping test - verified via e2e tests.
    describe("getOrganizationMembers", () => {
      it("returns all members of an organization", async () => {
        const t = convexTest(schema, modules);
        const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
          userId: "owner",
          organizationName: "Test Org",
          description: undefined,
          email: undefined,
          phone: undefined,
        });

        await asAdmin.mutation(api.organizations.addMember, {
          userId: "member1",
          organizationId,
          roles: ["member"],
        });
        await asAdmin.mutation(api.organizations.addMember, {
          userId: "member2",
          organizationId,
          roles: ["admin"],
        });

        const members = await asAdmin.query(api.organizations.getOrganizationMembers, {
          organizationId,
        });

        // Owner + 2 added members
        expect(members).toHaveLength(3);
      });
    });

    describe("getUserMemberships", () => {
      it("returns all organizations a user belongs to", async () => {
        const t = convexTest(schema, modules);
        const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        // Create two orgs
        const { organizationId: org1 } = await t.mutation(
          internal.organizations.seedTestOrganization,
          {
            userId: "owner1",
            organizationName: "Org 1",
            description: undefined,
            email: undefined,
            phone: undefined,
          },
        );
        const { organizationId: org2 } = await t.mutation(
          internal.organizations.seedTestOrganization,
          {
            userId: "owner2",
            organizationName: "Org 2",
            description: undefined,
            email: undefined,
            phone: undefined,
          },
        );

        // Add same user to both
        await asAdmin.mutation(api.organizations.addMember, {
          userId: "multi-member",
          organizationId: org1,
          roles: ["member"],
        });
        await asAdmin.mutation(api.organizations.addMember, {
          userId: "multi-member",
          organizationId: org2,
          roles: ["admin"],
        });

        const memberships = await asAdmin.query(api.organizations.getUserMemberships, {
          userId: "multi-member",
        });

        expect(memberships).toHaveLength(2);
        expect(
          memberships.map((m: { organization: Organization }) => m.organization.name).sort(),
        ).toEqual(["Org 1", "Org 2"]);
      });
    });
  });

  describe("role-based access helpers", () => {
    describe("hasRole", () => {
      it("returns true when user has role", async () => {
        const t = convexTest(schema, modules);
        const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
          userId: "owner",
          organizationName: "Test Org",
          description: undefined,
          email: undefined,
          phone: undefined,
        });

        await asAdmin.mutation(api.organizations.addMember, {
          userId: "member1",
          organizationId,
          roles: ["admin", "member"],
        });

        const asMember = t.withIdentity({ subject: "member1", name: "Member" });
        const hasAdmin = await asMember.query(api.organizations.hasRole, {
          organizationId,
          role: "admin",
        });
        expect(hasAdmin).toBe(true);

        const hasMember = await asMember.query(api.organizations.hasRole, {
          organizationId,
          role: "member",
        });
        expect(hasMember).toBe(true);

        const hasOwner = await asMember.query(api.organizations.hasRole, {
          organizationId,
          role: "owner",
        });
        expect(hasOwner).toBe(false);
      });

      it("returns false when not a member", async () => {
        const t = convexTest(schema, modules);
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
          userId: "owner",
          organizationName: "Test Org",
          description: undefined,
          email: undefined,
          phone: undefined,
        });

        const asStranger = t.withIdentity({ subject: "stranger", name: "Stranger" });
        const hasRole = await asStranger.query(api.organizations.hasRole, {
          organizationId,
          role: "member",
        });
        expect(hasRole).toBe(false);
      });
    });

    describe("isOwner", () => {
      it("returns true for owner", async () => {
        const t = convexTest(schema, modules);
        const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
          userId: "owner-user",
          organizationName: "Test Org",
          description: undefined,
          email: undefined,
          phone: undefined,
        });

        const asOwner = t.withIdentity({ subject: "owner-user", name: "Owner" });
        const isOwner = await asOwner.query(api.organizations.isOwner, { organizationId });
        expect(isOwner).toBe(true);
      });

      it("returns false for non-owner member", async () => {
        const t = convexTest(schema, modules);
        const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        const { organizationId } = await t.mutation(internal.organizations.seedTestOrganization, {
          userId: "owner",
          organizationName: "Test Org",
          description: undefined,
          email: undefined,
          phone: undefined,
        });

        await asAdmin.mutation(api.organizations.addMember, {
          userId: "member1",
          organizationId,
          roles: ["admin"],
        });

        const asMember = t.withIdentity({ subject: "member1", name: "Member" });
        const isOwner = await asMember.query(api.organizations.isOwner, { organizationId });
        expect(isOwner).toBe(false);
      });
    });

    describe("hasAdminAccess", () => {
      it("returns true for system admin", async () => {
        const t = convexTest(schema, modules);
        const asAdmin = t.withIdentity({ subject: "admin-user", name: "Admin" });
        await t.mutation(internal.organizations.seedTestAdmin, { userId: "admin-user" });

        const hasAccess = await asAdmin.query(api.organizations.hasAdminAccess, {});
        expect(hasAccess).toBe(true);
      });

      it("returns false for non-admin", async () => {
        const t = convexTest(schema, modules);
        const asUser = t.withIdentity({ subject: "regular-user", name: "User" });

        const hasAccess = await asUser.query(api.organizations.hasAdminAccess, {});
        expect(hasAccess).toBe(false);
      });

      it("returns false when not authenticated", async () => {
        const t = convexTest(schema, modules);

        const hasAccess = await t.query(api.organizations.hasAdminAccess, {});
        expect(hasAccess).toBe(false);
      });
    });
  });

  describe("getCurrentUserMemberships", () => {
    it("returns current user's memberships", async () => {
      const t = convexTest(schema, modules);
      await t.mutation(internal.organizations.seedTestOrganization, {
        userId: "my-user",
        organizationName: "My Org",
        description: undefined,
        email: undefined,
        phone: undefined,
      });

      const asUser = t.withIdentity({ subject: "my-user", name: "User" });
      const memberships = await asUser.query(api.organizations.getCurrentUserMemberships, {});

      expect(memberships).toHaveLength(1);
      expect(memberships[0].organization.name).toBe("My Org");
      expect(memberships[0].roles).toContain("owner");
    });

    it("throws error when not authenticated", async () => {
      const t = convexTest(schema, modules);

      await expect(t.query(api.organizations.getCurrentUserMemberships, {})).rejects.toThrow();
    });
  });
});
