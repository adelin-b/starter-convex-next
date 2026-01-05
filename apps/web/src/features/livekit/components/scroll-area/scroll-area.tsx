"use client";

import { useRef } from "react";
import { useAutoScroll } from "@/components/livekit/scroll-area/hooks/use-auto-scroll";
import { cn } from "@/lib/utils";

type ScrollAreaProps = {
  children?: React.ReactNode;
};

export function ScrollArea({
  className,
  children,
}: ScrollAreaProps & React.HTMLAttributes<HTMLDivElement>) {
  const scrollContentRef = useRef<HTMLDivElement>(null);

  useAutoScroll(scrollContentRef.current);

  return (
    <div className={cn("overflow-y-scroll scroll-smooth", className)} ref={scrollContentRef}>
      <div>{children}</div>
    </div>
  );
}
