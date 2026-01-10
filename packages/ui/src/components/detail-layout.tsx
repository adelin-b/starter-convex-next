"use client";

import { cn } from "@starter-saas/ui/utils";
import { ChevronLeft } from "lucide-react";
import type * as React from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { Button } from "./button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";

const DEFAULT_LIST_SIZE = 35;
const DEFAULT_DETAIL_SIZE = 65;
const MIN_LIST_SIZE = 20;
const MIN_DETAIL_SIZE = 50;

type DetailLayoutProps = {
  /**
   * List/sidebar content (left panel)
   */
  list: React.ReactNode;
  /**
   * Detail/main content (right panel)
   */
  detail: React.ReactNode;
  /**
   * Default size percentages [list, detail]
   */
  defaultSize?: [number, number];
  /**
   * Minimum size percentages [list, detail]
   */
  minSize?: [number, number];
  /**
   * Whether detail panel is currently open (mobile)
   */
  detailOpen?: boolean;
  /**
   * Callback when detail panel opens/closes (mobile)
   */
  onDetailOpenChange?: (open: boolean) => void;
  /**
   * Custom className
   */
  className?: string;
};

/**
 * DetailLayout component for split view list + detail interfaces.
 *
 * On desktop, displays a resizable split view.
 * On mobile, displays list or detail in full screen with navigation.
 *
 * @example
 * <DetailLayout
 *   list={
 *     <div className="space-y-2">
 *       <AgentListItem onClick={() => setSelectedId(agent.id)} />
 *     </div>
 *   }
 *   detail={
 *     selectedId ? (
 *       <AgentDetails id={selectedId} />
 *     ) : (
 *       <EmptyState title="Select an agent" />
 *     )
 *   }
 *   defaultSize={[35, 65]}
 *   detailOpen={!!selectedId}
 *   onDetailOpenChange={(open) => !open && setSelectedId(null)}
 * />
 */
export function DetailLayout({
  list,
  detail,
  defaultSize = [DEFAULT_LIST_SIZE, DEFAULT_DETAIL_SIZE],
  minSize = [MIN_LIST_SIZE, MIN_DETAIL_SIZE],
  detailOpen = false,
  onDetailOpenChange,
  className,
}: DetailLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        className={cn("relative h-full", className)}
        data-mobile="true"
        data-slot="detail-layout"
      >
        {/* List view */}
        <div
          className={cn(
            "h-full transition-transform duration-200",
            detailOpen && "-translate-x-full",
          )}
        >
          {list}
        </div>

        {/* Detail view (overlays on mobile) */}
        <div
          className={cn(
            "absolute inset-0 bg-background transition-transform duration-200",
            !detailOpen && "translate-x-full",
          )}
        >
          <DetailLayoutMobileHeader onClose={() => onDetailOpenChange?.(false)} />
          {detail}
        </div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      className={cn("h-full", className)}
      data-slot="detail-layout"
      orientation="horizontal"
    >
      <ResizablePanel defaultSize={defaultSize[0]} minSize={minSize[0]}>
        <div className="h-full overflow-auto" data-slot="detail-layout-list">
          {list}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={defaultSize[1]} minSize={minSize[1]}>
        <div className="h-full overflow-auto" data-slot="detail-layout-detail">
          {detail}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

/**
 * DetailLayoutMobileHeader - Back button for mobile detail view
 */
type DetailLayoutMobileHeaderProps = {
  onClose: () => void;
  backLabel?: string;
};

function DetailLayoutMobileHeader({
  onClose,
  backLabel = "Back to list",
}: DetailLayoutMobileHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b p-4" data-slot="detail-layout-mobile-header">
      <Button onClick={onClose} size="icon" variant="ghost">
        <ChevronLeft className="size-4" />
        <span className="sr-only">{backLabel}</span>
      </Button>
    </div>
  );
}

/**
 * DetailLayoutList - Wrapper for list content with consistent styling
 */
export function DetailLayoutList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-4", className)}
      data-slot="detail-layout-list-content"
      {...props}
    />
  );
}

/**
 * DetailLayoutDetail - Wrapper for detail content with consistent styling
 */
export function DetailLayoutDetail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("p-6", className)} data-slot="detail-layout-detail-content" {...props} />
  );
}

/**
 * DetailLayoutDetailHeader - Header section for detail panel
 */
interface DetailLayoutDetailHeaderProps extends React.ComponentProps<"div"> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DetailLayoutDetailHeader({
  title,
  description,
  actions,
  className,
  ...props
}: DetailLayoutDetailHeaderProps) {
  return (
    <div
      className={cn("space-y-4 pb-6", className)}
      data-slot="detail-layout-detail-header"
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-bold text-2xl tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/**
 * DetailLayoutDetailSection - Content section within detail panel
 */
interface DetailLayoutDetailSectionProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
}

export function DetailLayoutDetailSection({
  title,
  description,
  className,
  children,
  ...props
}: DetailLayoutDetailSectionProps) {
  return (
    <div className={cn("space-y-4", className)} data-slot="detail-layout-detail-section" {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="font-semibold text-lg">{title}</h3>}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
