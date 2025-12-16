import type { AutoFormFieldProps } from "@autoform/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter-saas/ui/select";
import { cn } from "@starter-saas/ui/utils";
import type React from "react";

export const SelectField: React.FC<AutoFormFieldProps> = ({ field, inputProps, error, id }) => (
  <Select
    {...inputProps}
    defaultValue={field.default}
    onValueChange={(value) => {
      const syntheticEvent = {
        target: {
          value,
          name: field.key,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      inputProps.onChange(syntheticEvent);
    }}
  >
    <SelectTrigger className={cn(error && "border-destructive")} id={id}>
      <SelectValue placeholder={inputProps.placeholder} />
    </SelectTrigger>
    <SelectContent>
      {(field.options || []).map(([optionKey, label]) => (
        <SelectItem key={optionKey} value={optionKey}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
