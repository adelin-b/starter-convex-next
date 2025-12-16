"use client";

import { cn } from "@starter-saas/ui/utils";
import { Check, Loader2, X } from "lucide-react";
import * as React from "react";
import { Button, type ButtonProps } from "./button";

type SubmitState = "idle" | "submitting" | "success" | "error";

interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
  /**
   * Custom loading text to display during submission
   */
  loadingText?: string;
  /**
   * Success text to display after successful submission
   */
  successText?: string;
  /**
   * Error text to display after failed submission
   */
  errorText?: string;
  /**
   * Duration (ms) to show success/error state before reverting to idle
   */
  feedbackDuration?: number;
  /**
   * Custom onSubmit handler (overrides form's default)
   */
  onSubmit?: () => void | Promise<void>;
  /**
   * Show success state after submission
   */
  showSuccessState?: boolean;
  /**
   * Show error state after submission failure
   */
  showErrorState?: boolean;
}

/**
 * SubmitButton component with automatic loading states and success/error feedback.
 *
 * Integrates with react-hook-form to show loading state during submission.
 *
 * @example
 * // Basic usage with form
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(onSubmit)}>
 *     <FormField ... />
 *     <SubmitButton>Create Agent</SubmitButton>
 *   </form>
 * </Form>
 *
 * @example
 * // With custom loading/success text
 * <SubmitButton
 *   loadingText="Creating..."
 *   successText="Created!"
 * >
 *   Create Agent
 * </SubmitButton>
 */
export function SubmitButton({
  children,
  loadingText,
  successText = "Success!",
  errorText = "Error",
  feedbackDuration = 2000,
  onSubmit,
  showSuccessState = true,
  showErrorState = true,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  const [localState, setLocalState] = React.useState<SubmitState>("idle");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isSubmitting = localState === "submitting";
  const isSuccess = localState === "success";
  const isError = localState === "error";

  // Clear timer on unmount
  React.useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  // Handle standalone onSubmit
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onSubmit) {
      return;
    }

    e.preventDefault();
    setLocalState("submitting");

    try {
      await onSubmit();

      if (showSuccessState) {
        setLocalState("success");
        timerRef.current = setTimeout(() => {
          setLocalState("idle");
        }, feedbackDuration);
      } else {
        setLocalState("idle");
      }
    } catch (error) {
      if (showErrorState) {
        setLocalState("error");
        timerRef.current = setTimeout(() => {
          setLocalState("idle");
        }, feedbackDuration);
      } else {
        setLocalState("idle");
      }
      throw error;
    }
  };

  // Determine what to display
  const getContent = () => {
    if (isSuccess) {
      return (
        <>
          <Check className="size-4" />
          {successText}
        </>
      );
    }

    if (isError) {
      return (
        <>
          <X className="size-4" />
          {errorText}
        </>
      );
    }

    if (isSubmitting) {
      return (
        <>
          <Loader2 className="size-4 animate-spin" />
          {loadingText || children}
        </>
      );
    }

    return children;
  };

  // Helper function to determine button state
  const getButtonState = (): string => {
    if (isSuccess) {
      return "success";
    }
    if (isError) {
      return "error";
    }
    if (isSubmitting) {
      return "loading";
    }
    return "idle";
  };

  return (
    <Button
      className={cn(
        isSuccess && "bg-green-600 hover:bg-green-700",
        isError && "bg-destructive hover:bg-destructive/90",
        className,
      )}
      data-slot="submit-button"
      data-state={getButtonState()}
      disabled={disabled || isSubmitting}
      onClick={onSubmit ? handleClick : undefined}
      type={onSubmit ? "button" : "submit"}
      {...props}
    >
      <span className="flex items-center gap-2">{getContent()}</span>
    </Button>
  );
}

/**
 * FormActions component - Consistent layout for form action buttons
 *
 * @example
 * <FormActions>
 *   <Button variant="outline" type="button" onClick={onCancel}>
 *     Cancel
 *   </Button>
 *   <SubmitButton>Save</SubmitButton>
 * </FormActions>
 */
export function FormActions({
  className,
  align = "right",
  ...props
}: React.ComponentProps<"div"> & {
  align?: "left" | "right" | "center" | "between";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        align === "left" && "justify-start",
        align === "right" && "justify-end",
        align === "center" && "justify-center",
        align === "between" && "justify-between",
        className,
      )}
      data-slot="form-actions"
      {...props}
    />
  );
}
