"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Project } from "@/types";

export default function AdminProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const projectsQuery = useApiQuery<Project[]>(["admin", "projects"], "/projects", {
    fallback: [],
    params: { limit: 200 },
  });

  const filtered = projectsQuery.data.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const active = projectsQuery.data.filter((p) => p.status === "IN_PROGRESS").length;
  const completed = projectsQuery.data.filter((p) => p.status === "COMPLETED").length;
  const totalBudget = projectsQuery.data.reduce((sum, p) => sum + Number(p.budget ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="All projects"
        description="Every engagement across the agency, from kickoff to delivery."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total projects" value={projectsQuery.data.length} icon={FolderKanban} loading={projectsQuery.isLoading} />
        <StatCard label="In progress" value={active} loading={projectsQuery.isLoading} hint="Currently active" />
        <StatCard label="Completed" value={completed} loading={projectsQuery.isLoading} hint="Delivered" />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search projects..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Project",
            render: (p) => (
              <div>
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.client ? `${p.client.firstName} ${p.client.lastName}` : "Internal"}</p>
              </div>
            ),
          },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "priority", header: "Priority", hideOnMobile: true, render: (p) => <StatusBadge status={p.priority} /> },
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
          { key: "budget", header: "Budget", hideOnMobile: true, render: (p) => formatCurrency(p.budget) },
          { key: "endDate", header: "Due", hideOnMobile: true, render: (p) => formatDate(p.endDate) },
        ]}
        data={filtered}
        keyField={(p) => p.id}
        isLoading={projectsQuery.isLoading}
        isError={projectsQuery.isUnavailable}
        errorMessage={projectsQuery.errorMessage}
        onRetry={() => projectsQuery.refetch()}
        onRowClick={(p) => router.push(`/pm/projects/${p.id}`)}
        emptyTitle="No projects yet"
        emptyDescription="Projects created by the delivery team will show up here."
      />

      <p className="text-xs text-muted-foreground">
        Combined budget across all projects: <span className="font-medium text-foreground">{formatCurrency(totalBudget)}</span>
      </p>
    </div>
  );
}
