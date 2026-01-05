"use client";

import { cn } from "@starter-saas/ui/utils";
import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Separator } from "./separator";

const GRID_COLS_THREE = 3;

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

type ModalLayoutProps = {
  /**
   * Modal open state
   */
  open: boolean;
  /**
   * Callback when modal closes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Modal title
   */
  title: string;
  /**
   * Modal description
   */
  description?: string;
  /**
   * Modal size preset
   */
  size?: ModalSize;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Footer actions (buttons)
   */
  footer?: React.ReactNode;
  /**
   * Show separator between header and content
   */
  showHeaderSeparator?: boolean;
  /**
   * Show separator between content and footer
   */
  showFooterSeparator?: boolean;
  /**
   * Custom className for content
   */
  className?: string;
};

const modalSizes: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-7xl",
};

/**
 * ModalLayout component for consistent dialog sizing and spacing.
 *
 * Wraps the existing Dialog component with standardized layout patterns.
 *
 * @example
 * <ModalLayout
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Create Agent"
 *   description="Configure your new AI voice agent"
 *   size="lg"
 *   footer={
 *     <ModalLayoutActions>
 *       <Button variant="outline" onClick={() => setOpen(false)}>
 *         Cancel
 *       </Button>
 *       <SubmitButton>Create Agent</SubmitButton>
 *     </ModalLayoutActions>
 *   }
 * >
 *   <Form {...form}>
 *     <FormField ... />
 *   </Form>
 * </ModalLayout>
 */
export function ModalLayout({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  children,
  footer,
  showHeaderSeparator = false,
  showFooterSeparator = true,
  className,
}: ModalLayoutProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className={cn(modalSizes[size], "flex max-h-[90vh] flex-col", className)}
        data-slot="modal-layout"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {showHeaderSeparator && <Separator />}

        <ModalLayoutContent>{children}</ModalLayoutContent>

        {footer && (
          <>
            {showFooterSeparator && <Separator />}
            <DialogFooter>{footer}</DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * ModalLayoutContent - Scrollable content area
 */
export function ModalLayoutContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-1", className)}
      data-slot="modal-layout-content"
      {...props}
    />
  );
}

/**
 * ModalLayoutSection - Content section with optional title
 */
interface ModalLayoutSectionProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
}

export function ModalLayoutSection({
  title,
  description,
  className,
  children,
  ...props
}: ModalLayoutSectionProps) {
  return (
    <div className={cn("space-y-4", className)} data-slot="modal-layout-section" {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="font-semibold text-sm">{title}</h3>}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * ModalLayoutActions - Footer actions with consistent spacing
 */
export function ModalLayoutActions({
  align = "end",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "end" | "center" | "between";
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2",
        align === "start" && "justify-start",
        align === "end" && "justify-end",
        align === "center" && "justify-center",
        align === "between" && "justify-between",
        className,
      )}
      data-slot="modal-layout-actions"
      {...props}
    />
  );
}

/**
 * ModalLayoutFormGrid - Grid layout for forms in modals
 */
interface ModalLayoutFormGridProps extends React.ComponentProps<"div"> {
  cols?: number;
}

export function ModalLayoutFormGrid({ cols = 1, className, ...props }: ModalLayoutFormGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === GRID_COLS_THREE && "grid-cols-1 md:grid-cols-3",
        className,
      )}
      data-slot="modal-layout-form-grid"
      {...props}
    />
  );
}
