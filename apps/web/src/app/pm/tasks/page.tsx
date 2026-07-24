"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { KanbanBoard, type KanbanColumn } from "@/components/dashboard/kanban-board";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { unwrap, getErrorMessage, useApiMutation } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { Project, Task } from "@/types";

const COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

interface TaskWithProject extends Task {
  project: { id: string; name: string };
}

async function fetchAllTasks(): Promise<TaskWithProject[]> {
  const { data: projectsPayload } = await api.get("/projects", { params: { limit: 100 } });
  const projects = unwrap<Project[]>(projectsPayload, []);

  const results = await Promise.all(
    projects.map(async (p) => {
      try {
        const { data } = await api.get(`/projects/${p.id}/tasks`);
        const tasks = unwrap<Task[]>(data, []);
        return tasks.map((t) => ({ ...t, project: { id: p.id, name: p.name } }));
      } catch {
        return [];
      }
    })
  );

  return results.flat();
}

export default function PmTasksPage() {
  const router = useRouter();
  const [view, setView] = React.useState<"board" | "list">("board");

  const tasksQuery = useQuery({ queryKey: ["pm", "tasks", "all"], queryFn: fetchAllTasks });
  const data = tasksQuery.data ?? [];
  const isUnavailable = tasksQuery.isError;
  const errorMessage = tasksQuery.error ? getErrorMessage(tasksQuery.error) : null;

  const updateStatus = useApiMutation<{ projectId: string; id: string; status: string }>(
    async ({ projectId, id, status }) => (await api.patch(`/projects/${projectId}/tasks/${id}/status`, { status })).data,
    { invalidateKeys: [["pm", "tasks", "all"]] }
  );

  const columns: KanbanColumn<TaskWithProject>[] = COLUMNS.map((c) => ({
    id: c.id,
    title: c.title,
    items: data.filter((t) => t.status === c.id),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project Management"
        title="Tasks"
        description="Every task across every project, in one board."
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1">
            <ViewToggle icon={LayoutGrid} active={view === "board"} onClick={() => setView("board")} label="Board" />
            <ViewToggle icon={List} active={view === "list"} onClick={() => setView("list")} label="List" />
          </div>
        }
      />

      {isUnavailable ? (
        <EmptyState variant="error" title="Couldn't load tasks" description={errorMessage ?? undefined} action={{ label: "Retry", onClick: () => tasksQuery.refetch() }} />
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
            onMove={(taskId, _from, toStatus) => {
              const task = data.find((t) => t.id === taskId);
              if (task) updateStatus.mutate({ projectId: task.project.id, id: taskId, status: toStatus });
            }}
            renderCard={(t) => (
              <button className="w-full text-left" onClick={() => router.push(`/pm/projects/${t.project.id}`)}>
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-snug text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.project.name}</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={t.priority} />
                    {t.dueDate && <span className="text-xs text-muted-foreground">{formatDate(t.dueDate, "MMM d")}</span>}
                  </div>
                </div>
              </button>
            )}
          />
        )
      ) : (
        <DataTable
          columns={[
            { key: "title", header: "Task" },
            { key: "project", header: "Project", render: (t) => t.project.name },
            { key: "priority", header: "Priority", hideOnMobile: true, render: (t) => <StatusBadge status={t.priority} /> },
            { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
            { key: "dueDate", header: "Due", hideOnMobile: true, render: (t) => formatDate(t.dueDate) },
          ]}
          data={data}
          keyField={(t) => t.id}
          isLoading={tasksQuery.isLoading}
          onRowClick={(t) => router.push(`/pm/projects/${t.project.id}`)}
          emptyTitle="No tasks yet"
          emptyDescription="Tasks created across projects will appear here."
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
    <Button size="sm" variant="ghost" onClick={onClick} className={cn("rounded-lg px-3", active && "bg-card shadow-sm")}>
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
