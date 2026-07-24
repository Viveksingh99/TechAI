"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Target } from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/format";
import type { Lead } from "@/types";

const LEAD_SOURCES = ["WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "EMAIL_CAMPAIGN", "COLD_CALL", "EVENT", "ADVERTISEMENT", "OTHER"];

const leadSchema = z.object({
  title: z.string().min(2, "Required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  source: z.string().optional(),
  estimatedValue: z.coerce.number().min(0).optional(),
  notes: z.string().optional().or(z.literal("")),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function CrmLeadsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const leadsQuery = useApiQuery<Lead[]>(["crm", "leads"], "/crm/leads", { fallback: [], params: { limit: 100 } });

  const createLead = useApiMutation<LeadFormValues>(
    async (values) =>
      (
        await api.post("/crm/leads", {
          ...values,
          email: values.email || undefined,
          phone: values.phone || undefined,
          notes: values.notes || undefined,
        })
      ).data,
    { successMessage: "Lead created.", invalidateKeys: [["crm", "leads"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(leadSchema), defaultValues: { source: "WEBSITE" } });

  async function onSubmit(values: LeadFormValues) {
    await createLead.mutateAsync(values);
    reset({ source: "WEBSITE" });
    setDialogOpen(false);
  }

  const qualified = leadsQuery.data.filter((l) => l.status === "QUALIFIED").length;
  const converted = leadsQuery.data.filter((l) => l.status === "CONVERTED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales CRM"
        title="Leads"
        description="Capture, qualify and convert inbound and outbound leads."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New lead
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total leads" value={leadsQuery.data.length} icon={Target} loading={leadsQuery.isLoading} />
        <StatCard label="Qualified" value={qualified} loading={leadsQuery.isLoading} />
        <StatCard label="Converted" value={converted} loading={leadsQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "title", header: "Lead" },
          {
            key: "contact",
            header: "Contact",
            hideOnMobile: true,
            render: (l) => l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : (l.email ?? "—"),
          },
          { key: "source", header: "Source", hideOnMobile: true, render: (l) => <StatusBadge status={l.source} toneOverride="neutral" /> },
          { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
          { key: "estimatedValue", header: "Est. value", render: (l) => (l.estimatedValue ? formatCurrency(l.estimatedValue) : "—") },
          {
            key: "assignedTo",
            header: "Owner",
            hideOnMobile: true,
            render: (l) => (l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : "Unassigned"),
          },
          { key: "createdAt", header: "Created", hideOnMobile: true, render: (l) => formatDate(l.createdAt) },
        ]}
        data={leadsQuery.data}
        keyField={(l) => l.id}
        isLoading={leadsQuery.isLoading}
        isError={leadsQuery.isUnavailable}
        errorMessage={leadsQuery.errorMessage}
        onRetry={() => leadsQuery.refetch()}
        emptyTitle="No leads yet"
        emptyDescription="Create your first lead to start tracking the sales pipeline."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New lead</DialogTitle>
            <DialogDescription>Capture a new sales opportunity.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Website redesign for Acme Corp" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Controller
                  control={control}
                  name="source"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_SOURCES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estimatedValue">Estimated value</Label>
                <Input id="estimatedValue" type="number" min={0} step="0.01" {...register("estimatedValue")} />
              </div>
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
                Create lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
