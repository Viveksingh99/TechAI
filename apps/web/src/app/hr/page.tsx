"use client";

import * as React from "react";
import {
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
import { Users, UserPlus, CalendarCheck, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate, formatNumber } from "@/lib/format";
import type { Employee, JobPosting, Leave } from "@/types";

const CHART_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e", "#64748b"];

export default function HrOverviewPage() {
  const employees = useApiQuery<Employee[]>(["hr", "employees", "overview"], "/hr/employees", {
    fallback: [],
    params: { limit: 100 },
  });
  const leaves = useApiQuery<Leave[]>(["hr", "leaves", "pending"], "/hr/leaves", {
    fallback: [],
    params: { limit: 100, status: "PENDING" },
  });
  const jobPostings = useApiQuery<JobPosting[]>(["hr", "job-postings", "overview"], "/hr/recruitment/job-postings", {
    fallback: [],
    params: { limit: 50 },
  });

  const activeEmployees = employees.data.filter((e) => e.status === "ACTIVE").length;
  const openPostings = jobPostings.data.filter((j) => j.status === "OPEN").length;

  const deptChart = React.useMemo(() => {
    const counts = new Map<string, number>();
    employees.data.forEach((e) => {
      const dept = e.department ?? "Unassigned";
      counts.set(dept, (counts.get(dept) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [employees.data]);

  const statusChart = React.useMemo(() => {
    const counts = new Map<string, number>();
    employees.data.forEach((e) => counts.set(e.status, (counts.get(e.status) ?? 0) + 1));
    return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
  }, [employees.data]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Human Resources"
        title="HR overview"
        description="Headcount, hiring pipeline and pending approvals at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active employees"
          value={employees.isLoading ? "…" : formatNumber(activeEmployees)}
          icon={Users}
          loading={employees.isLoading}
          hint={employees.isUnavailable ? "API unavailable" : `${employees.data.length} total`}
        />
        <StatCard
          label="Open job postings"
          value={jobPostings.isLoading ? "…" : formatNumber(openPostings)}
          icon={UserPlus}
          loading={jobPostings.isLoading}
          hint={jobPostings.isUnavailable ? "API unavailable" : "Actively hiring"}
        />
        <StatCard
          label="Pending leave requests"
          value={leaves.isLoading ? "…" : formatNumber(leaves.data.length)}
          icon={CalendarCheck}
          loading={leaves.isLoading}
          hint={leaves.isUnavailable ? "API unavailable" : "Needs review"}
        />
        <StatCard
          label="Departments"
          value={employees.isLoading ? "…" : formatNumber(deptChart.length)}
          icon={ClipboardCheck}
          loading={employees.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Headcount by department"
          isLoading={employees.isLoading}
          isEmpty={deptChart.length === 0}
          emptyLabel="No employees yet."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={deptChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {deptChart.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Employees by status"
          isLoading={employees.isLoading}
          isEmpty={statusChart.length === 0}
          emptyLabel="No employees yet."
          className="lg:col-span-2"
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
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Pending leave requests</h2>
        <DataTable
          columns={[
            { key: "employee", header: "Employee", render: (l) => (l.employee?.user ? `${l.employee.user.firstName} ${l.employee.user.lastName}` : "—") },
            { key: "leaveType", header: "Type", render: (l) => l.leaveType?.name ?? "—" },
            { key: "startDate", header: "From", render: (l) => formatDate(l.startDate) },
            { key: "endDate", header: "To", render: (l) => formatDate(l.endDate) },
            { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
          ]}
          data={leaves.data.slice(0, 8)}
          keyField={(l) => l.id}
          isLoading={leaves.isLoading}
          isError={leaves.isUnavailable}
          errorMessage={leaves.errorMessage}
          onRetry={() => leaves.refetch()}
          emptyTitle="No pending leave requests"
          emptyDescription="Leave requests awaiting approval will show up here."
        />
      </div>
    </div>
  );
}
