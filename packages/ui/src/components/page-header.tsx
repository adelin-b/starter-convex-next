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
      className={cn(
        "flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      data-slot="page-header"
      {...props}
    />
  );
}

function PageHeaderContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 space-y-1.5", className)}
      data-slot="page-header-content"
      {...props}
    />
  );
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn("font-semibold text-2xl tracking-tight sm:text-3xl", className)}
      data-slot="page-header-title"
      {...props}
    />
  );
}

function PageHeaderDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("max-w-2xl text-[0.9375rem] text-muted-foreground", className)}
      data-slot="page-header-description"
      {...props}
    />
  );
}

function PageHeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center gap-3 self-start pt-1 sm:self-center sm:pt-0",
        className,
      )}
      data-slot="page-header-actions"
      {...props}
    />
  );
}

/**
 * Breadcrumb area for page header (optional)
 */
function PageHeaderBreadcrumb({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-3", className)} data-slot="page-header-breadcrumb" {...props} />;
}

export {
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
  PageHeaderBreadcrumb,
};
