"use client";

import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import type { Notification } from "@/types";

const TYPE_ICON: Record<string, typeof Info> = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  ERROR: XCircle,
};

export default function ClientNotificationsPage() {
  const notificationsQuery = useApiQuery<Notification[]>(["notifications"], "/notifications", {
    fallback: [],
    params: { limit: 50 },
  });

  const markRead = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.patch(`/notifications/${id}/read`)).data,
    { invalidateKeys: [["notifications"]] }
  );

  const markAllRead = useApiMutation<void>(
    async () => (await api.patch("/notifications/read-all")).data,
    { successMessage: "All notifications marked as read.", invalidateKeys: [["notifications"]] }
  );

  const unread = notificationsQuery.data.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client Portal"
        title="Notifications"
        description={unread > 0 ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}.` : "You're all caught up."}
        actions={
          <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={unread === 0 || markAllRead.isPending}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        }
      />

      {notificationsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : notificationsQuery.isUnavailable ? (
        <EmptyState
          variant="error"
          title="Couldn't load notifications"
          description={notificationsQuery.errorMessage ?? undefined}
          action={{ label: "Retry", onClick: () => notificationsQuery.refetch() }}
        />
      ) : notificationsQuery.data.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="Updates about your projects, invoices and tickets will appear here." />
      ) : (
        <div className="space-y-2">
          {notificationsQuery.data.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Info;
            return (
              <button
                key={n.id}
                onClick={() => !n.isRead && markRead.mutate({ id: n.id })}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors hover:bg-secondary/40",
                  n.isRead ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
