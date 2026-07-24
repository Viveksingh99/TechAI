import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartCard({
  title,
  description,
  actions,
  height = 280,
  isEmpty,
  isLoading,
  emptyLabel = "Not enough data yet to chart.",
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  height?: number;
  isEmpty?: boolean;
  isLoading?: boolean;
  emptyLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {isLoading ? (
        <Skeleton style={{ height }} className="w-full rounded-xl" />
      ) : isEmpty ? (
        <div
          style={{ height }}
          className="flex items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 text-sm text-muted-foreground"
        >
          {emptyLabel}
        </div>
      ) : (
        <div style={{ height }}>{children}</div>
      )}
    </div>
  );
}
