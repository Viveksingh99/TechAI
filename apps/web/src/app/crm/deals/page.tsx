"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Deal, PipelineStage } from "@/types";

const dealSchema = z.object({
  title: z.string().min(2, "Required"),
  stageId: z.string().min(1, "Select a stage"),
  value: z.coerce.number().min(0).optional(),
  currency: z.string().optional(),
  expectedCloseDate: z.string().optional().or(z.literal("")),
});

type DealFormValues = z.infer<typeof dealSchema>;

export default function CrmDealsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const dealsQuery = useApiQuery<Deal[]>(["crm", "deals"], "/crm/deals", { fallback: [], params: { limit: 100 } });
  const stagesQuery = useApiQuery<PipelineStage[]>(["crm", "pipeline-stages"], "/crm/pipeline-stages", { fallback: [] });

  const createDeal = useApiMutation<DealFormValues>(
    async (values) =>
      (
        await api.post("/crm/deals", {
          ...values,
          currency: values.currency || undefined,
          expectedCloseDate: values.expectedCloseDate || undefined,
        })
      ).data,
    { successMessage: "Deal created.", invalidateKeys: [["crm", "deals"], ["crm", "deals", "board"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(dealSchema), defaultValues: { currency: "USD" } });

  async function onSubmit(values: DealFormValues) {
    await createDeal.mutateAsync(values);
    reset({ currency: "USD" });
    setDialogOpen(false);
  }

  const openValue = dealsQuery.data.filter((d) => d.status === "OPEN").reduce((sum, d) => sum + Number(d.value), 0);
  const wonCount = dealsQuery.data.filter((d) => d.status === "WON").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales CRM"
        title="Deals"
        description="All deals across every stage of the pipeline."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New deal
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total deals" value={dealsQuery.data.length} icon={Briefcase} loading={dealsQuery.isLoading} />
        <StatCard label="Open pipeline value" value={formatCurrency(openValue)} loading={dealsQuery.isLoading} />
        <StatCard label="Won deals" value={wonCount} loading={dealsQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "title", header: "Deal" },
          { key: "company", header: "Company", hideOnMobile: true, render: (d) => d.company?.name ?? "—" },
          { key: "stage", header: "Stage", render: (d) => d.stage?.name ?? "—" },
          { key: "value", header: "Value", render: (d) => formatCurrency(d.value, d.currency) },
          { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
          { key: "expectedCloseDate", header: "Close date", hideOnMobile: true, render: (d) => formatDate(d.expectedCloseDate) },
        ]}
        data={dealsQuery.data}
        keyField={(d) => d.id}
        isLoading={dealsQuery.isLoading}
        isError={dealsQuery.isUnavailable}
        errorMessage={dealsQuery.errorMessage}
        onRetry={() => dealsQuery.refetch()}
        emptyTitle="No deals yet"
        emptyDescription="Deals created from qualified leads will appear here."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New deal</DialogTitle>
            <DialogDescription>Add a deal to the pipeline.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Controller
                control={control}
                name="stageId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stagesQuery.data.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.stageId && <p className="text-xs text-destructive">{errors.stageId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="value">Value</Label>
                <Input id="value" type="number" min={0} step="0.01" {...register("value")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expectedCloseDate">Expected close</Label>
                <Input id="expectedCloseDate" type="date" {...register("expectedCloseDate")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create deal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
