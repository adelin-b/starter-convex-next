import { Alert, AlertTitle } from "@starter-saas/ui/alert";
import { AlertCircle } from "lucide-react";
import type React from "react";

export const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{error}</AlertTitle>
  </Alert>
);
