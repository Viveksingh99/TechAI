"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Users, FolderKanban, Wallet, LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useApiQuery } from "@/hooks/use-api";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { ApiUser, AuditLog, Project } from "@/types";

const CHART_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e", "#64748b"];

export default function AdminOverviewPage() {
  const users = useApiQuery<ApiUser[]>(["admin", "users", "overview"], "/users", {
    fallback: [],
    params: { limit: 100 },
  });
  const projects = useApiQuery<Project[]>(["admin", "projects", "overview"], "/projects", {
    fallback: [],
    params: { limit: 100 },
  });
  const logs = useApiQuery<AuditLog[]>(["admin", "logs", "recent"], "/admin/logs", {
    fallback: [],
    params: { limit: 8 },
  });
  const revenue = useApiQuery<{ month: string; revenue: number }[]>(
    ["admin", "analytics", "revenue"],
    "/admin/analytics/revenue",
    { fallback: [] }
  );

  const activeProjects = projects.data.filter((p) => p.status === "IN_PROGRESS").length;
  const roleBreakdown = React.useMemo(() => {
    const counts = new Map<string, number>();
    users.data.forEach((u) => counts.set(u.role, (counts.get(u.role) ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [users.data]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="A real-time snapshot of users, projects, revenue and support activity across TechAI."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.isLoading ? "…" : formatNumber(users.data.length)}
          icon={Users}
          loading={users.isLoading}
          hint={users.isUnavailable ? "API unavailable" : "Registered accounts"}
        />
        <StatCard
          label="Active projects"
          value={projects.isLoading ? "…" : formatNumber(activeProjects)}
          icon={FolderKanban}
          loading={projects.isLoading}
          hint={projects.isUnavailable ? "API unavailable" : `${projects.data.length} total`}
        />
        <StatCard
          label="Monthly revenue"
          value={revenue.isUnavailable ? "—" : formatNumber(revenue.data.at(-1)?.revenue ?? 0)}
          icon={Wallet}
          loading={revenue.isLoading}
          hint={revenue.isUnavailable ? "API unavailable" : "This month"}
        />
        <StatCard
          label="Support activity"
          value={logs.isUnavailable ? "—" : formatNumber(logs.data.length)}
          icon={LifeBuoy}
          loading={logs.isLoading}
          hint={logs.isUnavailable ? "API unavailable" : "Recent audit events"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Revenue trend"
          description="Monthly recognized revenue"
          isLoading={revenue.isLoading}
          isEmpty={revenue.data.length === 0}
          emptyLabel="Revenue analytics will appear once billing data is available."
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue.data}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
              <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Users by role"
          description="Workforce composition"
          isLoading={users.isLoading}
          isEmpty={roleBreakdown.length === 0}
          emptyLabel="No users yet."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleBreakdown}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {roleBreakdown.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Projects by status"
        description="Delivery pipeline health"
        isLoading={projects.isLoading}
        isEmpty={projects.data.length === 0}
        emptyLabel="No projects yet."
        height={240}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusCounts(projects.data)}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-border" stroke="currentColor" />
            <XAxis dataKey="status" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} width={30} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Recent audit activity</h2>
        <DataTable
          columns={[
            { key: "action", header: "Action", render: (r) => <StatusBadge status={r.action} /> },
            { key: "entity", header: "Entity" },
            { key: "description", header: "Description", render: (r) => r.description ?? "—" },
            {
              key: "user",
              header: "By",
              render: (r) => (r.user ? `${r.user.firstName} ${r.user.lastName}` : "System"),
            },
            { key: "createdAt", header: "When", render: (r) => formatDateTime(r.createdAt), hideOnMobile: true },
          ]}
          data={logs.data}
          keyField={(r) => r.id}
          isLoading={logs.isLoading}
          isError={logs.isUnavailable}
          errorMessage={logs.errorMessage}
          onRetry={() => logs.refetch()}
          emptyTitle="No audit activity yet"
          emptyDescription="Actions taken across the platform will be logged here."
        />
      </div>
    </div>
  );
}

function statusCounts(projects: Project[]) {
  const counts = new Map<string, number>();
  projects.forEach((p) => counts.set(p.status, (counts.get(p.status) ?? 0) + 1));
  return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
}
