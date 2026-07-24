"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, PartyPopper } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
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
import type { Holiday } from "@/types";

const HOLIDAY_TYPES = ["PUBLIC", "OPTIONAL", "RESTRICTED"];

const holidaySchema = z.object({
  name: z.string().min(2, "Required"),
  date: z.string().min(1, "Required"),
  type: z.string().optional(),
  description: z.string().optional().or(z.literal("")),
});
type HolidayFormValues = z.infer<typeof holidaySchema>;

export default function HrHolidaysPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const year = new Date().getFullYear();
  const holidaysQuery = useApiQuery<Holiday[]>(["hr", "holidays", year], "/hr/holidays", { fallback: [], params: { year } });

  const createHoliday = useApiMutation<HolidayFormValues>(
    async (values) => (await api.post("/hr/holidays", { ...values, description: values.description || undefined })).data,
    { successMessage: "Holiday added.", invalidateKeys: [["hr", "holidays", year]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HolidayFormValues>({ resolver: zodResolver(holidaySchema), defaultValues: { type: "PUBLIC" } });

  async function onSubmit(values: HolidayFormValues) {
    await createHoliday.mutateAsync(values);
    reset({ type: "PUBLIC" });
    setDialogOpen(false);
  }

  const sorted = [...holidaysQuery.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = sorted.filter((h) => new Date(h.date) >= new Date()).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Human Resources"
        title="Holidays"
        description={`Company holiday calendar for ${year}.`}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add holiday
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total holidays" value={holidaysQuery.data.length} icon={PartyPopper} loading={holidaysQuery.isLoading} />
        <StatCard label="Upcoming" value={upcoming} loading={holidaysQuery.isLoading} />
      </div>

      {holidaysQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : holidaysQuery.isUnavailable ? (
        <EmptyState variant="error" title="Couldn't load holidays" description={holidaysQuery.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => holidaysQuery.refetch() }} />
      ) : sorted.length === 0 ? (
        <EmptyState title="No holidays added yet" description="Add company holidays so employees know when the office is closed." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((h) => (
            <div key={h.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">{h.name}</p>
                <StatusBadge status={h.type} toneOverride="neutral" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{formatDate(h.date, "EEEE, MMM d, yyyy")}</p>
              {h.description && <p className="mt-1 text-xs text-muted-foreground">{h.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add holiday</DialogTitle>
            <DialogDescription>Add a new date to the company holiday calendar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Holiday name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOLIDAY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} {...register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add holiday
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
