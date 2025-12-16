"use client";

import { useLingui } from "@lingui/react";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import type { OrganizationRole } from "@starter-saas/backend/convex/schema";
import { organizationRoles } from "@starter-saas/backend/convex/schema";
import { Button } from "@starter-saas/ui/button";
import { getConvexErrorMessage } from "@starter-saas/ui/use-convex-form-errors";
import { useState } from "react";
import { toast } from "sonner";
import { logError } from "@/lib/sentry";
import { errorMessages, roleMessages } from "../i18n";

/** Minimal member data needed for role toggle */
type RoleToggleMember = {
  _id: Id<"organizationMembers">;
  roles: OrganizationRole[];
};

type RoleToggleCellProps = {
  member: RoleToggleMember;
  onUpdateRoles: (memberId: Id<"organizationMembers">, roles: OrganizationRole[]) => Promise<void>;
  isUpdating: boolean;
};

export function RoleToggleCell({ member, onUpdateRoles, isUpdating }: RoleToggleCellProps) {
  const { i18n } = useLingui();
  const [selectedRoles, setSelectedRoles] = useState<OrganizationRole[]>(member.roles);

  const handleRoleToggle = async (role: OrganizationRole) => {
    if (isUpdating) {
      return;
    }

    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];

    if (newRoles.length > 0) {
      const previousRoles = selectedRoles;
      setSelectedRoles(newRoles);
      try {
        await onUpdateRoles(member._id, newRoles);
      } catch (error) {
        setSelectedRoles(previousRoles);
        logError(error, {
          feature: "organizations",
          action: "updateMemberRoles",
          extra: { memberId: member._id, newRoles },
        });
        toast.error(getConvexErrorMessage(error, i18n._(errorMessages.updateRolesFailed)));
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {organizationRoles.map((role) => (
        <Button
          disabled={isUpdating}
          key={role}
          onClick={() => handleRoleToggle(role)}
          size="sm"
          variant={selectedRoles.includes(role) ? "default" : "outline"}
        >
          {i18n._(roleMessages[role])}
        </Button>
      ))}
    </div>
  );
}
