"use client";

import { XIcon } from "lucide-react";
import { AnimatePresence, MotionConfig, motion, type Transition, type Variant } from "motion/react";
import React, {
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import useClickOutside from "../hooks/use-click-outside";
import { cn } from "../utils";

export type MorphingDialogContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const MorphingDialogContext = React.createContext<MorphingDialogContextType | null>(null);

function useMorphingDialog() {
  const context = useContext(MorphingDialogContext);
  if (!context) {
    throw new Error("useMorphingDialog must be used within MorphingDialog");
  }
  return context;
}

function useDialogLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isOpen = controlledOpen ?? uncontrolledOpen;

  const setIsOpen = useCallback(
    (value: React.SetStateAction<boolean>) => {
      const newValue = typeof value === "function" ? value(isOpen) : value;
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newValue);
      }
      onOpenChange?.(newValue);
    },
    [controlledOpen, isOpen, onOpenChange],
  );

  return { isOpen, setIsOpen };
}

export type MorphingDialogProps = {
  children: React.ReactNode;
  transition?: Transition;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function MorphingDialog({
  children,
  transition,
  open,
  defaultOpen,
  onOpenChange,
}: MorphingDialogProps) {
  const uniqueId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null!);
  const dialogLogic = useDialogLogic({ defaultOpen, open, onOpenChange });

  const contextValue = useMemo(
    () => ({
      isOpen: dialogLogic.isOpen,
      setIsOpen: dialogLogic.setIsOpen,
      uniqueId,
      triggerRef,
    }),
    [dialogLogic.isOpen, dialogLogic.setIsOpen, uniqueId],
  );

  return (
    <MorphingDialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </MorphingDialogContext.Provider>
  );
}

export type MorphingDialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  asChild?: boolean;
} & Omit<React.ComponentProps<typeof motion.button>, "children" | "className" | "style">;

