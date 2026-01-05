import { cn } from "@starter-saas/ui/utils";

/**
 * PageHeader component for consistent page title, description, and action areas.
 *
 * @example
 * <PageHeader>
 *   <PageHeaderContent>
 *     <PageHeaderTitle>Agents</PageHeaderTitle>
 *     <PageHeaderDescription>
 *       Manage your AI voice agents and organize them into folders
 *     </PageHeaderDescription>
 *   </PageHeaderContent>
 *   <PageHeaderActions>
 *     <Button>Create Agent</Button>
 *   </PageHeaderActions>
 * </PageHeader>
 */
function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}
      data-slot="page-header"
      {...props}
    />
  );
}

function PageHeaderContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex-1 space-y-1", className)} data-slot="page-header-content" {...props} />
  );
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn("font-bold text-3xl tracking-tight", className)}
      data-slot="page-header-title"
      {...props}
    />
  );
}

function PageHeaderDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-base text-muted-foreground", className)}
      data-slot="page-header-description"
      {...props}
    />
  );
}

function PageHeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-shrink-0 items-center gap-2 self-start sm:self-center", className)}
      data-slot="page-header-actions"
      {...props}
    />
  );
}

/**
 * Breadcrumb area for page header (optional)
 */
function PageHeaderBreadcrumb({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-2", className)} data-slot="page-header-breadcrumb" {...props} />;
}

export {
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
  PageHeaderBreadcrumb,
};
