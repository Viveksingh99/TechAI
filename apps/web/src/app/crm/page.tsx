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
import { Target, TrendingUp, Trophy, Percent } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency, formatNumber, titleCase } from "@/lib/format";

const CHART_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e", "#64748b"];

interface SalesAnalytics {
  leads: { total: number; byStatus: { status: string; count: number }[] };
  deals: {
    total: number;
    open: number;
    won: number;
    lost: number;
    winRate: number;
    wonValue: number;
    openPipelineValue: number;
  };
  companies: number;
  contacts: number;
}

export default function CrmOverviewPage() {
  const analytics = useApiQuery<SalesAnalytics | null>(["crm", "analytics"], "/crm/analytics/summary", {
    fallback: null,
  });

  const data = analytics.data;
  const leadsChart = (data?.leads?.byStatus ?? []).map((s) => ({ name: titleCase(s.status), value: s.count }));
  const dealsChart = data?.deals
    ? [
        { name: "Open", count: data.deals.open ?? 0 },
        { name: "Won", count: data.deals.won ?? 0 },
        { name: "Lost", count: data.deals.lost ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sales CRM"
        title="Sales overview"
        description="Track leads, pipeline value and deal performance across your sales team."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total leads"
          value={analytics.isLoading ? "…" : formatNumber(data?.leads?.total ?? 0)}
          icon={Target}
          loading={analytics.isLoading}
          hint={analytics.isUnavailable ? "API unavailable" : "All-time"}
        />
        <StatCard
          label="Open pipeline value"
          value={analytics.isLoading ? "…" : formatCurrency(data?.deals?.openPipelineValue ?? 0)}
          icon={TrendingUp}
          loading={analytics.isLoading}
          hint={analytics.isUnavailable ? "API unavailable" : `${data?.deals?.open ?? 0} open deals`}
        />
        <StatCard
          label="Won value"
          value={analytics.isLoading ? "…" : formatCurrency(data?.deals?.wonValue ?? 0)}
          icon={Trophy}
          loading={analytics.isLoading}
          hint={analytics.isUnavailable ? "API unavailable" : `${data?.deals?.won ?? 0} deals won`}
        />
        <StatCard
          label="Win rate"
          value={analytics.isLoading ? "…" : `${data?.deals?.winRate ?? 0}%`}
          icon={Percent}
          loading={analytics.isLoading}
          hint={analytics.isUnavailable ? "API unavailable" : "Won vs. closed"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Leads by status"
          description="Where leads currently stand in qualification"
          isLoading={analytics.isLoading}
          isEmpty={leadsChart.length === 0}
          emptyLabel="No leads yet."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={leadsChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {leadsChart.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Deal outcomes"
          description="Open vs. won vs. lost deals"
          isLoading={analytics.isLoading}
          isEmpty={dealsChart.every((d) => d.count === 0)}
          emptyLabel="No deals yet."
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dealsChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-border" stroke="currentColor" />
              <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Companies" value={analytics.isLoading ? "…" : formatNumber(data?.companies ?? 0)} loading={analytics.isLoading} />
        <StatCard label="Contacts" value={analytics.isLoading ? "…" : formatNumber(data?.contacts ?? 0)} loading={analytics.isLoading} />
      </div>
    </div>
  );
}
