"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "../../../utils";

export type IndeterminateCheckboxProps = Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  "checked"
> & {
  /**
   * Checkbox checked state
   * - true: checked
   * - false: unchecked
   * - "indeterminate": partially checked (some but not all items selected)
   */
  checked?: boolean | "indeterminate";
  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * ARIA label for accessibility
   */
  "aria-label"?: string;
};

/**
 * IndeterminateCheckbox - Checkbox with support for indeterminate state
 *
 * Features:
 * - Three states: unchecked, checked, indeterminate
 * - Keyboard navigation (Space bar)
 * - Proper ARIA attributes for screen readers
 * - Visual indication for all three states
 * - Used in table headers for "select all" functionality
 *
 * @example
 * // Select all checkbox
 * <IndeterminateCheckbox
 *   checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
 *   onCheckedChange={(checked) => checked ? selectAll() : selectNone()}
 *   aria-label="Select all rows"
 * />
 *
 * @example
 * // Individual row checkbox
 * <IndeterminateCheckbox
 *   checked={isSelected}
 *   onCheckedChange={(checked) => toggleRow(checked)}
 *   aria-label={`Select row ${rowId}`}
 * />
 */
export function IndeterminateCheckbox({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: IndeterminateCheckboxProps) {
  const checkboxRef = useRef<HTMLButtonElement>(null);

  // Set indeterminate property on DOM element
  // This is needed because indeterminate is not a standard HTML attribute
  useEffect(() => {
    if (checkboxRef.current) {
      let state: string;
      if (checked === "indeterminate") {
        state = "indeterminate";
      } else if (checked) {
        state = "checked";
      } else {
        state = "unchecked";
      }
      checkboxRef.current.dataset.state = state;
    }
  }, [checked]);

  const handleCheckedChange = (value: boolean | "indeterminate") => {
    // Convert indeterminate to unchecked when user clicks
    // This matches expected behavior: clicking indeterminate checkbox should uncheck all
    if (onCheckedChange) {
      onCheckedChange(value === "indeterminate" ? false : Boolean(value));
    }
  };

  return (
    <CheckboxPrimitive.Root
      checked={checked === "indeterminate" ? "indeterminate" : checked}
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        "dark:bg-input/30 dark:data-[state=checked]:bg-primary dark:data-[state=indeterminate]:bg-primary",
        className,
      )}
      data-slot="checkbox"
      disabled={disabled}
      onCheckedChange={handleCheckedChange}
      ref={checkboxRef}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="grid place-content-center text-current transition-none"
        data-slot="checkbox-indicator"
      >
        {checked === "indeterminate" ? (
          <MinusIcon aria-hidden="true" className="size-3.5" />
        ) : (
          <CheckIcon aria-hidden="true" className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
