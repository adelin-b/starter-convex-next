"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trans } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import { Button } from "@starter-saas/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@starter-saas/ui/dialog";
import { Form } from "@starter-saas/ui/form";
import {
  getConvexErrorMessage,
  useConvexFormErrors,
} from "@starter-saas/ui/use-convex-form-errors";
import { useMutation } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OrganizationFormFields } from "./organization-form-fields";
import { type CreateOrganizationData, CreateOrganizationSchema } from "./organization-form-schema";

type CreateOrganizationDialogProps = {
  onSuccess: () => void;
  onError: (msg: string) => void;
};

/**
 * Dialog for creating a new organization.
 * Uses shared OrganizationFormFields without status field (set automatically on create).
 */
export function CreateOrganizationDialog({ onSuccess, onError }: CreateOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useMutation(api.organizations.create);

  const form = useForm<CreateOrganizationData>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const { handleConvexError } = useConvexFormErrors(form);

  const onSubmit = async (data: CreateOrganizationData) => {
    try {
      await createMutation({
        name: data.name,
        description: data.description || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
      });
      reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      if (handleConvexError(error)) {
        return;
      }
      onError(getConvexErrorMessage(error, "Failed to create organization"));
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button data-testid="add-organization-button">
            <Plus className="mr-2 size-4" />
            <Trans>Add Organization</Trans>
          </Button>
        }
      />
      <DialogContent data-testid="create-organization-dialog">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create Organization</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Add a new organization to the system</Trans>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <OrganizationFormFields control={form.control} />

            <Button
              className="w-full"
              data-testid="create-organization-submit"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
                  <Trans>Creating...</Trans>
                </>
              ) : (
                <Trans>Create Organization</Trans>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
