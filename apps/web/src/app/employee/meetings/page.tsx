"use client";

import { Video, ExternalLink, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { Meeting } from "@/types";

export default function EmployeeMeetingsPage() {
  const meetingsQuery = useApiQuery<Meeting[]>(["employee", "meetings"], "/employee/meetings", { fallback: [] });
  const upcoming = meetingsQuery.data.filter((m) => new Date(m.startTime) >= new Date());
  const past = meetingsQuery.data.filter((m) => new Date(m.startTime) < new Date());

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="My Workspace"
        title="Meetings"
        description="Standups, syncs and reviews you're attending or organizing."
        actions={
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Schedule meeting
          </Button>
        }
      />

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Upcoming</h2>
        <DataTable
          columns={[
            {
              key: "title",
              header: "Meeting",
              render: (m) => (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Video className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-foreground">{m.title}</span>
                </div>
              ),
            },
            { key: "startTime", header: "When", render: (m) => formatDate(m.startTime, "MMM d, yyyy · h:mm a") },
            { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (m) =>
                m.meetingLink ? (
                  <a href={m.meetingLink} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">
                      Join <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                ) : (
                  "—"
                ),
            },
          ]}
          data={upcoming}
          keyField={(m) => m.id}
          isLoading={meetingsQuery.isLoading}
          isError={meetingsQuery.isUnavailable}
          errorMessage={meetingsQuery.errorMessage}
          onRetry={() => meetingsQuery.refetch()}
          emptyTitle="No upcoming meetings"
          emptyDescription="Your calendar is clear."
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Past meetings</h2>
        <DataTable
          columns={[
            { key: "title", header: "Meeting" },
            { key: "startTime", header: "When", render: (m) => formatDate(m.startTime) },
            { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
          ]}
          data={past}
          keyField={(m) => m.id}
          isLoading={meetingsQuery.isLoading}
          emptyTitle="No meeting history"
          emptyDescription="Past meetings will build up here over time."
        />
      </div>
    </div>
  );
}
