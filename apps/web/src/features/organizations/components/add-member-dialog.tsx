"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Doc, Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { OrganizationInvitations } from "@starter-saas/backend/convex/schema";
import { Button } from "@starter-saas/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@starter-saas/ui/dialog";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import {
  getConvexErrorMessage,
  useConvexFormErrors,
} from "@starter-saas/ui/use-convex-form-errors";
import { useMutation } from "convex/react";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { RoleSelector } from "./role-selector";

// Schema derived from backend OrganizationInvitations schema
const inviteMemberSchema = z.object({
  email: OrganizationInvitations.shape.email,
  organizationId: z.string().min(1),
  roles: OrganizationInvitations.shape.roles,
});
type InviteMemberData = z.infer<typeof inviteMemberSchema>;

type AddMemberDialogProps = {
  onSuccess: () => void;
  onError: (msg: string) => void;
} & (
  | {
      /** When organizationId is provided, the organization selector is hidden */
      organizationId: Id<"organizations">;
      organizations?: never;
    }
  | {
      /** When organizations list is provided, a selector is shown */
      organizationId?: never;
      organizations: Doc<"organizations">[];
    }
);

export function AddMemberDialog({
  organizationId,
  organizations,
  onSuccess,
  onError,
}: AddMemberDialogProps) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const inviteMemberMutation = useMutation(api.invitations.create);

  const hasFixedOrganization = organizationId !== undefined;

  const form = useForm<InviteMemberData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      organizationId: organizationId ?? "",
      roles: ["member"],
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const { handleConvexError } = useConvexFormErrors(form);

  const onSubmit = async (data: InviteMemberData) => {
    try {
      await inviteMemberMutation({
        email: data.email,
        organizationId: data.organizationId as Id<"organizations">,
        roles: data.roles,
      });
      reset({ email: "", organizationId: organizationId ?? "", roles: ["member"] });
      setOpen(false);
      onSuccess();
    } catch (error) {
      if (handleConvexError(error)) {
        return;
      }
      onError(getConvexErrorMessage(error, "Failed to send invitation"));
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button data-testid="add-member-button">
            <Mail className="mr-2 size-4" />
            <Trans>Invite Member</Trans>
          </Button>
        }
      />
      <DialogContent data-testid="add-member-dialog">
        <DialogHeader>
          <DialogTitle>
            <Trans>Invite Member</Trans>
          </DialogTitle>
          <DialogDescription>
            {hasFixedOrganization ? (
              <Trans>Send an invitation email to add a new member to this organization</Trans>
            ) : (
              <Trans>Send an invitation email to add a new member to an organization</Trans>
            )}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Organization selector - only shown when organizations list is provided */}
          {!hasFixedOrganization && organizations && (
            <div className="space-y-2">
              <Label htmlFor="organizationId">
                <Trans>Organization *</Trans>
              </Label>
              <Controller
                control={control}
                name="organizationId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger data-testid="member-organization-select">
                      <SelectValue placeholder={t`Select an organization`} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((organization) => (
                        <SelectItem key={organization._id} value={organization._id}>
                          {organization.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.organizationId && (
                <p className="text-destructive text-sm">{errors.organizationId.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">
              <Trans>Email Address *</Trans>
            </Label>
            <Input
              autoComplete="email"
              data-testid="member-email-input"
              id="email"
              placeholder={t`Enter email address`}
              type="email"
              {...register("email")}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              <Trans>Roles *</Trans>
            </Label>
            <Controller
              control={control}
              name="roles"
              render={({ field }) => <RoleSelector onChange={field.onChange} value={field.value} />}
            />
            {errors.roles && <p className="text-destructive text-sm">{errors.roles.message}</p>}
          </div>

          <Button
            className="w-full"
            data-testid="add-member-submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
                <Trans>Sending...</Trans>
              </>
            ) : (
              <Trans>Send Invitation</Trans>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
