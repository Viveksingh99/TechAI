"use client";

import { GitBranch } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { KanbanBoard, type KanbanColumn } from "@/components/dashboard/kanban-board";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Deal, PipelineStage } from "@/types";

interface BoardColumn {
  stage: PipelineStage;
  deals: Deal[];
  totalValue: number;
}

export default function CrmPipelinePage() {
  const boardQuery = useApiQuery<BoardColumn[]>(["crm", "deals", "board"], "/crm/deals/board", { fallback: [] });

  const moveStage = useApiMutation<{ id: string; stageId: string }>(
    async ({ id, stageId }) => (await api.patch(`/crm/deals/${id}/stage`, { stageId })).data,
    { invalidateKeys: [["crm", "deals", "board"]] }
  );

  const totalPipelineValue = boardQuery.data.reduce((sum, c) => sum + c.totalValue, 0);
  const totalDeals = boardQuery.data.reduce((sum, c) => sum + c.deals.length, 0);

  const columns: KanbanColumn<Deal>[] = boardQuery.data.map((c) => ({
    id: c.stage.id,
    title: c.stage.name,
    items: c.deals,
  }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sales CRM" title="Pipeline" description="Drag deals between stages as they progress." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Deals in pipeline" value={totalDeals} icon={GitBranch} loading={boardQuery.isLoading} />
        <StatCard label="Total pipeline value" value={formatCurrency(totalPipelineValue)} loading={boardQuery.isLoading} />
      </div>

      {boardQuery.isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 w-[280px] shrink-0 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : boardQuery.isUnavailable ? (
        <EmptyState
          variant="error"
          title="Couldn't load pipeline"
          description={boardQuery.errorMessage ?? undefined}
          action={{ label: "Retry", onClick: () => boardQuery.refetch() }}
        />
      ) : columns.length === 0 ? (
        <EmptyState title="No pipeline stages yet" description="Set up pipeline stages to start tracking deals." />
      ) : (
        <KanbanBoard
          columns={columns}
          keyField={(d) => d.id}
          onMove={(dealId, _from, toStageId) => moveStage.mutate({ id: dealId, stageId: toStageId })}
          renderCard={(d) => (
            <div className="space-y-2">
              <p className="text-sm font-medium leading-snug text-foreground">{d.title}</p>
              <p className="text-xs text-muted-foreground">{d.company?.name ?? "—"}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(d.value, d.currency)}
                </span>
                {d.owner && (
                  <span className="text-xs text-muted-foreground">{d.owner.firstName}</span>
                )}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
