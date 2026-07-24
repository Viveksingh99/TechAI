"use client";

import { FileSignature, Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Contract } from "@/types";

export default function ClientContractsPage() {
  const contractsQuery = useApiQuery<Contract[]>(["client", "contracts"], "/client/contracts", { fallback: [] });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Client Portal" title="Contracts" description="Master service agreements and statements of work with TechAI." />

      <DataTable
        columns={[
          {
            key: "title",
            header: "Contract",
            render: (c) => (
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <FileSignature className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.contractNumber}</p>
                </div>
              </div>
            ),
          },
          { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "value", header: "Value", render: (c) => formatCurrency(c.value) },
          { key: "startDate", header: "Start", hideOnMobile: true, render: (c) => formatDate(c.startDate) },
          { key: "endDate", header: "End", hideOnMobile: true, render: (c) => formatDate(c.endDate) },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: () => (
              <Button size="sm" variant="outline">
                <Download className="h-3.5 w-3.5" />
                View
              </Button>
            ),
          },
        ]}
        data={contractsQuery.data}
        keyField={(c) => c.id}
        isLoading={contractsQuery.isLoading}
        isError={contractsQuery.isUnavailable}
        errorMessage={contractsQuery.errorMessage}
        onRetry={() => contractsQuery.refetch()}
        emptyTitle="No contracts yet"
        emptyDescription="Signed agreements with TechAI will appear here."
      />
    </div>
  );
}
