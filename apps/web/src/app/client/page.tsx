"use client";

import Link from "next/link";
import { Briefcase, FileText, LifeBuoy, CalendarDays, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api";
import { useAuthStore, getUserDisplayName } from "@/lib/auth-store";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice, Meeting, Project, Ticket } from "@/types";

export default function ClientOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const projects = useApiQuery<Project[]>(["client", "projects", "overview"], "/client/projects", { fallback: [] });
  const invoices = useApiQuery<Invoice[]>(["client", "invoices", "overview"], "/client/invoices", { fallback: [] });
  const tickets = useApiQuery<Ticket[]>(["client", "tickets", "overview"], "/client/tickets", { fallback: [] });
  const meetings = useApiQuery<Meeting[]>(["client", "meetings", "upcoming"], "/client/meetings", { fallback: [] });

  const activeProjects = projects.data.filter((p) => p.status === "IN_PROGRESS").length;
  const outstanding = invoices.data
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + (Number(i.total) - Number(i.amountPaid ?? 0)), 0);
  const openTickets = tickets.data.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const upcoming = meetings.data.filter((m) => new Date(m.startTime) > new Date());

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Client Portal"
        title={`Welcome back${user ? `, ${getUserDisplayName(user).split(" ")[0]}` : ""}`}
        description="Track project progress, invoices and support in one place."
        actions={
          <Button asChild variant="outline">
            <Link href="/client/tickets">
              Raise a ticket
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active projects" value={activeProjects} icon={Briefcase} loading={projects.isLoading} hint={`${projects.data.length} total`} />
        <StatCard label="Outstanding balance" value={formatCurrency(outstanding)} icon={FileText} loading={invoices.isLoading} />
        <StatCard label="Open tickets" value={openTickets} icon={LifeBuoy} loading={tickets.isLoading} />
        <StatCard label="Upcoming meetings" value={upcoming.length} icon={CalendarDays} loading={meetings.isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Your projects</h2>
            <Link href="/client/projects" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {projects.isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          ) : projects.isUnavailable ? (
            <EmptyState variant="error" title="Couldn't load projects" description={projects.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => projects.refetch() }} />
          ) : projects.data.length === 0 ? (
            <EmptyState title="No projects yet" description="Once a project kicks off, you'll see its progress here." />
          ) : (
            <div className="space-y-3">
              {projects.data.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/client/projects/${p.id}`}
                  className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.description ?? "No description yet."}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Progress value={p.progress} className="flex-1" />
                    <span className="text-xs font-medium text-muted-foreground">{p.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent invoices</h2>
          <DataTable
            columns={[
              { key: "invoiceNumber", header: "Invoice" },
              { key: "status", header: "Status", render: (i) => <StatusBadge status={i.status} /> },
              { key: "total", header: "Amount", render: (i) => formatCurrency(i.total, i.currency) },
            ]}
            data={invoices.data.slice(0, 5)}
            keyField={(i) => i.id}
            isLoading={invoices.isLoading}
            isError={invoices.isUnavailable}
            errorMessage={invoices.errorMessage}
            onRetry={() => invoices.refetch()}
            emptyTitle="No invoices yet"
            emptyDescription="Invoices raised against your projects will appear here."
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Upcoming meetings</h2>
        <DataTable
          columns={[
            { key: "title", header: "Meeting" },
            { key: "startTime", header: "When", render: (m) => formatDate(m.startTime, "MMM d, yyyy · h:mm a") },
            { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
            { key: "organizer", header: "Organizer", render: (m) => (m.organizer ? `${m.organizer.firstName} ${m.organizer.lastName}` : "—") },
          ]}
          data={upcoming.slice(0, 5)}
          keyField={(m) => m.id}
          isLoading={meetings.isLoading}
          isError={meetings.isUnavailable}
          errorMessage={meetings.errorMessage}
          onRetry={() => meetings.refetch()}
          emptyTitle="No meetings scheduled"
          emptyDescription="Meetings booked by your project team will show up here."
        />
      </div>
    </div>
  );
}
