"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { Milestone, Project } from "@/types";

interface MilestoneWithProject extends Milestone {
  project?: { id: string; name: string };
}

export default function ClientMilestonesPage() {
  const milestonesQuery = useApiQuery<MilestoneWithProject[]>(["client", "milestones"], "/client/milestones", {
    fallback: [],
  });
  const projectsQuery = useApiQuery<Project[]>(["client", "projects", "for-milestones"], "/client/projects", {
    fallback: [],
  });

  if (milestonesQuery.isLoading) return <PageSkeleton />;

  const grouped = new Map<string, MilestoneWithProject[]>();
  milestonesQuery.data.forEach((m) => {
    const key = m.project?.name ?? m.projectId;
    grouped.set(key, [...(grouped.get(key) ?? []), m]);
  });

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Client Portal" title="Milestones" description="Track key delivery checkpoints across every active project." />

      {milestonesQuery.isUnavailable ? (
        <EmptyState
          variant="error"
          title="Couldn't load milestones"
          description={milestonesQuery.errorMessage ?? undefined}
          action={{ label: "Retry", onClick: () => milestonesQuery.refetch() }}
        />
      ) : milestonesQuery.data.length === 0 ? (
        <EmptyState
          title="No milestones yet"
          description={
            projectsQuery.data.length === 0
              ? "Once your projects begin, milestones will show up here."
              : "Your project team hasn't published milestones yet."
          }
        />
      ) : (
        Array.from(grouped.entries()).map(([projectName, milestones]) => (
          <div key={projectName} className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">{projectName}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {milestones
                .sort((a, b) => a.order - b.order)
                .map((m) => (
                  <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        {m.isCompleted ? (
                          <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.title}</p>
                          {m.description && <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>}
                        </div>
                      </div>
                      <StatusBadge status={m.isCompleted ? "COMPLETED" : "PENDING"} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Due {formatDate(m.dueDate)}</p>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
