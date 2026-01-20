"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trans } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Doc } from "@starter-saas/backend/convex/_generated/dataModel";
import { Button } from "@starter-saas/ui/button";
import { Form } from "@starter-saas/ui/form";
import {
  getConvexErrorMessage,
  useConvexFormErrors,
} from "@starter-saas/ui/use-convex-form-errors";
import { useMutation } from "convex/react";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { OrganizationFormFields } from "./organization-form-fields";
import { type CreateOrganizationData, CreateOrganizationSchema } from "./organization-form-schema";

type OrganizationFormProps = {
  organization: Doc<"organizations">;
  onSuccess: () => void;
  onError: (msg: string) => void;
};

/**
 * Form for editing an existing organization.
 * Uses shared OrganizationFormFields for consistent form handling.
 */
export function OrganizationForm({ organization, onSuccess, onError }: OrganizationFormProps) {
  const updateMutation = useMutation(api.organizations.updateOrganization);

  const form = useForm<CreateOrganizationData>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description ?? "",
      address: organization.address ?? "",
      phone: organization.phone ?? "",
      email: organization.email ?? "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = form;

  const { handleConvexError } = useConvexFormErrors(form);

  // Reset form when organization changes
  useEffect(() => {
    reset({
      name: organization.name,
      description: organization.description ?? "",
      address: organization.address ?? "",
      phone: organization.phone ?? "",
      email: organization.email ?? "",
    });
  }, [organization, reset]);

  const onSubmit = async (data: CreateOrganizationData) => {
    try {
      await updateMutation({
        id: organization._id,
        name: data.name,
        description: data.description || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
      });
      onSuccess();
    } catch (error) {
      if (handleConvexError(error)) {
        return;
      }
      onError(getConvexErrorMessage(error, "Failed to update organization"));
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <OrganizationFormFields control={form.control} />

        <Button
          className="w-full"
          data-testid="save-organization-button"
          disabled={isSubmitting || !isDirty}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              <Trans>Saving...</Trans>
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              <Trans>Save Changes</Trans>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
