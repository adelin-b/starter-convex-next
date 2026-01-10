"use client";

import type { DataInputViewSpec, FilterTheme } from "@fn-sphere/filter";
import { presetTheme } from "@fn-sphere/filter";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { cn } from "../../utils";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { Popover, PopoverContent, PopoverPositioner, PopoverTrigger } from "../popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

/**
 * Shadcn-styled Button component for fn-sphere
 */
function ShadcnButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className={cn("h-8 text-sm", className)}
      size="sm"
      type="button"
      variant="outline"
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Shadcn-styled Input component for fn-sphere
 */
function ShadcnInput({
  onChange,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange?: (value: string) => void;
}) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );

  return <Input className={cn("h-8 w-32 text-sm", className)} onChange={handleChange} {...props} />;
}

/**
 * Shadcn-styled single Select component for fn-sphere
 * Uses index-based selection to handle complex object values
 */
function ShadcnSelect<T>({
  options = [],
  value,
  onChange,
}: {
  value?: T;
  options?: { value: T; label: string }[];
  onChange?: (value: T) => void;
}) {
  // Find selected index by comparing object references
  const selectedIdx = options.findIndex((option) => option.value === value);
  const selectedLabel = selectedIdx === -1 ? "" : options[selectedIdx].label;

  const handleChange = useCallback(
    (indexStr: string) => {
      const idx = Number.parseInt(indexStr, 10);
      const option = options[idx];
      if (option) {
        onChange?.(option.value);
      }
    },
    [options, onChange],
  );

  return (
    <Select
      onValueChange={handleChange}
      value={selectedIdx === -1 ? undefined : String(selectedIdx)}
    >
      <SelectTrigger className="h-8 w-36 text-sm">
        <SelectValue placeholder="Select...">{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option, idx) => (
          <SelectItem key={idx} value={String(idx)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Shadcn-styled multi-select component for fn-sphere
 * Uses checkboxes in a dropdown for better UX
 */
function ShadcnMultiSelect<T>({
  options = [],
  value = [],
  onChange,
}: {
  value?: T[];
  options?: { value: T; label: string }[];
  onChange?: (value: T[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedLabels = useMemo(
    () =>
      options
        .filter((opt) => value.includes(opt.value))
        .map((opt) => opt.label)
        .join(", "),
    [options, value],
  );

  const handleToggle = (optionValue: T) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button className="h-8 w-40 justify-start font-normal text-sm" variant="outline">
            <span className="truncate">{selectedLabels || "Select..."}</span>
          </Button>
        }
      />
      <PopoverPositioner align="start">
        <PopoverContent className="w-48 p-2">
          <div className="space-y-2">
            {options.map((option, idx) => {
              const checkboxId = `multi-select-${idx}`;
              return (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-accent"
                  htmlFor={checkboxId}
                  key={idx}
                >
                  <Checkbox
                    checked={value.includes(option.value)}
                    id={checkboxId}
                    onCheckedChange={() => handleToggle(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
}

/**
 * Custom date picker using shadcn Calendar in a Popover
 */
const dateInputSpec: DataInputViewSpec = {
  name: "shadcn-date-picker",
  match: [z.date()],
  view({ rule, updateInput }) {
    const currentValue = rule.args[0] as Date | undefined;
    const [open, setOpen] = useState(false);

    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={
            <Button
              className={cn(
                "h-8 w-40 justify-start font-normal text-sm",
                !currentValue && "text-muted-foreground",
              )}
              variant="outline"
            >
              <CalendarIcon className="mr-2 size-4" />
              {currentValue ? format(currentValue, "PPP") : "Pick a date"}
            </Button>
          }
        />
        <PopoverPositioner align="start">
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              onSelect={(date) => {
                if (date) {
                  updateInput(date);
                } else {
                  updateInput();
                }
                setOpen(false);
              }}
              selected={currentValue}
            />
          </PopoverContent>
        </PopoverPositioner>
      </Popover>
    );
  },
};

/**
 * Shadcn theme for fn-sphere filter builder
 * Provides polished UI using shadcn components
 */
export const shadcnFilterTheme: FilterTheme = {
  primitives: {
    button: (props) => <button type="button" {...props} />,
    input: (props) => <input {...props} />,
    select: (props) => <select {...props} />,
    option: (props) => <option {...props} />,
  },
  components: {
    Button: ShadcnButton,
    Input: ShadcnInput,
    Select: ShadcnSelect,
    MultipleSelect: ShadcnMultiSelect,
    // Use preset's ErrorBoundary or provide fallback
    ErrorBoundary: presetTheme.components.ErrorBoundary,
  },
  templates: {
    // Use preset templates but they'll use our shadcn components
    ...presetTheme.templates,
  },
  dataInputViews: [
    // Custom date picker first (takes priority)
    dateInputSpec,
    // Then use preset views for other types
    ...presetTheme.dataInputViews.filter((spec) => spec.name !== "date"),
  ],
};
