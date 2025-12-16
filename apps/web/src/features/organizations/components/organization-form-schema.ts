import { Organizations } from "@starter-saas/backend/convex/schema";
import { z } from "zod";

/**
 * Base schema for organization form fields.
 * Derived from the Convex Organizations schema for consistency.
 */
export const OrganizationFormSchema = z.object({
  name: Organizations.shape.name,
  description: Organizations.shape.description,
  address: Organizations.shape.address,
  phone: Organizations.shape.phone,
  email: Organizations.shape.email.or(z.literal("")),
  status: Organizations.shape.status,
});

/**
 * Schema for creating/editing an organization (status is managed separately).
 */
export const CreateOrganizationSchema = OrganizationFormSchema.omit({ status: true });
export type CreateOrganizationData = z.infer<typeof CreateOrganizationSchema>;
