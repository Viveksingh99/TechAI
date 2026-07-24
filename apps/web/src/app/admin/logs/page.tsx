"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiQuery } from "@/hooks/use-api";
import { formatDateTime } from "@/lib/format";
import type { AuditLog } from "@/types";

const ACTIONS = ["ALL", "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "REGISTER", "PASSWORD_RESET", "OTHER"];

export default function AdminLogsPage() {
  const [search, setSearch] = React.useState("");
  const [action, setAction] = React.useState("ALL");
  const logsQuery = useApiQuery<AuditLog[]>(["admin", "logs"], "/admin/logs", {
    fallback: [],
    params: { limit: 100 },
  });

  const filtered = logsQuery.data.filter((log) => {
    if (action !== "ALL" && log.action !== action) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${log.entity} ${log.description ?? ""}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Audit logs"
        description="A tamper-evident trail of every meaningful action across the platform."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search entity or description..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            {ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a === "ALL" ? "All actions" : a.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          { key: "action", header: "Action", render: (r) => <StatusBadge status={r.action} /> },
          { key: "entity", header: "Entity" },
          { key: "entityId", header: "Entity ID", hideOnMobile: true, render: (r) => r.entityId ?? "—" },
          { key: "description", header: "Description", render: (r) => r.description ?? "—" },
          {
            key: "user",
            header: "Actor",
            render: (r) => (r.user ? `${r.user.firstName} ${r.user.lastName}` : "System"),
          },
          { key: "createdAt", header: "Timestamp", render: (r) => formatDateTime(r.createdAt) },
        ]}
        data={filtered}
        keyField={(r) => r.id}
        isLoading={logsQuery.isLoading}
        isError={logsQuery.isUnavailable}
        errorMessage={logsQuery.errorMessage}
        onRetry={() => logsQuery.refetch()}
        emptyTitle="No audit events"
        emptyDescription="Every create, update and delete across TechAI will appear here."
      />
    </div>
  );
}
