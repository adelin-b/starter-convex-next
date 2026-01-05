import type { FieldWrapperProps } from "@autoform/react";
import { Label } from "@starter-saas/ui/label";
import type React from "react";

const DISABLED_LABELS = new Set(["boolean", "object", "array"]);

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  children,
  id,
  field,
  error,
}) => {
  const isDisabled = DISABLED_LABELS.has(field.type);

  return (
    <div className="space-y-2">
      {!isDisabled && (
        <Label htmlFor={id}>
          {label}
          {field.required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      {children}
      {field.fieldConfig?.description && (
        <p className="text-muted-foreground text-sm">{field.fieldConfig.description}</p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};
