"use client";

import { cn } from "@starter-saas/ui/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

/**
 * FilterPanel component for building complex filters with date ranges and multi-select options.
 *
 * @example
 * <FilterPanel>
 *   <FilterPanelDateRange
 *     label="Date Range"
 *     value={dateRange}
 *     onChange={setDateRange}
 *   />
 *   <FilterPanelMultiSelect
 *     label="Status"
 *     options={[
 *       { value: "active", label: "Active" },
 *       { value: "inactive", label: "Inactive" },
 *     ]}
 *     value={selectedStatuses}
 *     onChange={setSelectedStatuses}
 *   />
 *   <FilterPanelActions onClear={handleClearFilters} />
 * </FilterPanel>
 */
function FilterPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("space-y-4 rounded-lg border bg-card p-4", className)}
      data-slot="filter-panel"
      {...props}
    />
  );
}

function FilterPanelSection({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2", className)} data-slot="filter-panel-section" {...props} />;
}

function FilterPanelLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn("font-medium text-sm", className)}
      data-slot="filter-panel-label"
      {...props}
    />
  );
}

type FilterPanelDateRangeProps = {
  label: string;
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  clearDateText?: string;
  dateRangeSeparator?: string;
};

/**
 * Date range picker for filter panel
 */
function FilterPanelDateRange({
  label,
  value,
  onChange,
  placeholder = "Select date range",
  clearDateText = "Clear",
  dateRangeSeparator = " - ",
}: FilterPanelDateRangeProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <FilterPanelSection>
      <FilterPanelLabel>{label}</FilterPanelLabel>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
            variant="outline"
          >
            <CalendarIcon className="mr-2 size-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")}
                  {dateRangeSeparator}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              placeholder
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            defaultMonth={value?.from}
            initialFocus
            mode="range"
            numberOfMonths={2}
            onSelect={onChange}
            selected={value}
          />
          {value && (
            <>
              <Separator />
              <div className="p-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    // eslint-disable-next-line unicorn/no-useless-undefined -- undefined clears the date range
                    onChange(undefined);
                    setOpen(false);
                  }}
                  size="sm"
                  variant="outline"
                >
                  <X className="mr-2 size-4" />
                  {clearDateText}
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </FilterPanelSection>
  );
}

type FilterOption = {
  value: string;
  label: string;
};

type FilterPanelMultiSelectProps = {
  label: string;
  options: FilterOption[];
  value: string[];
  onChange: (values: string[]) => void;
};

/**
 * Multi-select checkboxes for filter panel
 */
function FilterPanelMultiSelect({ label, options, value, onChange }: FilterPanelMultiSelectProps) {
  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <FilterPanelSection>
      <FilterPanelLabel>{label}</FilterPanelLabel>
      <div className="space-y-2">
        {options.map((option) => (
          <div className="flex items-center space-x-2" key={option.value}>
            <Checkbox
              checked={value.includes(option.value)}
              id={`filter-${option.value}`}
              onCheckedChange={() => handleToggle(option.value)}
            />
            <label
              className="cursor-pointer font-normal text-sm"
              htmlFor={`filter-${option.value}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </FilterPanelSection>
  );
}

type FilterPanelActionsProps = {
  onClear?: () => void;
  onApply?: () => void;
  clearText?: string;
  applyText?: string;
};

/**
 * Action buttons for filter panel (typically Clear and Apply)
 */
function FilterPanelActions({
  onClear,
  onApply,
  clearText = "Clear Filters",
  applyText = "Apply",
}: FilterPanelActionsProps) {
  return (
    <div className="flex gap-2 pt-2" data-slot="filter-panel-actions">
      {onClear && (
        <Button className="flex-1" onClick={onClear} size="sm" variant="outline">
          {clearText}
        </Button>
      )}
      {onApply && (
        <Button className="flex-1" onClick={onApply} size="sm">
          {applyText}
        </Button>
      )}
    </div>
  );
}

export {
  FilterPanel,
  FilterPanelSection,
  FilterPanelLabel,
  FilterPanelDateRange,
  FilterPanelMultiSelect,
  FilterPanelActions,
};