function MorphingDialogTrigger({
  children,
  className,
  style,
  asChild = false,
  ...props
}: MorphingDialogTriggerProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();

  const handleClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen],
  );

  const handleRef = useCallback(
    (element: HTMLElement | null, childRef: unknown) => {
      if (triggerRef && element) {
        triggerRef.current = element as HTMLButtonElement;
      }
      if (childRef) {
        if (typeof childRef === "function") {
          childRef(element);
        } else if (typeof childRef === "object" && childRef !== null && "current" in childRef) {
          (childRef as React.MutableRefObject<HTMLElement | null>).current = element;
        }
      }
    },
    [triggerRef],
  );

  if (asChild && isValidElement(children)) {
    const childElement = children as React.ReactElement;
    const MotionComponent = motion.create(
      childElement.type as React.ForwardRefExoticComponent<any>,
    );
    const childProps = (childElement.props || {}) as Record<string, unknown>;

    return (
      <MotionComponent
        {...childProps}
        {...props}
        aria-controls={`motion-ui-morphing-dialog-content-${uniqueId}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn("relative cursor-pointer", childProps.className as string, className)}
        layoutId={`dialog-${uniqueId}`}
        onClick={(event: React.MouseEvent) => {
          handleClick();
          if (typeof childProps.onClick === "function") {
            (childProps.onClick as (e: React.MouseEvent) => void)(event);
          }
        }}
        onKeyDown={(event: React.KeyboardEvent) => {
          handleKeyDown(event);
          if (typeof childProps.onKeyDown === "function") {
            (childProps.onKeyDown as (e: React.KeyboardEvent) => void)(event);
          }
        }}
        ref={(element: HTMLElement | null) => handleRef(element, childProps.ref)}
        style={{
          ...(typeof childProps.style === "object" && childProps.style ? childProps.style : {}),
          ...style,
        }}
      />
    );
  }

  return (
    <motion.button
      {...props}
      aria-controls={`motion-ui-morphing-dialog-content-${uniqueId}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className={cn("relative cursor-pointer", className)}
      layoutId={`dialog-${uniqueId}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={triggerRef}
      style={style}
    >
      {children}
    </motion.button>
  );
}

export type MorphingDialogContentProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showCloseButton?: boolean;
  closeLabel?: string;
};

function MorphingDialogContent({
  children,
  className,
  style,
  showCloseButton = true,
  closeLabel = "Close",
}: MorphingDialogContentProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();
  const containerRef = useRef<HTMLDivElement>(null!);
  const [firstFocusableElement, setFirstFocusableElement] = useState<HTMLElement | null>(null);
  const [lastFocusableElement, setLastFocusableElement] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleTabNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (!(firstFocusableElement && lastFocusableElement)) {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
      } else if (document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    },
    [firstFocusableElement, lastFocusableElement],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (event.key === "Tab") {
        handleTabNavigation(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsOpen, handleTabNavigation]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      const focusableNodeList = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const focusableElements = focusableNodeList ? [...focusableNodeList] : [];
      if (focusableElements.length > 0) {
        setFirstFocusableElement(focusableElements[0] as HTMLElement);
        setLastFocusableElement(focusableElements.at(-1) as HTMLElement);
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      document.body.classList.remove("overflow-hidden");
      triggerRef.current?.focus();
    }
  }, [isOpen, triggerRef]);

  useClickOutside(containerRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen && (
        <>
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 h-full w-full bg-background/40 backdrop-blur-xs"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={`backdrop-${uniqueId}`}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              aria-describedby={`motion-ui-morphing-dialog-description-${uniqueId}`}
              aria-labelledby={`motion-ui-morphing-dialog-title-${uniqueId}`}
              aria-modal="true"
              className={cn("overflow-hidden", className)}
              layoutId={`dialog-${uniqueId}`}
              ref={containerRef}
              role="dialog"
              style={style}
            >
              {children}
              {showCloseButton && (
                <motion.button
                  aria-label={closeLabel}
                  className={cn(
                    "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                  )}
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  <XIcon />
                  <span className="sr-only">{closeLabel}</span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export type MorphingDialogContainerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * @deprecated MorphingDialogContainer is no longer needed. MorphingDialogContent now handles the portal internally.
 * This component is kept for backward compatibility but does nothing.
 */
function MorphingDialogContainer({ children }: MorphingDialogContainerProps) {
  // This component is now a no-op for backward compatibility
  // MorphingDialogContent handles the portal internally
  return <>{children}</>;
}

export type MorphingDialogTitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogTitle({ children, className, style }: MorphingDialogTitleProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      className={className}
      layout
      layoutId={`dialog-title-container-${uniqueId}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogSubtitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogSubtitle({ children, className, style }: MorphingDialogSubtitleProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      className={className}
      layoutId={`dialog-subtitle-container-${uniqueId}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
  disableLayoutAnimation?: boolean;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
};

function MorphingDialogDescription({
  children,
  className,
  variants,
  disableLayoutAnimation,
}: MorphingDialogDescriptionProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      animate="animate"
      className={className}
      exit="exit"
      id={`dialog-description-${uniqueId}`}
      initial="initial"
      key={`dialog-description-${uniqueId}`}
      layoutId={disableLayoutAnimation ? undefined : `dialog-description-content-${uniqueId}`}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogImageProps = {
  src: string;
  alt: string;
  width: number | string;
  height: number | string;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogImage({
  src,
  alt,
  width,
  height,
  className,
  style,
}: MorphingDialogImageProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.img
      alt={alt}
      className={cn(className)}
      height={height}
      layoutId={`dialog-img-${uniqueId}`}
      src={src}
      style={style}
      width={width}
    />
  );
}

export type MorphingDialogCloseProps = {
  children?: React.ReactNode;
  className?: string;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
};

function MorphingDialogClose({ children, className, variants }: MorphingDialogCloseProps) {
  const { setIsOpen, uniqueId } = useMorphingDialog();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <motion.button
      animate="animate"
      aria-label="Close dialog"
      className={cn("absolute top-6 right-6", className)}
      exit="exit"
      initial="initial"
      key={`dialog-close-${uniqueId}`}
      onClick={handleClose}
      type="button"
      variants={variants}
    >
      {children || <XIcon size={24} />}
    </motion.button>
  );
}

export {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
};
