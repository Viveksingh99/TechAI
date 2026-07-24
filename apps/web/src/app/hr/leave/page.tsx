"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, X, Loader2, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Leave } from "@/types";

const rejectSchema = z.object({ rejectionReason: z.string().min(3, "Add a reason") });
type RejectFormValues = z.infer<typeof rejectSchema>;

export default function HrLeavePage() {
  const [rejectTarget, setRejectTarget] = React.useState<Leave | null>(null);
  const leavesQuery = useApiQuery<Leave[]>(["hr", "leaves"], "/hr/leaves", { fallback: [], params: { limit: 100 } });

  const approveLeave = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.patch(`/hr/leaves/${id}/approve`)).data,
    { successMessage: "Leave approved.", invalidateKeys: [["hr", "leaves"]] }
  );

  const rejectLeave = useApiMutation<{ id: string; rejectionReason: string }>(
    async ({ id, rejectionReason }) => (await api.patch(`/hr/leaves/${id}/reject`, { rejectionReason })).data,
    { successMessage: "Leave rejected.", invalidateKeys: [["hr", "leaves"]] }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RejectFormValues>({ resolver: zodResolver(rejectSchema) });

  async function onReject(values: RejectFormValues) {
    if (!rejectTarget) return;
    await rejectLeave.mutateAsync({ id: rejectTarget.id, rejectionReason: values.rejectionReason });
    reset();
    setRejectTarget(null);
  }

  const pending = leavesQuery.data.filter((l) => l.status === "PENDING").length;
  const approved = leavesQuery.data.filter((l) => l.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Human Resources" title="Leave management" description="Review, approve or reject leave requests submitted by employees." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending review" value={pending} icon={CalendarCheck} loading={leavesQuery.isLoading} />
        <StatCard label="Approved" value={approved} loading={leavesQuery.isLoading} />
        <StatCard label="Total requests" value={leavesQuery.data.length} loading={leavesQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "employee", header: "Employee", render: (l) => (l.employee?.user ? `${l.employee.user.firstName} ${l.employee.user.lastName}` : "—") },
          { key: "leaveType", header: "Type", render: (l) => l.leaveType?.name ?? "—" },
          { key: "startDate", header: "From", render: (l) => formatDate(l.startDate) },
          { key: "endDate", header: "To", render: (l) => formatDate(l.endDate) },
          { key: "totalDays", header: "Days", hideOnMobile: true },
          { key: "reason", header: "Reason", hideOnMobile: true, render: (l) => l.reason ?? "—" },
          { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (l) =>
              l.status === "PENDING" ? (
                <div className="flex items-center justify-end gap-1">
                  <Button size="icon" variant="ghost" title="Approve" onClick={() => approveLeave.mutate({ id: l.id })}>
                    <Check className="h-4 w-4 text-emerald-500" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Reject" onClick={() => setRejectTarget(l)}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : null,
          },
        ]}
        data={leavesQuery.data}
        keyField={(l) => l.id}
        isLoading={leavesQuery.isLoading}
        isError={leavesQuery.isUnavailable}
        errorMessage={leavesQuery.errorMessage}
        onRetry={() => leavesQuery.refetch()}
        emptyTitle="No leave requests yet"
        emptyDescription="Leave requests submitted by employees will show up here."
      />

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject leave request</DialogTitle>
            <DialogDescription>Provide a reason so the employee understands the decision.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onReject)} className="space-y-4">
            <Textarea rows={3} placeholder="Reason for rejection" {...register("rejectionReason")} />
            {errors.rejectionReason && <p className="text-xs text-destructive">{errors.rejectionReason.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Reject request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
