"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, PhoneCall, CheckCircle2 } from "lucide-react";
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
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { FollowUp } from "@/types";

const followUpSchema = z.object({
  dueDate: z.string().min(1, "Required"),
  notes: z.string().optional().or(z.literal("")),
});

type FollowUpFormValues = z.infer<typeof followUpSchema>;

export default function CrmFollowUpsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const followUpsQuery = useApiQuery<FollowUp[]>(["crm", "follow-ups"], "/crm/follow-ups", {
    fallback: [],
    params: { limit: 100 },
  });

  const createFollowUp = useApiMutation<FollowUpFormValues>(
    async (values) => (await api.post("/crm/follow-ups", { ...values, notes: values.notes || undefined })).data,
    { successMessage: "Follow-up scheduled.", invalidateKeys: [["crm", "follow-ups"]] }
  );

  const completeFollowUp = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.patch(`/crm/follow-ups/${id}/complete`)).data,
    { successMessage: "Follow-up marked complete.", invalidateKeys: [["crm", "follow-ups"]] }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FollowUpFormValues>({ resolver: zodResolver(followUpSchema) });

  async function onSubmit(values: FollowUpFormValues) {
    await createFollowUp.mutateAsync(values);
    reset();
    setDialogOpen(false);
  }

  const pending = followUpsQuery.data.filter((f) => f.status === "PENDING").length;
  const overdue = followUpsQuery.data.filter(
    (f) => f.status === "PENDING" && new Date(f.dueDate) < new Date()
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales CRM"
        title="Follow-ups"
        description="Stay on top of scheduled touchpoints with leads and deals."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Schedule follow-up
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={pending} icon={PhoneCall} loading={followUpsQuery.isLoading} />
        <StatCard label="Overdue" value={overdue} loading={followUpsQuery.isLoading} hint={overdue > 0 ? "Needs attention" : "All clear"} />
        <StatCard label="Total scheduled" value={followUpsQuery.data.length} loading={followUpsQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          {
            key: "subject",
            header: "Related to",
            render: (f) => f.lead?.title ?? f.deal?.title ?? (f.contact ? `${f.contact.firstName} ${f.contact.lastName}` : "—"),
          },
          { key: "dueDate", header: "Due", render: (f) => formatDate(f.dueDate) },
          { key: "notes", header: "Notes", hideOnMobile: true, render: (f) => f.notes ?? "—" },
          {
            key: "assignedTo",
            header: "Owner",
            hideOnMobile: true,
            render: (f) => (f.assignedTo ? `${f.assignedTo.firstName} ${f.assignedTo.lastName}` : "Unassigned"),
          },
          { key: "status", header: "Status", render: (f) => <StatusBadge status={f.status} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (f) =>
              f.status === "PENDING" ? (
                <Button size="sm" variant="outline" onClick={() => completeFollowUp.mutate({ id: f.id })}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complete
                </Button>
              ) : null,
          },
        ]}
        data={followUpsQuery.data}
        keyField={(f) => f.id}
        isLoading={followUpsQuery.isLoading}
        isError={followUpsQuery.isUnavailable}
        errorMessage={followUpsQuery.errorMessage}
        onRetry={() => followUpsQuery.refetch()}
        emptyTitle="No follow-ups scheduled"
        emptyDescription="Schedule a follow-up to stay in touch with leads and deals."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule follow-up</DialogTitle>
            <DialogDescription>Set a reminder to reach out.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
