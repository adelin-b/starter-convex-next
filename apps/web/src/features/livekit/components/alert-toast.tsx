"use client";

import { WarningIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/livekit/alert";

type ToastProps = {
  id: string | number;
  title: ReactNode;
  description: ReactNode;
};

export function toastAlert(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom(
    (id) => <AlertToast description={toast.description} id={id} title={toast.title} />,
    { duration: 10_000 },
  );
}

export function AlertToast(props: ToastProps) {
  const { title, description, id } = props;

  return (
    <Alert className="bg-accent" onClick={() => sonnerToast.dismiss(id)}>
      <WarningIcon weight="bold" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
