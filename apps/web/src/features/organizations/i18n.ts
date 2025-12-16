import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { OrganizationRole, OrganizationStatus } from "@starter-saas/backend/convex/schema";
import type { MemberStatus } from "./types";

/** Status label messages for i18n */
export const statusMessages: Record<OrganizationStatus, MessageDescriptor> = {
  active: msg`Active`,
  inactive: msg`Inactive`,
} as const;

/** Role label messages for i18n */
export const roleMessages: Record<OrganizationRole, MessageDescriptor> = {
  commercial: msg`Commercial`,
  "organization-manager": msg`Organization Manager`,
} as const;

/** Member status label messages (active + invitation statuses) */
export const memberStatusMessages: Record<MemberStatus, MessageDescriptor> = {
  active: msg`Active`,
  pending: msg`Pending`,
  accepted: msg`Accepted`,
  revoked: msg`Revoked`,
  expired: msg`Expired`,
} as const;

/** Error messages for i18n */
export const errorMessages = {
  updateRolesFailed: msg`Failed to update roles`,
} as const;
