"use client";

import Link from "next/link";
import { ArrowUpRight, FolderKanban, ListTodo, Bug as BugIcon, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { Project } from "@/types";

export default function PmOverviewPage() {
  const projectsQuery = useApiQuery<Project[]>(["pm", "projects", "overview"], "/projects", {
    fallback: [],
    params: { limit: 100 },
  });

  const projects = projectsQuery.data;
  const active = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const onHold = projects.filter((p) => p.status === "ON_HOLD").length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const avgProgress = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  const statusChart = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Management"
        title="Delivery overview"
        description="A live snapshot of every project currently in flight."
        actions={
          <Button asChild variant="outline">
            <Link href="/pm/projects">
              All projects
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active projects" value={active} icon={FolderKanban} loading={projectsQuery.isLoading} hint={`${projects.length} total`} />
        <StatCard label="On hold" value={onHold} icon={ListTodo} loading={projectsQuery.isLoading} />
        <StatCard label="Completed" value={completed} icon={Users} loading={projectsQuery.isLoading} />
        <StatCard label="Average progress" value={`${avgProgress}%`} icon={BugIcon} loading={projectsQuery.isLoading} />
      </div>

      <ChartCard
        title="Projects by status"
        description="Distribution of every project in the workspace"
        isLoading={projectsQuery.isLoading}
        isEmpty={statusChart.length === 0}
        emptyLabel="No projects yet."
        height={260}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusChart}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-border" stroke="currentColor" />
            <XAxis dataKey="status" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} width={30} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Active projects</h2>
        <DataTable
          columns={[
            { key: "name", header: "Project" },
            { key: "manager", header: "PM", hideOnMobile: true, render: (p) => (p.manager ? `${p.manager.firstName} ${p.manager.lastName}` : "—") },
            { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
            {
              key: "progress",
              header: "Progress",
              render: (p) => (
                <div className="flex items-center gap-2">
                  <Progress value={p.progress} className="w-24" />
                  <span className="text-xs text-muted-foreground">{p.progress}%</span>
                </div>
              ),
            },
            { key: "endDate", header: "Due", hideOnMobile: true, render: (p) => formatDate(p.endDate) },
          ]}
          data={projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "PLANNING").slice(0, 8)}
          keyField={(p) => p.id}
          isLoading={projectsQuery.isLoading}
          isError={projectsQuery.isUnavailable}
          errorMessage={projectsQuery.errorMessage}
          onRetry={() => projectsQuery.refetch()}
          emptyTitle="No active projects"
          emptyDescription="Kick off a new project to see it tracked here."
        />
      </div>
    </div>
  );
}
