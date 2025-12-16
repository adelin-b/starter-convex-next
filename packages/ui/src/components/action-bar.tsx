import { cn } from "@starter-saas/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";

const actionBarVariants = cva("flex items-center gap-2", {
  variants: {
    align: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
      between: "justify-between",
    },
    wrap: {
      true: "flex-wrap",
      false: "",
    },
  },
  defaultVariants: {
    align: "right",
    wrap: false,
  },
});

interface ActionBarProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof actionBarVariants> {}

/**
 * ActionBar component for consistent action button groups.
 *
 * @example
 * <ActionBar align="right">
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Save Changes</Button>
 * </ActionBar>
 *
 * @example
 * // Between alignment (actions on both sides)
 * <ActionBar align="between">
 *   <Button variant="destructive">Delete</Button>
 *   <div className="flex gap-2">
 *     <Button variant="outline">Cancel</Button>
 *     <Button>Save</Button>
 *   </div>
 * </ActionBar>
 */
function ActionBar({ className, align, wrap, ...props }: ActionBarProps) {
  return (
    <div
      className={cn(actionBarVariants({ align, wrap }), className)}
      data-slot="action-bar"
      {...props}
    />
  );
}

/**
 * Primary action group (e.g., Save/Cancel buttons)
 */
function ActionBarPrimary({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      data-slot="action-bar-primary"
      {...props}
    />
  );
}

/**
 * Secondary action group (e.g., Delete button on opposite side)
 */
function ActionBarSecondary({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      data-slot="action-bar-secondary"
      {...props}
    />
  );
}

/**
 * Sticky action bar that stays at bottom of viewport
 */
function ActionBarSticky({ className, ...props }: ActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 border-t bg-background p-4",
        actionBarVariants(props),
        className,
      )}
      data-slot="action-bar-sticky"
      {...props}
    />
  );
}

export { ActionBar, ActionBarPrimary, ActionBarSecondary, ActionBarSticky };
