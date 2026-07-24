"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Wallet, AlertTriangle, RefreshCcw, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency, titleCase } from "@/lib/format";

interface RevenueDashboard {
  totalRevenue: number;
  outstandingAmount: number;
  overdueInvoices: number;
  monthlyRecurringRevenue: number;
  invoicesByStatus: { status: string; count: number }[];
}

export default function FinanceOverviewPage() {
  const dashboard = useApiQuery<RevenueDashboard | null>(["finance", "dashboard"], "/finance/dashboard/revenue", {
    fallback: null,
  });

  const data = dashboard.data;
  const statusChart = (data?.invoicesByStatus ?? []).map((s) => ({ status: titleCase(s.status), count: s.count }));

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Finance" title="Revenue overview" description="A real-time view of billing, collections and recurring revenue." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={dashboard.isLoading ? "…" : formatCurrency(data?.totalRevenue ?? 0)}
          icon={Wallet}
          loading={dashboard.isLoading}
          hint={dashboard.isUnavailable ? "API unavailable" : "Collected to date"}
        />
        <StatCard
          label="Outstanding"
          value={dashboard.isLoading ? "…" : formatCurrency(data?.outstandingAmount ?? 0)}
          icon={AlertTriangle}
          loading={dashboard.isLoading}
          hint={dashboard.isUnavailable ? "API unavailable" : "Awaiting payment"}
        />
        <StatCard
          label="Overdue invoices"
          value={dashboard.isLoading ? "…" : data?.overdueInvoices ?? 0}
          icon={TrendingUp}
          loading={dashboard.isLoading}
        />
        <StatCard
          label="Monthly recurring revenue"
          value={dashboard.isLoading ? "…" : formatCurrency(data?.monthlyRecurringRevenue ?? 0)}
          icon={RefreshCcw}
          loading={dashboard.isLoading}
        />
      </div>

      <ChartCard
        title="Invoices by status"
        description="How your invoices are distributed across the billing lifecycle"
        isLoading={dashboard.isLoading}
        isEmpty={statusChart.length === 0}
        emptyLabel="No invoices yet."
        height={280}
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
  );
}
