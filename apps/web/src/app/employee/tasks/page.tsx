"use client";

import * as React from "react";
import { LayoutGrid, List } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { KanbanBoard, type KanbanColumn } from "@/components/dashboard/kanban-board";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Task } from "@/types";

const COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

export default function EmployeeTasksPage() {
  const [view, setView] = React.useState<"board" | "list">("board");
  const tasksQuery = useApiQuery<Task[]>(["employee", "tasks"], "/employee/tasks", { fallback: [] });

  const updateStatus = useApiMutation<{ id: string; status: string }>(
    async ({ id, status }) => (await api.patch(`/tasks/${id}`, { status })).data,
    { invalidateKeys: [["employee", "tasks"]] }
  );

  const columns: KanbanColumn<Task>[] = COLUMNS.map((c) => ({
    id: c.id,
    title: c.title,
    items: tasksQuery.data.filter((t) => t.status === c.id),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Workspace"
        title="Tasks"
        description="Everything assigned to you, organized by status."
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1">
            <ViewToggle icon={LayoutGrid} active={view === "board"} onClick={() => setView("board")} label="Board" />
            <ViewToggle icon={List} active={view === "list"} onClick={() => setView("list")} label="List" />
          </div>
        }
      />

      {tasksQuery.isUnavailable ? (
        <DataTable
          columns={[{ key: "title", header: "Task" }]}
          data={[]}
          keyField={() => ""}
          isError
          errorMessage={tasksQuery.errorMessage}
          onRetry={() => tasksQuery.refetch()}
        />
      ) : view === "board" ? (
        tasksQuery.isLoading ? (
          <div className="flex gap-4">
            {COLUMNS.map((c) => (
              <div key={c.id} className="h-64 w-[280px] shrink-0 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <KanbanBoard
            columns={columns}
            keyField={(t) => t.id}
            onMove={(taskId, _fromColumnId, toColumnId) => updateStatus.mutate({ id: taskId, status: toColumnId })}
            renderCard={(t) => (
              <div className="space-y-2">
                <p className="text-sm font-medium leading-snug text-foreground">{t.title}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={t.priority} />
                  {t.dueDate && <span className="text-xs text-muted-foreground">{formatDate(t.dueDate, "MMM d")}</span>}
                </div>
              </div>
            )}
          />
        )
      ) : (
        <DataTable
          columns={[
            { key: "title", header: "Task" },
            { key: "project", header: "Project", hideOnMobile: true, render: (t) => t.project?.name ?? "—" },
            { key: "priority", header: "Priority", render: (t) => <StatusBadge status={t.priority} /> },
            { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
            { key: "dueDate", header: "Due", render: (t) => formatDate(t.dueDate) },
          ]}
          data={tasksQuery.data}
          keyField={(t) => t.id}
          isLoading={tasksQuery.isLoading}
          emptyTitle="No tasks assigned"
          emptyDescription="Tasks assigned to you will appear here."
        />
      )}
    </div>
  );
}

function ViewToggle({
  icon: Icon,
  active,
  onClick,
  label,
}: {
  icon: typeof LayoutGrid;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      className={cn("rounded-lg px-3", active && "bg-card shadow-sm")}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
