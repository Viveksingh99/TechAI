"use client";

import { Banknote, Download, Wallet } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/format";

interface SalarySlip {
  id: string;
  month: number;
  year: number;
  basicSalary: number | string;
  allowances: number | string;
  deductions: number | string;
  bonus: number | string;
  tax: number | string;
  netSalary: number | string;
  status: string;
  paidOn?: string | null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function EmployeeSalaryPage() {
  const salaryQuery = useApiQuery<SalarySlip[]>(["employee", "salary"], "/employee/salary", { fallback: [] });
  const latest = salaryQuery.data[0];
  const ytdNet = salaryQuery.data.reduce((sum, s) => sum + Number(s.netSalary), 0);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My Workspace" title="Salary" description="View and download your monthly salary slips." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Latest net pay" value={latest ? formatCurrency(latest.netSalary) : "—"} icon={Banknote} loading={salaryQuery.isLoading} />
        <StatCard label="Year to date" value={formatCurrency(ytdNet)} icon={Wallet} loading={salaryQuery.isLoading} />
        <StatCard label="Slips issued" value={salaryQuery.data.length} loading={salaryQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "period", header: "Period", render: (s) => `${MONTHS[s.month - 1] ?? s.month} ${s.year}` },
          { key: "basicSalary", header: "Basic", hideOnMobile: true, render: (s) => formatCurrency(s.basicSalary) },
          { key: "allowances", header: "Allowances", hideOnMobile: true, render: (s) => formatCurrency(s.allowances) },
          { key: "deductions", header: "Deductions", hideOnMobile: true, render: (s) => formatCurrency(s.deductions) },
          { key: "netSalary", header: "Net pay", render: (s) => formatCurrency(s.netSalary) },
          { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: () => (
              <Button size="sm" variant="outline">
                <Download className="h-3.5 w-3.5" />
                Slip
              </Button>
            ),
          },
        ]}
        data={salaryQuery.data}
        keyField={(s) => s.id}
        isLoading={salaryQuery.isLoading}
        isError={salaryQuery.isUnavailable}
        errorMessage={salaryQuery.errorMessage}
        onRetry={() => salaryQuery.refetch()}
        emptyTitle="No salary slips yet"
        emptyDescription="Your monthly salary slips will appear here once payroll is processed."
      />
    </div>
  );
}
