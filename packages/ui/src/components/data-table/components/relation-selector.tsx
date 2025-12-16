"use client";

import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../../../utils";
import { Badge } from "../../badge";
import { Button } from "../../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../command";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { RelationConfig } from "../types";

export type RelationSelectorProps = {
  /**
   * Current selected value(s) - ID or array of IDs
   */
  value?: string | string[];

  /**
   * Relation configuration
   */
  config: RelationConfig;

  /**
   * Available options to select from
   */
  options?: Record<string, unknown>[];

  /**
   * Callback when selection changes
   */
  onChange: (value: string | string[]) => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Translatable labels
   */
  labels?: DataTableLabels;
};

/**
 * RelationSelector - Select and edit relation/reference field values
 *
 * Features:
 * - Search functionality for related records
 * - Single and multi-select support
 * - Display selected relations as badges
 * - Remove relations
 * - Async search support
 * - Keyboard navigation
 * - Proper accessibility
 *
 * @example
 * <RelationSelector
 *   value={["id1", "id2"]}
 *   config={{
 *     targetTable: "users",
 *     displayField: "name",
 *     multiple: true,
 *     searchRelated: async (query) => {
 *       return await searchUsers(query);
 *     }
 *   }}
 *   options={users}
 *   onChange={(ids) => updateRelations(ids)}
 * />
 */
export function RelationSelector({
  value,
  config,
  options = [],
  onChange,
  className,
  placeholder = "Select relation...",
  disabled = false,
  labels,
}: RelationSelectorProps) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>(options);
  const [isSearching, setIsSearching] = useState(false);

  // Format search placeholder
  const searchPlaceholder =
    mergedLabels.formatSearchPlaceholder?.(config.targetTable) ??
    `${mergedLabels.searchRelations} ${config.targetTable}`;

  // Normalize value to array for easier handling
  let selectedIds: string[];
  if (Array.isArray(value)) {
    selectedIds = value;
  } else if (value) {
    selectedIds = [value];
  } else {
    selectedIds = [];
  }

  // Search handler
  const handleSearch = useCallback(
    async (query: string) => {
      setSearch(query);

      if (!query.trim()) {
        setSearchResults(options);
        return;
      }

      // Use async search if provided
      if (config.searchRelated) {
        setIsSearching(true);
        try {
          const results = await config.searchRelated(query);
          setSearchResults(results);
        } catch (error) {
          console.error("Failed to search relations:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        // Fallback to local filtering
        const filtered = options.filter((item) => {
          const displayValue = String(item[config.displayField] ?? "").toLowerCase();
          return displayValue.includes(query.toLowerCase());
        });
        setSearchResults(filtered);
      }
    },
    [options, config],
  );

  // Update search results when options change
  useEffect(() => {
    if (!search) {
      setSearchResults(options);
    }
  }, [options, search]);

  // Handle selection
  const handleSelect = (id: string) => {
    if (config.multiple) {
      // Multi-select: toggle selection
      const newSelection = selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];
      onChange(newSelection);
    } else {
      // Single-select: replace selection
      onChange(id);
      setOpen(false);
    }
  };

  // Handle remove
  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (config.multiple) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange("");
    }
  };

  // Get selected items for display
  const selectedItems = options.filter((item) => selectedIds.includes(String(item.id)));

  // Get display text for the selector button
  const getDisplayText = () => {
    if (selectedIds.length === 0) {
      return placeholder;
    }
    if (config.multiple) {
      return `${selectedIds.length} ${mergedLabels.selectedRelations}`;
    }
    return (selectedItems[0]?.[config.displayField] as string | undefined) ?? placeholder;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Selected relations display */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => {
            const id = String(item.id);
            const displayValue = String(item[config.displayField] ?? id);
            return (
              <Badge className="gap-1" key={id} variant="secondary">
                <span>{displayValue}</span>
                {!disabled && (
                  <Button
                    aria-label={`Remove ${displayValue}`}
                    className="-mr-1 size-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => handleRemove(id, e)}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Selector */}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            role="combobox"
            variant="outline"
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[400px] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              onValueChange={handleSearch}
              placeholder={searchPlaceholder}
              value={search}
            />
            <CommandList>
              {(() => {
                if (isSearching) {
                  return (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground text-sm">
                        {mergedLabels.searching}
                      </span>
                    </div>
                  );
                }

                if (searchResults.length === 0) {
                  return <CommandEmpty>{mergedLabels.noResultsFound}</CommandEmpty>;
                }

                return (
                  <CommandGroup>
                    {searchResults.map((item) => {
                      const id = String(item.id);
                      const displayValue = String(item[config.displayField] ?? id);
                      const isSelected = selectedIds.includes(id);

                      return (
                        <CommandItem key={id} onSelect={() => handleSelect(id)} value={id}>
                          <Check
                            className={cn("mr-2 size-4", isSelected ? "opacity-100" : "opacity-0")}
                          />
                          <span className="truncate">{displayValue}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })()}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
