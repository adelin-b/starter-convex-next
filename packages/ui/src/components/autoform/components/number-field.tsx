import type { AutoFormFieldProps } from "@autoform/react";
import { Input } from "@starter-saas/ui/input";
import { cn } from "@starter-saas/ui/utils";
import type React from "react";
import { deriveCompactInputSizing } from "../utils/input-sizing";

export const NumberField: React.FC<AutoFormFieldProps> = ({ inputProps, error, id }) => {
  const { key: reactKey, className, size, ...props } = inputProps;
  const sizing = deriveCompactInputSizing({ ...inputProps, type: "number" });

  return (
    <Input
      className={cn(error && "border-destructive", sizing.className, className)}
      id={id}
      key={reactKey}
      size={size ?? sizing.size}
      type="number"
      {...props}
    />
  );
};
