"use client";

import { Clock, LogIn, LogOut, CalendarDays, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Attendance } from "@/types";

export default function EmployeeAttendancePage() {
  const attendanceQuery = useApiQuery<Attendance[]>(["employee", "attendance"], "/employee/attendance", {
    fallback: [],
    params: { limit: 60 },
  });

  const checkIn = useApiMutation<void>(
    async () => (await api.post("/employee/attendance/check-in")).data,
    { successMessage: "Checked in successfully.", invalidateKeys: [["employee", "attendance"]] }
  );
  const checkOut = useApiMutation<void>(
    async () => (await api.post("/employee/attendance/check-out")).data,
    { successMessage: "Checked out. Have a good evening!", invalidateKeys: [["employee", "attendance"]] }
  );

  const sorted = [...attendanceQuery.data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const today = sorted[0];
  const isCheckedIn = !!today?.checkIn && !today?.checkOut && isToday(today.date);

  const present = attendanceQuery.data.filter((a) => a.status === "PRESENT" || a.status === "WORK_FROM_HOME").length;
  const late = attendanceQuery.data.filter((a) => a.status === "LATE").length;
  const totalHours = attendanceQuery.data.reduce((sum, a) => sum + (a.workHours ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Workspace"
        title="Attendance"
        description="Check in and out, and review your attendance history."
        actions={
          isCheckedIn ? (
            <Button variant="outline" onClick={() => checkOut.mutate()} disabled={checkOut.isPending}>
              <LogOut className="h-4 w-4" />
              Check out
            </Button>
          ) : (
            <Button onClick={() => checkIn.mutate()} disabled={checkIn.isPending}>
              <LogIn className="h-4 w-4" />
              Check in
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today" value={today?.checkIn ? (today.checkOut ? "Completed" : "In progress") : "Not started"} icon={Clock} loading={attendanceQuery.isLoading} />
        <StatCard label="Days present" value={present} icon={CalendarDays} loading={attendanceQuery.isLoading} />
        <StatCard label="Late arrivals" value={late} loading={attendanceQuery.isLoading} />
        <StatCard label="Total hours logged" value={`${totalHours.toFixed(1)}h`} icon={TrendingUp} loading={attendanceQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "date", header: "Date", render: (a) => formatDate(a.date) },
          { key: "checkIn", header: "Check in", render: (a) => (a.checkIn ? formatDate(a.checkIn, "h:mm a") : "—") },
          { key: "checkOut", header: "Check out", render: (a) => (a.checkOut ? formatDate(a.checkOut, "h:mm a") : "—") },
          { key: "workHours", header: "Hours", hideOnMobile: true, render: (a) => (a.workHours ? `${a.workHours.toFixed(1)}h` : "—") },
          { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
        ]}
        data={sorted}
        keyField={(a) => a.id}
        isLoading={attendanceQuery.isLoading}
        isError={attendanceQuery.isUnavailable}
        errorMessage={attendanceQuery.errorMessage}
        onRetry={() => attendanceQuery.refetch()}
        emptyTitle="No attendance recorded yet"
        emptyDescription="Check in to start tracking your attendance history."
      />
    </div>
  );
}

function isToday(date: string) {
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}
