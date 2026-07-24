"use client";

import Link from "next/link";
import { Plus, LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { Ticket } from "@/types";

export default function ClientTicketsPage() {
  const ticketsQuery = useApiQuery<Ticket[]>(["client", "tickets"], "/client/tickets", { fallback: [] });
  const open = ticketsQuery.data.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const resolved = ticketsQuery.data.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client Portal"
        title="Support tickets"
        description="Get help from your delivery team — track every request in one place."
        actions={
          <Button asChild>
            <Link href="/client/tickets/new">
              <Plus className="h-4 w-4" />
              New ticket
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Open tickets" value={open} icon={LifeBuoy} loading={ticketsQuery.isLoading} />
        <StatCard label="Resolved" value={resolved} loading={ticketsQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "ticketNumber", header: "Ticket #" },
          { key: "subject", header: "Subject" },
          { key: "priority", header: "Priority", hideOnMobile: true, render: (t) => <StatusBadge status={t.priority} /> },
          { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
          { key: "assignedTo", header: "Assigned to", hideOnMobile: true, render: (t) => (t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : "Unassigned") },
          { key: "createdAt", header: "Raised", render: (t) => formatDate(t.createdAt) },
        ]}
        data={ticketsQuery.data}
        keyField={(t) => t.id}
        isLoading={ticketsQuery.isLoading}
        isError={ticketsQuery.isUnavailable}
        errorMessage={ticketsQuery.errorMessage}
        onRetry={() => ticketsQuery.refetch()}
        emptyTitle="No tickets yet"
        emptyDescription="Need help? Raise your first support ticket."
      />
    </div>
  );
}
