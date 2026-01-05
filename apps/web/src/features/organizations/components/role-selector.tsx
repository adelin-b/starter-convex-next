"use client";

import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
  type OrganizationRole,
  organizationRoles,
  roleColors,
} from "@starter-saas/backend/convex/schema";
import { assertNever } from "@starter-saas/shared/assert-never";
import { Badge } from "@starter-saas/ui/badge";
import { Checkbox } from "@starter-saas/ui/checkbox";
import { cn } from "@starter-saas/ui/utils";
import { roleMessages } from "../i18n";

type RoleSelectorProps = {
  /** Currently selected roles */
  value: OrganizationRole[];
  /** Callback when roles change */
  onChange: (roles: OrganizationRole[]) => void;
  /** Whether to show role descriptions below each checkbox */
  showDescriptions?: boolean;
  /** Additional className for the container */
  className?: string;
};

/**
 * Role checkbox selector for organization members.
 * Reusable across AddMemberDialog and member edit pages.
 *
 * @example
 * // Simple version (in dialogs)
 * <RoleSelector value={roles} onChange={setRoles} />
 *
 * // With descriptions (in forms)
 * <RoleSelector value={roles} onChange={setRoles} showDescriptions />
 */
export function RoleSelector({
  value,
  onChange,
  showDescriptions = false,
  className,
}: RoleSelectorProps) {
  const { i18n } = useLingui();

  const handleRoleToggle = (role: OrganizationRole, checked: boolean) => {
    if (checked) {
      onChange([...value, role]);
    } else {
      onChange(value.filter((r) => r !== role));
    }
  };

  return (
    <div className={cn("flex flex-col", showDescriptions ? "gap-3" : "gap-2", className)}>
      {organizationRoles.map((role) => (
        <div
          className={cn("flex items-center", showDescriptions ? "space-x-3" : "space-x-2")}
          key={role}
        >
          <Checkbox
            checked={value.includes(role)}
            id={`role-${role}`}
            onCheckedChange={(checked) => handleRoleToggle(role, checked === true)}
          />
          <label
            className={cn(
              "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              showDescriptions && "flex flex-col gap-1",
            )}
            htmlFor={`role-${role}`}
          >
            <Badge variant={roleColors[role]}>{i18n._(roleMessages[role])}</Badge>
            {showDescriptions && (
              <span className="text-muted-foreground text-xs">
                {(() => {
                  switch (role) {
                    case "member": {
                      return <Trans>Regular members with basic access.</Trans>;
                    }
                    case "admin": {
                      return <Trans>Administrators with management permissions.</Trans>;
                    }
                    case "owner": {
                      return <Trans>Organization owners with full control.</Trans>;
                    }
                    default: {
                      assertNever(role);
                    }
                  }
                })()}
              </span>
            )}
          </label>
        </div>
      ))}
    </div>
  );
}
