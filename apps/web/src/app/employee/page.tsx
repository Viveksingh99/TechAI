"use client";

import Link from "next/link";
import { Clock, ListTodo, CalendarCheck, Video, ArrowUpRight, LogIn, LogOut } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { useAuthStore, getUserDisplayName } from "@/lib/auth-store";
import { formatDate } from "@/lib/format";
import type { Attendance, Leave, Meeting, Task } from "@/types";

export default function EmployeeOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const tasks = useApiQuery<Task[]>(["employee", "tasks", "overview"], "/employee/tasks", { fallback: [] });
  const attendance = useApiQuery<Attendance[]>(["employee", "attendance", "overview"], "/employee/attendance", {
    fallback: [],
    params: { limit: 1, order: "desc" },
  });
  const leaves = useApiQuery<Leave[]>(["employee", "leave", "overview"], "/employee/leave", { fallback: [] });
  const meetings = useApiQuery<Meeting[]>(["employee", "meetings", "overview"], "/employee/meetings", { fallback: [] });

  const checkInMutation = useApiMutation<void>(
    async () => (await api.post("/employee/attendance/check-in")).data,
    { successMessage: "Checked in. Have a great day!", invalidateKeys: [["employee", "attendance", "overview"]] }
  );
  const checkOutMutation = useApiMutation<void>(
    async () => (await api.post("/employee/attendance/check-out")).data,
    { successMessage: "Checked out. See you tomorrow!", invalidateKeys: [["employee", "attendance", "overview"]] }
  );

  const today = attendance.data[0];
  const isCheckedIn = !!today?.checkIn && !today?.checkOut;
  const openTasks = tasks.data.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED").length;
  const pendingLeaves = leaves.data.filter((l) => l.status === "PENDING").length;
  const upcomingMeetings = meetings.data.filter((m) => new Date(m.startTime) > new Date());

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="My Workspace"
        title={`Hi${user ? `, ${getUserDisplayName(user).split(" ")[0]}` : ""} 👋`}
        description="Here's what's on your plate today."
        actions={
          isCheckedIn ? (
            <Button variant="outline" onClick={() => checkOutMutation.mutate()} disabled={checkOutMutation.isPending}>
              <LogOut className="h-4 w-4" />
              Check out
            </Button>
          ) : (
            <Button onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending}>
              <LogIn className="h-4 w-4" />
              Check in
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open tasks" value={openTasks} icon={ListTodo} loading={tasks.isLoading} />
        <StatCard
          label="Today's status"
          value={today?.checkIn ? (today.checkOut ? "Checked out" : "Checked in") : "Not checked in"}
          icon={Clock}
          loading={attendance.isLoading}
        />
        <StatCard label="Pending leave requests" value={pendingLeaves} icon={CalendarCheck} loading={leaves.isLoading} />
        <StatCard label="Upcoming meetings" value={upcomingMeetings.length} icon={Video} loading={meetings.isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">My tasks</h2>
            <Link href="/employee/tasks" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View board <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <DataTable
            columns={[
              { key: "title", header: "Task" },
              { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
              { key: "dueDate", header: "Due", render: (t) => formatDate(t.dueDate) },
            ]}
            data={tasks.data.slice(0, 6)}
            keyField={(t) => t.id}
            isLoading={tasks.isLoading}
            isError={tasks.isUnavailable}
            errorMessage={tasks.errorMessage}
            onRetry={() => tasks.refetch()}
            emptyTitle="No tasks assigned"
            emptyDescription="Tasks assigned to you will show up here."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Upcoming meetings</h2>
            <Link href="/employee/meetings" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <DataTable
            columns={[
              { key: "title", header: "Meeting" },
              { key: "startTime", header: "When", render: (m) => formatDate(m.startTime, "MMM d · h:mm a") },
              { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
            ]}
            data={upcomingMeetings.slice(0, 6)}
            keyField={(m) => m.id}
            isLoading={meetings.isLoading}
            isError={meetings.isUnavailable}
            errorMessage={meetings.errorMessage}
            onRetry={() => meetings.refetch()}
            emptyTitle="No meetings scheduled"
            emptyDescription="Your calendar is clear for now."
          />
        </div>
      </div>
    </div>
  );
}
