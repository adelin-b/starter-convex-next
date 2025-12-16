"use client";

import { DashboardMain } from "@starter-saas/ui/dashboard-layout";
import { ErrorBoundary, PageErrorFallback } from "@starter-saas/ui/error-boundary";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBreadcrumb,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@starter-saas/ui/page-header";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PageLayoutProps = {
  /**
   * Page title displayed in header
   */
  title: ReactNode;
  /**
   * Optional page description
   */
  description?: ReactNode;
  /**
   * Optional icon to display next to title
   */
  icon?: LucideIcon;
  /**
   * Optional breadcrumb content
   */
  breadcrumb?: ReactNode;
  /**
   * Optional action buttons for the header
   */
  actions?: ReactNode;
  /**
   * Page content
   */
  children: ReactNode;
  /**
   * Optional className for the main wrapper
   */
  className?: string;
};

/**
 * Consistent page layout component with error boundary, header, and main content area.
 *
 * @example
 * <PageLayout
 *   title="Organizations"
 *   description="Manage your organizations"
 *   icon={Building2}
 *   actions={<Button>Add Organization</Button>}
 * >
 *   {content}
 * </PageLayout>
 */
export function PageLayout({
  title,
  description,
  icon: Icon,
  breadcrumb,
  actions,
  children,
  className,
}: PageLayoutProps) {
  return (
    <ErrorBoundary fallback={PageErrorFallback}>
      <DashboardMain className={className}>
        {breadcrumb && <PageHeaderBreadcrumb>{breadcrumb}</PageHeaderBreadcrumb>}
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-8 w-8" />}
              {title}
            </PageHeaderTitle>
            {description && <PageHeaderDescription>{description}</PageHeaderDescription>}
          </PageHeaderContent>
          {actions && <PageHeaderActions>{actions}</PageHeaderActions>}
        </PageHeader>
        {children}
      </DashboardMain>
    </ErrorBoundary>
  );
}
