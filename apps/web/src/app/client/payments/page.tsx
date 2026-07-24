"use client";

import { Wallet, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";

interface ClientPayment {
  id: string;
  amount: number | string;
  currency: string;
  method: string;
  status: string;
  paidAt?: string | null;
  invoice?: { invoiceNumber: string };
}

export default function ClientPaymentsPage() {
  const paymentsQuery = useApiQuery<ClientPayment[]>(["client", "payments"], "/client/payments", { fallback: [] });
  const total = paymentsQuery.data
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client Portal"
        title="Payments"
        description="Your payment history across every invoice."
        actions={
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Add payment method
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total paid" value={formatCurrency(total)} icon={Wallet} loading={paymentsQuery.isLoading} />
        <StatCard label="Payments recorded" value={paymentsQuery.data.length} loading={paymentsQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "invoice", header: "Invoice", render: (p) => p.invoice?.invoiceNumber ?? "—" },
          { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount, p.currency) },
          { key: "method", header: "Method", hideOnMobile: true, render: (p) => <StatusBadge status={p.method} toneOverride="neutral" /> },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "paidAt", header: "Date", render: (p) => formatDate(p.paidAt) },
        ]}
        data={paymentsQuery.data}
        keyField={(p) => p.id}
        isLoading={paymentsQuery.isLoading}
        isError={paymentsQuery.isUnavailable}
        errorMessage={paymentsQuery.errorMessage}
        onRetry={() => paymentsQuery.refetch()}
        emptyTitle="No payments yet"
        emptyDescription="Payments you make against invoices will be recorded here."
      />
    </div>
  );
}
