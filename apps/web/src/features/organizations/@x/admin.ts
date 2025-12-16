/**
 * Public API for admin pages consuming organizations feature
 *
 * This file exports organizations feature components that admin app pages need.
 * Using the @x pattern from Feature-Sliced Design for explicit cross-feature dependencies.
 *
 * @see https://feature-sliced.design/docs/reference/public-api
 */

export { AddMemberDialog } from "../components/add-member-dialog";
export { RoleSelector } from "../components/role-selector";
export { memberStatusMessages, roleMessages, statusMessages } from "../i18n";
export type { AuthUser, MemberStatus, UnifiedMemberRow } from "../types";
