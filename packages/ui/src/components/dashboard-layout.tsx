"use client";

import { cn } from "@starter-saas/ui/utils";
import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "./sidebar";

type DashboardLayoutProps = {
  /**
   * Sidebar header content (logo, user menu, etc.)
   */
  sidebarHeader?: React.ReactNode;
  /**
   * Sidebar navigation content
   */
  sidebarContent: React.ReactNode;
  /**
   * Sidebar footer content (user profile, settings, etc.)
   */
  sidebarFooter?: React.ReactNode;
  /**
   * Main content area
   */
  children: React.ReactNode;
  /**
   * Sidebar variant
   */
  variant?: "sidebar" | "floating" | "inset";
  /**
   * Default sidebar open state
   */
  defaultOpen?: boolean;
  /**
   * Custom className for wrapper
   */
  className?: string;
  /**
   * Mobile header title text
   */
  mobileHeaderTitle?: string;
};

/**
 * DashboardLayout component for standard application layouts with sidebar navigation.
 *
 * Builds on the existing Sidebar component system to provide a consistent dashboard structure.
 *
 * @example
 * <DashboardLayout
 *   sidebarHeader={<Logo />}
 *   sidebarContent={<Navigation />}
 *   sidebarFooter={<UserProfile />}
 * >
 *   <PageHeader>
 *     <PageHeaderTitle>Dashboard</PageHeaderTitle>
 *   </PageHeader>
 *   <div className="p-6">
 *     {content}
 *   </div>
 * </DashboardLayout>
 */
export function DashboardLayout({
  sidebarHeader,
  sidebarContent,
  sidebarFooter,
  children,
  variant = "inset",
  defaultOpen = true,
  className,
  mobileHeaderTitle = "starter-saas",
}: DashboardLayoutProps) {
  return (
    <SidebarProvider className={className} defaultOpen={defaultOpen}>
      <Sidebar collapsible="icon" variant={variant}>
        {sidebarHeader && <SidebarHeader>{sidebarHeader}</SidebarHeader>}
        <SidebarContent>{sidebarContent}</SidebarContent>
        {sidebarFooter && <SidebarFooter>{sidebarFooter}</SidebarFooter>}
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {/* Mobile header with sidebar trigger */}
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <span className="font-semibold">{mobileHeaderTitle}</span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * DashboardMain - Main content wrapper with consistent padding
 */
export function DashboardMain({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6", className)}
      data-slot="dashboard-main"
      {...props}
    />
  );
}

/**
 * DashboardSection - Content section with optional title
 */
interface DashboardSectionProps extends React.ComponentProps<"section"> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardSection({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: DashboardSectionProps) {
  return (
    <section className={cn("space-y-4", className)} data-slot="dashboard-section" {...props}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title && <h2 className="font-semibold text-2xl tracking-tight">{title}</h2>}
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * DashboardGrid - Responsive grid for cards and widgets
 */
interface DashboardGridProps extends React.ComponentProps<"div"> {
  /**
   * Number of columns on different breakpoints
   */
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function DashboardGrid({
  cols = { default: 1, md: 2, lg: 3 },
  className,
  ...props
}: DashboardGridProps) {
  const gridClasses = cn(
    "grid gap-4",
    cols.default === 1 && "grid-cols-1",
    cols.default === 2 && "grid-cols-2",
    cols.default === 3 && "grid-cols-3",
    cols.default === 4 && "grid-cols-4",
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className,
  );

  return <div className={gridClasses} data-slot="dashboard-grid" {...props} />;
}
