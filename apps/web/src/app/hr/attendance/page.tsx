"use client";

import { Clock, CalendarDays, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { Attendance } from "@/types";

interface AttendanceRecord extends Attendance {
  employee?: { user?: { firstName: string; lastName: string } };
}

export default function HrAttendancePage() {
  const attendanceQuery = useApiQuery<AttendanceRecord[]>(["hr", "attendance"], "/hr/attendance", {
    fallback: [],
    params: { limit: 100 },
  });

  const present = attendanceQuery.data.filter((a) => a.status === "PRESENT" || a.status === "WORK_FROM_HOME").length;
  const absent = attendanceQuery.data.filter((a) => a.status === "ABSENT").length;
  const late = attendanceQuery.data.filter((a) => a.status === "LATE").length;

  const sorted = [...attendanceQuery.data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Human Resources" title="Attendance" description="Daily attendance records across the organization." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Present" value={present} icon={Clock} loading={attendanceQuery.isLoading} />
        <StatCard label="Absent" value={absent} icon={CalendarDays} loading={attendanceQuery.isLoading} />
        <StatCard label="Late arrivals" value={late} icon={TrendingUp} loading={attendanceQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "employee", header: "Employee", render: (a) => (a.employee?.user ? `${a.employee.user.firstName} ${a.employee.user.lastName}` : "—") },
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
        emptyTitle="No attendance records yet"
        emptyDescription="Attendance check-ins from employees will appear here."
      />
    </div>
  );
}
