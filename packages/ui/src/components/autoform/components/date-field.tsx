import type { AutoFormFieldProps } from "@autoform/react";
import { Input } from "@starter-saas/ui/input";
import type React from "react";

export const DateField: React.FC<AutoFormFieldProps> = ({ inputProps, error, id }) => (
  <Input className={error ? "border-destructive" : ""} id={id} type="date" {...inputProps} />
);
