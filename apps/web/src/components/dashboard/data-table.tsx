import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableSkeleton } from "@/components/dashboard/loading-skeleton";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  onRowClick,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyTitle = "No records yet",
  emptyDescription = "Data will show up here once it's available.",
  emptyState,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyState?: ReactNode;
}) {
  if (isLoading) return <TableSkeleton cols={columns.length} />;

  if (isError) {
    return (
      <EmptyState
        variant="error"
        title="Couldn't load data"
        description={errorMessage ?? "The API didn't respond. Check your connection and try again."}
        action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
      />
    );
  }

  if (!data.length) {
    return emptyState ?? <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    col.hideOnMobile && "hidden sm:table-cell",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={keyField(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border last:border-b-0 transition-colors hover:bg-secondary/30",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-5 py-3.5 align-middle text-foreground",
                      col.hideOnMobile && "hidden sm:table-cell",
                      col.className
                    )}
                  >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
