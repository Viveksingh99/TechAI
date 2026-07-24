"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Leave } from "@/types";

const LEAVE_TYPES = ["Paid Leave", "Sick Leave", "Casual Leave", "Unpaid Leave"];

const leaveSchema = z.object({
  leaveType: z.string().min(1, "Select a leave type"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
  reason: z.string().min(5, "Add a short reason"),
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

export default function EmployeeLeavePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const leavesQuery = useApiQuery<Leave[]>(["employee", "leave"], "/employee/leave", { fallback: [] });

  const requestLeave = useApiMutation<LeaveFormValues>(
    async (values) => (await api.post("/employee/leave", values)).data,
    { successMessage: "Leave request submitted.", invalidateKeys: [["employee", "leave"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveFormValues>({ resolver: zodResolver(leaveSchema), defaultValues: { leaveType: LEAVE_TYPES[0] } });

  async function onSubmit(values: LeaveFormValues) {
    await requestLeave.mutateAsync(values);
    reset();
    setDialogOpen(false);
  }

  const pending = leavesQuery.data.filter((l) => l.status === "PENDING").length;
  const approved = leavesQuery.data.filter((l) => l.status === "APPROVED").length;
  const daysTaken = leavesQuery.data
    .filter((l) => l.status === "APPROVED")
    .reduce((sum, l) => sum + l.totalDays, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Workspace"
        title="Leave"
        description="Request time off and track the status of your leave applications."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Request leave
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending requests" value={pending} icon={CalendarCheck} loading={leavesQuery.isLoading} />
        <StatCard label="Approved requests" value={approved} loading={leavesQuery.isLoading} />
        <StatCard label="Days taken (approved)" value={daysTaken} loading={leavesQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "leaveType", header: "Type", render: (l) => l.leaveType?.name ?? "—" },
          { key: "startDate", header: "From", render: (l) => formatDate(l.startDate) },
          { key: "endDate", header: "To", render: (l) => formatDate(l.endDate) },
          { key: "totalDays", header: "Days", hideOnMobile: true },
          { key: "reason", header: "Reason", hideOnMobile: true, render: (l) => l.reason ?? "—" },
          { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
        ]}
        data={leavesQuery.data}
        keyField={(l) => l.id}
        isLoading={leavesQuery.isLoading}
        isError={leavesQuery.isUnavailable}
        errorMessage={leavesQuery.errorMessage}
        onRetry={() => leavesQuery.refetch()}
        emptyTitle="No leave requests yet"
        emptyDescription="Submit your first leave request to see it here."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request leave</DialogTitle>
            <DialogDescription>Your manager will be notified for approval.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Leave type</Label>
              <Controller
                control={control}
                name="leaveType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">From</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">To</Label>
                <Input id="endDate" type="date" {...register("endDate")} />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" rows={3} {...register("reason")} />
              {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Submit request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
