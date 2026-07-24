"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CardsSkeleton } from "@/components/dashboard/loading-skeleton";
import { useApiQuery } from "@/hooks/use-api";
import type { ApiUser, Permission } from "@/types";
import { titleCase } from "@/lib/format";

const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: "Unrestricted access to every module, including platform settings and API keys.",
  ADMIN: "Manage users, projects, billing and platform-wide configuration.",
  SALES: "Own the CRM: leads, pipeline, deals, contacts and follow-ups.",
  HR: "Manage employees, recruitment, payroll, attendance and leave.",
  PROJECT_MANAGER: "Plan and run delivery: projects, sprints, tasks and team workload.",
  DEVELOPER: "Execute assigned tasks, log time and collaborate on projects.",
  DESIGNER: "Execute assigned design tasks and collaborate on projects.",
  QA: "Track bugs, verify releases and manage quality across projects.",
  CLIENT: "View project progress, invoices, contracts and raise support tickets.",
};

export default function AdminRolesPage() {
  const usersQuery = useApiQuery<ApiUser[]>(["admin", "users", "roles"], "/users", {
    fallback: [],
    params: { limit: 200 },
  });
  const permissionsQuery = useApiQuery<Permission[]>(["admin", "permissions"], "/permissions", {
    fallback: [],
  });

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    usersQuery.data.forEach((u) => map.set(u.role, (map.get(u.role) ?? 0) + 1));
    return map;
  }, [usersQuery.data]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Roles & permissions"
        description="Nine built-in roles govern access across every workspace in TechAI."
      />

      {usersQuery.isLoading ? (
        <CardsSkeleton count={9} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
            <div key={role} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  {counts.get(role) ?? 0} members
                </span>
              </div>
              <p className="mt-4 font-display text-base font-semibold text-foreground">{titleCase(role)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Permission matrix</h2>
        <DataTable
          columns={[
            { key: "module", header: "Module" },
            { key: "action", header: "Action" },
            { key: "name", header: "Permission key", hideOnMobile: true },
            { key: "description", header: "Description", render: (p) => p.description ?? "—" },
          ]}
          data={permissionsQuery.data}
          keyField={(p) => p.id}
          isLoading={permissionsQuery.isLoading}
          isError={permissionsQuery.isUnavailable}
          errorMessage={permissionsQuery.errorMessage}
          onRetry={() => permissionsQuery.refetch()}
          emptyState={
            <EmptyState
              title="Permission catalog not available"
              description="Fine-grained permissions will appear here once the permissions API is connected."
            />
          }
        />
      </div>
    </div>
  );
}
