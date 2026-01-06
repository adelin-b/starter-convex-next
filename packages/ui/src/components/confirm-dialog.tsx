"use client";

import { cn } from "@starter-saas/ui/utils";
import { cva } from "class-variance-authority";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

const confirmDialogIconVariants = cva(
  "mb-2 flex size-12 items-center justify-center rounded-full",
  {
    variants: {
      variant: {
        destructive: "bg-destructive/10 text-destructive",
        warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

type ConfirmDialogVariant = "destructive" | "warning" | "info";

type ConfirmDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
  loading?: boolean;
};

/**
 * ConfirmDialog component for user confirmations with different severity levels.
 *
 * @example
 * // Destructive action
 * <ConfirmDialog
 *   title="Delete Agent"
 *   description="This will permanently delete the agent. This action cannot be undone."
 *   confirmText="Delete"
 *   variant="destructive"
 *   onConfirm={handleDelete}
 * >
 *   <Button variant="destructive">Delete Agent</Button>
 * </ConfirmDialog>
 *
 * @example
 * // Warning
 * <ConfirmDialog
 *   title="Archive Agent"
 *   description="Archiving will disable this agent. You can restore it later."
 *   confirmText="Archive"
 *   variant="warning"
 *   onConfirm={handleArchive}
 * >
 *   <Button variant="outline">Archive</Button>
 * </ConfirmDialog>
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loadingText = "Processing...",
  variant = "info",
  onConfirm,
  children,
  loading = false,
}: ConfirmDialogProps) {
  let Icon = Info;
  if (variant === "destructive") {
    Icon = AlertCircle;
  } else if (variant === "warning") {
    Icon = AlertTriangle;
  }

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      {children && React.isValidElement(children) && <AlertDialogTrigger render={children} />}
      <AlertDialogContent data-slot="confirm-dialog" data-variant={variant}>
        <AlertDialogHeader>
          <div className="flex flex-col items-center text-center">
            <div className={cn(confirmDialogIconVariants({ variant }))}>
              <Icon className="size-6" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              variant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              variant === "warning" &&
                "bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600",
            )}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? loadingText : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Controlled ConfirmDialog that doesn't need a trigger element
 */
interface ConfirmDialogControlledProps extends Omit<ConfirmDialogProps, "children"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmDialogControlled(props: ConfirmDialogControlledProps) {
  return <ConfirmDialog {...props} />;
}

/**
 * Hook for imperative confirm dialogs
 */
export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    variant: ConfirmDialogVariant;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    variant: "info",
    onConfirm: () => {
      // Default no-op function
    },
  });

  const confirm = React.useCallback(
    (options: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "children">) =>
      new Promise<boolean>((resolve) => {
        setState({
          open: true,
          title: options.title,
          description: options.description,
          variant: options.variant || "info",
          onConfirm: async () => {
            await options.onConfirm();
            setState((prev) => ({ ...prev, open: false }));
            resolve(true);
          },
        });
      }),
    [],
  );

  const dialog = (
    <ConfirmDialogControlled
      description={state.description}
      onConfirm={state.onConfirm}
      onOpenChange={(open) => setState((prev) => ({ ...prev, open }))}
      open={state.open}
      title={state.title}
      variant={state.variant}
    />
  );

  return { confirm, dialog };
}

// Need to import React for the hook
import * as React from "react";
