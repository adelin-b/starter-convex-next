/**
 * Empty state component for data table views
 *
 * Displays a consistent empty state message when no rows are available.
 * Used across all data table view components (list, gallery, feed, table, board).
 */
export function DataTableViewEmptyState({ message = "No items to display" }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}
