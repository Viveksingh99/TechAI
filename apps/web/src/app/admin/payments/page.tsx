"use client";

import * as React from "react";
import { CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";

interface Payment {
  id: string;
  amount: number | string;
  currency: string;
  method: string;
  status: string;
  transactionId?: string | null;
  paidAt?: string | null;
  invoice?: { invoiceNumber: string; client?: { firstName: string; lastName: string } };
}

export default function AdminPaymentsPage() {
  const paymentsQuery = useApiQuery<Payment[]>(["admin", "payments"], "/payments", {
    fallback: [],
    params: { limit: 200 },
  });

  const completed = paymentsQuery.data.filter((p) => p.status === "COMPLETED");
  const pending = paymentsQuery.data.filter((p) => p.status === "PENDING");
  const failed = paymentsQuery.data.filter((p) => p.status === "FAILED");
  const totalCollected = completed.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Payments"
        description="Every transaction processed across client invoices and subscriptions."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total collected" value={formatCurrency(totalCollected)} icon={CreditCard} loading={paymentsQuery.isLoading} />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} loading={paymentsQuery.isLoading} />
        <StatCard label="Pending" value={pending.length} icon={Clock} loading={paymentsQuery.isLoading} />
        <StatCard label="Failed" value={failed.length} icon={XCircle} loading={paymentsQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          {
            key: "invoice",
            header: "Invoice",
            render: (p) => (
              <div>
                <p className="font-medium text-foreground">{p.invoice?.invoiceNumber ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {p.invoice?.client ? `${p.invoice.client.firstName} ${p.invoice.client.lastName}` : "—"}
                </p>
              </div>
            ),
          },
          { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount, p.currency) },
          { key: "method", header: "Method", hideOnMobile: true, render: (p) => <StatusBadge status={p.method} toneOverride="neutral" /> },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "transactionId", header: "Transaction ID", hideOnMobile: true, render: (p) => p.transactionId ?? "—" },
          { key: "paidAt", header: "Date", render: (p) => formatDate(p.paidAt) },
        ]}
        data={paymentsQuery.data}
        keyField={(p) => p.id}
        isLoading={paymentsQuery.isLoading}
        isError={paymentsQuery.isUnavailable}
        errorMessage={paymentsQuery.errorMessage}
        onRetry={() => paymentsQuery.refetch()}
        emptyTitle="No payments recorded"
        emptyDescription="Payments collected against invoices will be listed here."
      />
    </div>
  );
}
