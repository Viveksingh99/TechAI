"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Progress } from "@/components/ui/progress";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { Project } from "@/types";

export default function EmployeeProjectsPage() {
  const router = useRouter();
  const projectsQuery = useApiQuery<Project[]>(["employee", "projects"], "/employee/projects", { fallback: [] });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My Workspace" title="My projects" description="Projects you're currently a member of." />

      <DataTable
        columns={[
          {
            key: "name",
            header: "Project",
            render: (p) => (
              <div>
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.manager ? `PM: ${p.manager.firstName} ${p.manager.lastName}` : "—"}</p>
              </div>
            ),
          },
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
        data={projectsQuery.data}
        keyField={(p) => p.id}
        isLoading={projectsQuery.isLoading}
        isError={projectsQuery.isUnavailable}
        errorMessage={projectsQuery.errorMessage}
        onRetry={() => projectsQuery.refetch()}
        onRowClick={(p) => router.push(`/pm/projects/${p.id}`)}
        emptyTitle="No projects assigned"
        emptyDescription="You'll see projects here once you're added as a team member."
      />
    </div>
  );
}
