"use client";

import {
  Line,
  LineChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/dashboard/page-header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { useApiQuery } from "@/hooks/use-api";
import { formatNumber } from "@/lib/format";
import { TrendingUp, Users2, Target, Clock3 } from "lucide-react";

interface AnalyticsSummary {
  newUsers: number;
  activeProjects: number;
  avgDeliveryDays: number;
  conversionRate: number;
}

interface SeriesPoint {
  month: string;
  [key: string]: string | number;
}

export default function AdminAnalyticsPage() {
  const summary = useApiQuery<AnalyticsSummary | null>(["admin", "analytics", "summary"], "/admin/analytics/summary", {
    fallback: null,
  });
  const growth = useApiQuery<SeriesPoint[]>(["admin", "analytics", "growth"], "/admin/analytics/growth", {
    fallback: [],
  });
  const funnel = useApiQuery<SeriesPoint[]>(["admin", "analytics", "funnel"], "/admin/analytics/funnel", {
    fallback: [],
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Analytics"
        description="Cross-workspace performance trends: growth, delivery speed and conversion."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New users (30d)" value={summary.data ? formatNumber(summary.data.newUsers) : "—"} icon={Users2} loading={summary.isLoading} />
        <StatCard label="Active projects" value={summary.data ? formatNumber(summary.data.activeProjects) : "—"} icon={Target} loading={summary.isLoading} />
        <StatCard label="Avg. delivery time" value={summary.data ? `${summary.data.avgDeliveryDays}d` : "—"} icon={Clock3} loading={summary.isLoading} />
        <StatCard label="Lead → client conversion" value={summary.data ? `${summary.data.conversionRate}%` : "—"} icon={TrendingUp} loading={summary.isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="User growth"
          description="New signups per month across all roles"
          isLoading={growth.isLoading}
          isEmpty={growth.data.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growth.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-border" stroke="currentColor" />
              <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
              <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Sales funnel"
          description="Leads progressing through the pipeline"
          isLoading={funnel.isLoading}
          isEmpty={funnel.data.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel.data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="text-border" stroke="currentColor" />
              <XAxis type="number" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="month" type="category" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)" }} />
              <Legend />
              <Bar dataKey="leads" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
