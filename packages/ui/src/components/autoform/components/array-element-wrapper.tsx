import type { ArrayElementWrapperProps } from "@autoform/react";
import { Button } from "@starter-saas/ui/button";
import { TrashIcon } from "lucide-react";
import type React from "react";

export const ArrayElementWrapper: React.FC<ArrayElementWrapperProps> = ({ children, onRemove }) => (
  <div className="relative mt-2 rounded-md border p-4">
    <Button
      className="absolute top-2 right-2"
      onClick={onRemove}
      size="sm"
      type="button"
      variant="ghost"
    >
      <TrashIcon className="h-4 w-4" />
    </Button>
    {children}
  </div>
);
