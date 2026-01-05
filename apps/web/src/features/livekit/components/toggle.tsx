"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-full",
    "whitespace-nowrap font-medium text-sm",
    "cursor-pointer outline-none transition-[color,box-shadow,background-color]",
    "hover:bg-muted hover:text-muted-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-transparent",
        primary:
          "bg-muted text-destructive hover:bg-foreground/10 hover:text-foreground hover:text-foreground data-[state=on]:bg-muted hover:data-[state=on]:bg-foreground/10",
        secondary:
          "bg-muted hover:bg-foreground/10 hover:text-foreground data-[state=on]:bg-blue-500/20 data-[state=on]:bg-muted data-[state=on]:text-blue-700 data-[state=on]:hover:bg-blue-500/30 hover:data-[state=on]:bg-foreground/10 dark:data-[state=on]:text-blue-300",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      className={cn(toggleVariants({ variant, size, className }))}
      data-slot="toggle"
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
