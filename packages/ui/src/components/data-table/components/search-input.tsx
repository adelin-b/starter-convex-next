"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import { Input } from "../../input";
import { DEBOUNCE_DELAY } from "../constants";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  debounceMs?: number;
  labels?: DataTableLabels;
};

/**
 * SearchInput - Debounced search input with clear button
 * Features:
 * - Automatic debouncing for performance
 * - Clear button when text is present
 * - Loading indicator support
 * - Responsive with container queries
 * - Proper accessibility
 *
 * @example
 * <SearchInput
 *   value={globalFilter}
 *   onChange={setGlobalFilter}
 *   placeholder="Search all columns..."
 * />
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  isLoading = false,
  disabled = false,
  debounceMs = DEBOUNCE_DELAY.SEARCH,
  labels,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const finalPlaceholder = placeholder ?? mergedLabels.searchPlaceholder;

  // Sync external value changes - but only when not actively typing
  // Track if we're in the middle of debouncing to avoid overwriting user input
  const isDebouncingRef = useRef(false);
  useEffect(() => {
    if (!isDebouncingRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  // Handle input change with proper debouncing
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Mark that we're debouncing to prevent useEffect from overwriting
      isDebouncingRef.current = true;

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        isDebouncingRef.current = false;
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  // Handle clear - also clears any pending debounce
  const handleClear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    isDebouncingRef.current = false;
    setLocalValue("");
    onChange("");
  }, [onChange]);

  return (
    <div className={cn("@container relative w-full max-w-sm", className)}>
      <div className="relative">
        {/* Search icon */}
        <Search
          aria-hidden="true"
          className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-4 text-muted-foreground"
        />

        {/* Input field */}
        <Input
          aria-label={mergedLabels.search}
          className={cn(
            "h-9 w-full pl-9",
            // Show clear button space when there's text
            localValue && "pr-9",
          )}
          disabled={disabled || isLoading}
          onChange={handleChange}
          placeholder={finalPlaceholder}
          type="search"
          value={localValue}
        />

        {/* Clear button - only show when there's text */}
        {localValue && !disabled && (
          <Button
            aria-label={mergedLabels.clearSearchLabel}
            className="-translate-y-1/2 absolute top-1/2 right-1 size-7 p-0"
            onClick={handleClear}
            size="sm"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Optional loading indicator */}
      {isLoading && (
        <div
          aria-live="polite"
          className="-translate-y-1/2 absolute top-1/2 right-2.5"
          role="status"
        >
          <span className="sr-only">{mergedLabels.loadingSearchResults}</span>
          <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
    </div>
  );
}
