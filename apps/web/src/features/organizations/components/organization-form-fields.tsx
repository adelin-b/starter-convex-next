"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { organizationStatuses } from "@starter-saas/backend/convex/schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@starter-saas/ui/form";
import { Input } from "@starter-saas/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import { Textarea } from "@starter-saas/ui/textarea";
import type { Control, FieldValues, Path } from "react-hook-form";
import { statusMessages } from "../i18n";

/** Base fields that all organization forms must have */
type OrganizationBaseFields = {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
};

type OrganizationFormFieldsProps<T extends FieldValues & OrganizationBaseFields> = {
  control: Control<T>;
  /** Whether to show the status field (only for edit mode) */
  showStatus?: boolean;
};

/**
 * Shared form fields for organization create/edit forms.
 * Uses shadcn Form components for consistent error handling and accessibility.
 */
export function OrganizationFormFields<T extends FieldValues & OrganizationBaseFields>({
  control,
  showStatus = false,
}: OrganizationFormFieldsProps<T>) {
  const { t, i18n } = useLingui();

  return (
    <>
      <FormField
        control={control}
        name={"name" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans>Name *</Trans>
            </FormLabel>
            <FormControl>
              <Input
                data-testid="organization-name-input"
                placeholder={t`Organization name`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"description" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans>Description</Trans>
            </FormLabel>
            <FormControl>
              <Textarea placeholder={t`Organization description`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={"phone" as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans>Phone</Trans>
              </FormLabel>
              <FormControl>
                <Input placeholder={t`+33 1 23 45 67 89`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={"email" as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans>Email</Trans>
              </FormLabel>
              <FormControl>
                <Input placeholder={t`contact@organization.com`} type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={"address" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans>Address</Trans>
            </FormLabel>
            <FormControl>
              <Textarea placeholder={t`123 Street, City`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showStatus && (
        <FormField
          control={control}
          name={"status" as Path<T>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans>Status</Trans>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="organization-status-select">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {organizationStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {i18n._(statusMessages[status])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
