import type { ArrayWrapperProps } from "@autoform/react";
import { Button } from "@starter-saas/ui/button";
import { PlusIcon } from "lucide-react";
import type React from "react";

export const ArrayWrapper: React.FC<ArrayWrapperProps> = ({ label, children, onAddItem }) => (
  <div className="space-y-4">
    <h3 className="font-medium text-lg">{label}</h3>
    {children}
    <Button onClick={onAddItem} size="sm" type="button" variant="outline">
      <PlusIcon className="h-4 w-4" />
    </Button>
  </div>
);
