"use client";

import { cn } from "@vm/ui/utils";
import { Search, X } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "./button";
import { Input } from "./input";

interface SearchBarProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  onClear?: () => void;
  showClear?: boolean;
}

/**
 * SearchBar component - enhanced Input with search icon and optional clear button.
 *
 * @example
 * <SearchBar
 *   placeholder="Search agents..."
 *   value={searchQuery}
 *   onChange={(e) => setSearchQuery(e.target.value)}
 *   onClear={() => setSearchQuery("")}
 * />
 */
export const SearchBar = ({
  className,
  onClear,
  showClear = true,
  value,
  ref,
  ...props
}: SearchBarProps & { ref?: RefObject<HTMLInputElement | null> }) => {
  const hasValue = value !== undefined && value !== "";

  return (
    <div className="relative w-full" data-slot="search-bar">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className={cn("pl-9", hasValue && showClear && "pr-9", className)}
        ref={ref}
        type="search"
        value={value}
        {...props}
      />
      {hasValue && showClear && onClear && (
        <Button
          aria-label="Clear search"
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
          onClick={onClear}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
};

SearchBar.displayName = "SearchBar";
