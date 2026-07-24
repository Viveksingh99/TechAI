"use client";

import { FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/types";

export default function ClientInvoicesPage() {
  const invoicesQuery = useApiQuery<Invoice[]>(["client", "invoices"], "/client/invoices", { fallback: [] });

  const outstanding = invoicesQuery.data
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + (Number(i.total) - Number(i.amountPaid ?? 0)), 0);
  const paidThisYear = invoicesQuery.data
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + Number(i.total), 0);
  const overdue = invoicesQuery.data.filter((i) => i.status === "OVERDUE").length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Client Portal" title="Invoices" description="Review, download and track payment status for every invoice." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding balance" value={formatCurrency(outstanding)} icon={FileText} loading={invoicesQuery.isLoading} />
        <StatCard label="Paid to date" value={formatCurrency(paidThisYear)} loading={invoicesQuery.isLoading} />
        <StatCard label="Overdue" value={overdue} loading={invoicesQuery.isLoading} hint={overdue > 0 ? "Needs attention" : "All clear"} />
      </div>

      <DataTable
        columns={[
          { key: "invoiceNumber", header: "Invoice #" },
          { key: "project", header: "Project", hideOnMobile: true, render: (i) => i.project?.name ?? "—" },
          { key: "status", header: "Status", render: (i) => <StatusBadge status={i.status} /> },
          { key: "total", header: "Amount", render: (i) => formatCurrency(i.total, i.currency) },
          { key: "dueDate", header: "Due date", render: (i) => formatDate(i.dueDate) },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: () => (
              <Button size="sm" variant="outline">
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
            ),
          },
        ]}
        data={invoicesQuery.data}
        keyField={(i) => i.id}
        isLoading={invoicesQuery.isLoading}
        isError={invoicesQuery.isUnavailable}
        errorMessage={invoicesQuery.errorMessage}
        onRetry={() => invoicesQuery.refetch()}
        emptyTitle="No invoices yet"
        emptyDescription="Invoices for your projects will be listed here as they're issued."
      />
    </div>
  );
}
