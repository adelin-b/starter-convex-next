import type React from "react";
import { cn } from "@/lib/utils";

type ShimmerTextProps = {
  children: React.ReactNode;
  className?: string;
};

export function ShimmerText({
  children,
  className,
  ref,
}: ShimmerTextProps & React.RefAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("!bg-clip-text inline-block animate-text-shimmer text-transparent", className)}
      ref={ref}
    >
      {children}
    </span>
  );
}
