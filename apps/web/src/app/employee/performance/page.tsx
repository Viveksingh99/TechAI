"use client";

import { Star, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { PageHeader } from "@/components/dashboard/page-header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { PerformanceReview } from "@/types";

export default function EmployeePerformancePage() {
  const reviewsQuery = useApiQuery<PerformanceReview[]>(["employee", "performance"], "/employee/performance", {
    fallback: [],
  });

  const sorted = [...reviewsQuery.data].sort(
    (a, b) => new Date(a.reviewPeriodEnd).getTime() - new Date(b.reviewPeriodEnd).getTime()
  );
  const latestRating = sorted.at(-1)?.rating;
  const avgRating = sorted.length ? sorted.reduce((sum, r) => sum + r.rating, 0) / sorted.length : 0;

  const chartData = sorted.map((r) => ({
    period: formatDate(r.reviewPeriodEnd, "MMM yyyy"),
    rating: r.rating,
  }));

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="My Workspace" title="Performance" description="Review history, ratings and growth feedback from your managers." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Latest rating" value={latestRating ? `${latestRating.toFixed(1)} / 5` : "—"} icon={Star} loading={reviewsQuery.isLoading} />
        <StatCard label="Average rating" value={avgRating ? `${avgRating.toFixed(1)} / 5` : "—"} icon={TrendingUp} loading={reviewsQuery.isLoading} />
      </div>

      <ChartCard
        title="Rating trend"
        description="How your performance rating has evolved over time"
        isLoading={reviewsQuery.isLoading}
        isEmpty={chartData.length === 0}
        emptyLabel="Not enough reviews yet to chart a trend."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-border" stroke="currentColor" />
            <XAxis dataKey="period" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 5]} stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} width={30} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
            <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2.5} dot />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Review history</h2>
        {reviewsQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        ) : reviewsQuery.isUnavailable ? (
          <EmptyState variant="error" title="Couldn't load reviews" description={reviewsQuery.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => reviewsQuery.refetch() }} />
        ) : sorted.length === 0 ? (
          <EmptyState title="No reviews yet" description="Performance reviews from your manager will appear here." />
        ) : (
          <div className="space-y-3">
            {sorted.reverse().map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-foreground">
                    {formatDate(r.reviewPeriodStart)} – {formatDate(r.reviewPeriodEnd)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(r.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
                {r.strengths && (
                  <p className="mt-3 text-sm text-foreground">
                    <span className="font-medium">Strengths: </span>
                    {r.strengths}
                  </p>
                )}
                {r.improvements && (
                  <p className="mt-1 text-sm text-foreground">
                    <span className="font-medium">Areas to improve: </span>
                    {r.improvements}
                  </p>
                )}
                {r.goals && (
                  <p className="mt-1 text-sm text-foreground">
                    <span className="font-medium">Goals: </span>
                    {r.goals}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
