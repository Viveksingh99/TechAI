import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  loading,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  loading?: boolean;
  hint?: string;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="mt-3 h-7 w-24" />
        <Skeleton className="mt-3 h-3 w-28" />
      </div>
    );
  }

  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <div className="mt-2 flex items-center gap-1.5">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              isPositive ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(trend.value)}%
          </span>
        )}
        {(trend?.label || hint) && (
          <span className="text-xs text-muted-foreground">{trend?.label ?? hint}</span>
        )}
      </div>
    </div>
  );
}
