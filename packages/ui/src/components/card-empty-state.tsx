import type { LucideIcon } from "lucide-react";
import type React from "react";
import { Card, CardContent } from "./card";

export type CardEmptyStateProps = {
  /**
   * Icon component from lucide-react
   */
  icon: LucideIcon;
  /**
   * Title text
   */
  title: string;
  /**
   * Description text
   */
  description: string;
  /**
   * Optional action button or element
   */
  action?: React.ReactNode;
  /**
   * Additional className for the Card wrapper
   */
  className?: string;
};

/**
 * CardEmptyState - A consistent empty state component for dashboard pages
 *
 * Provides a standardized Card-based empty state with icon, title, description, and optional action.
 * Used across dashboard pages when data tables or lists are empty.
 *
 * @example
 * <CardEmptyState
 *   icon={FileText}
 *   title="No documents yet"
 *   description="Upload documents like PDFs, text files, or URLs to provide context to your voice AI agents"
 *   action={<Button>Upload Your First Document</Button>}
 * />
 */
export function CardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: CardEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Icon className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-lg">{title}</h3>
        <p className="mb-6 max-w-sm text-center text-muted-foreground text-sm">{description}</p>
        {action && action}
      </CardContent>
    </Card>
  );
}
