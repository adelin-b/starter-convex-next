"use client";

import { cn } from "@starter-saas/ui/utils";
import type { ClassValue } from "clsx";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
  type Variants,
} from "motion/react";
import {
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import useClickOutside from "../hooks/use-click-outside";

const TRANSITION = {
  type: "spring" as const,
  bounce: 0.1,
  duration: 0.4,
};

type MorphingPopoverContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  uniqueId: string;
  variants?: Variants;
};

const MorphingPopoverContext = createContext<MorphingPopoverContextValue | null>(null);

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const uniqueId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isOpen = controlledOpen ?? uncontrolledOpen;

  const open = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(true);
    }
    onOpenChange?.(true);
  };

  const close = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  };

  return { isOpen, open, close, uniqueId };
}

export type MorphingPopoverProps = {
  children: React.ReactNode;
  transition?: Transition;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variants?: Variants;
  className?: string;
} & React.ComponentProps<"div">;

function MorphingPopover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
  ...props
}: MorphingPopoverProps) {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange });

  return (
    <MorphingPopoverContext.Provider value={{ ...popoverLogic, variants }}>
      <MotionConfig transition={transition}>
        <div
          className={cn("relative flex items-center justify-center", className)}
          key={popoverLogic.uniqueId}
          {...props}
        >
          {children}
        </div>
      </MotionConfig>
    </MorphingPopoverContext.Provider>
  );
}

export type MorphingPopoverTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof motion.button>, "children" | "className">;

function MorphingPopoverTrigger({
  children,
  className,
  asChild = false,
  ...props
}: MorphingPopoverTriggerProps) {
  const context = useContext(MorphingPopoverContext);
  if (!context) {
    throw new Error("MorphingPopoverTrigger must be used within MorphingPopover");
  }

  if (asChild && isValidElement(children)) {
    const MotionComponent = motion.create(children.type as React.ForwardRefExoticComponent<any>);
    const childProps = children.props as Record<string, unknown>;

    return (
      <MotionComponent
        {...childProps}
        {...props}
        aria-controls={`popover-content-${context.uniqueId}`}
        aria-expanded={context.isOpen}
        className={cn(
          childProps.className as string | undefined as ClassValue | undefined,
          className,
        )}
        key={context.uniqueId}
        layoutId={`popover-trigger-${context.uniqueId}`}
        onClick={(event: React.MouseEvent) => {
          context.open();
          if (childProps.onClick) {
            (childProps.onClick as (e: React.MouseEvent) => void)(event);
          }
        }}
      />
    );
  }

  return (
    <motion.button
      {...props}
      aria-controls={`popover-content-${context.uniqueId}`}
      aria-expanded={context.isOpen}
      className={className}
      key={context.uniqueId}
      layoutId={`popover-trigger-${context.uniqueId}`}
      onClick={context.open}
    >
      {children}
    </motion.button>
  );
}

export type MorphingPopoverContentProps = {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
} & Omit<React.ComponentProps<typeof motion.div>, "children" | "className">;

function MorphingPopoverContent({
  children,
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: MorphingPopoverContentProps) {
  const context = useContext(MorphingPopoverContext);
  if (!context) {
    throw new Error("MorphingPopoverContent must be used within MorphingPopover");
  }

  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, context.close);

  useEffect(() => {
    if (!context.isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        context.close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [context.isOpen, context.close]);

  // Apply sideOffset as margin (simplified positioning for morphing popover)
  const offsetStyle = sideOffset ? { marginTop: `${sideOffset}px` } : {};

  // Prevent clicks inside from closing the popover
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {context.isOpen && (
        <motion.div
          {...props}
          animate="animate"
          aria-modal="true"
          className={cn(
            "absolute overflow-hidden rounded-md border bg-popover p-2 text-popover-foreground shadow-md",
            className,
          )}
          exit="exit"
          id={`popover-content-${context.uniqueId}`}
          initial="initial"
          key={context.uniqueId}
          layoutId={`popover-trigger-${context.uniqueId}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          ref={ref}
          role="dialog"
          style={{ ...offsetStyle, ...props.style }}
          variants={context.variants}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent };
