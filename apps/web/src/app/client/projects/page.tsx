"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Progress } from "@/components/ui/progress";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Project } from "@/types";

export default function ClientProjectsPage() {
  const router = useRouter();
  const projectsQuery = useApiQuery<Project[]>(["client", "projects"], "/client/projects", { fallback: [] });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client Portal"
        title="Your projects"
        description="Every engagement TechAI is delivering for your organization."
      />

      <DataTable
        columns={[
          {
            key: "name",
            header: "Project",
            render: (p) => (
              <div>
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.manager ? `Managed by ${p.manager.firstName} ${p.manager.lastName}` : "Delivery team"}
                </p>
              </div>
            ),
          },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          {
            key: "progress",
            header: "Progress",
            render: (p) => (
              <div className="flex items-center gap-2">
                <Progress value={p.progress} className="w-28" />
                <span className="text-xs text-muted-foreground">{p.progress}%</span>
              </div>
            ),
          },
          { key: "budget", header: "Budget", hideOnMobile: true, render: (p) => formatCurrency(p.budget) },
          { key: "endDate", header: "Target date", hideOnMobile: true, render: (p) => formatDate(p.endDate) },
        ]}
        data={projectsQuery.data}
        keyField={(p) => p.id}
        isLoading={projectsQuery.isLoading}
        isError={projectsQuery.isUnavailable}
        errorMessage={projectsQuery.errorMessage}
        onRetry={() => projectsQuery.refetch()}
        onRowClick={(p) => router.push(`/client/projects/${p.id}`)}
        emptyTitle="No projects yet"
        emptyDescription="Once TechAI kicks off a project for you, it will appear here."
      />
    </div>
  );
}
