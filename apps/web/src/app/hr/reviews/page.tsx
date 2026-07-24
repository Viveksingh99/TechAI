"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Star, ClipboardCheck } from "lucide-react";
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
import { useAuthStore } from "@/lib/auth-store";
import { formatDate } from "@/lib/format";
import type { Employee, PerformanceReview } from "@/types";

const reviewSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  reviewPeriodStart: z.string().min(1, "Required"),
  reviewPeriodEnd: z.string().min(1, "Required"),
  rating: z.coerce.number().min(0).max(5),
  strengths: z.string().optional().or(z.literal("")),
  improvements: z.string().optional().or(z.literal("")),
  goals: z.string().optional().or(z.literal("")),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function HrReviewsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const reviewsQuery = useApiQuery<PerformanceReview[]>(["hr", "performance-reviews"], "/hr/performance-reviews", { fallback: [] });
  const employeesQuery = useApiQuery<Employee[]>(["hr", "employees", "for-select"], "/hr/employees", {
    fallback: [],
    params: { limit: 100 },
  });

  const createReview = useApiMutation<ReviewFormValues>(
    async (values) =>
      (
        await api.post("/hr/performance-reviews", {
          ...values,
          reviewerId: currentUser?.id,
          strengths: values.strengths || undefined,
          improvements: values.improvements || undefined,
          goals: values.goals || undefined,
        })
      ).data,
    { successMessage: "Performance review created.", invalidateKeys: [["hr", "performance-reviews"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 3 } });

  async function onSubmit(values: ReviewFormValues) {
    await createReview.mutateAsync(values);
    reset({ rating: 3 });
    setDialogOpen(false);
  }

  const avgRating = reviewsQuery.data.length
    ? reviewsQuery.data.reduce((sum, r) => sum + r.rating, 0) / reviewsQuery.data.length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Human Resources"
        title="Performance reviews"
        description="Track review cycles and feedback across the organization."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New review
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total reviews" value={reviewsQuery.data.length} icon={ClipboardCheck} loading={reviewsQuery.isLoading} />
        <StatCard label="Average rating" value={avgRating ? `${avgRating.toFixed(1)} / 5` : "—"} icon={Star} loading={reviewsQuery.isLoading} />
        <StatCard
          label="Completed"
          value={reviewsQuery.data.filter((r) => r.status === "COMPLETED" || r.status === "ACKNOWLEDGED").length}
          loading={reviewsQuery.isLoading}
        />
      </div>

      {reviewsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : reviewsQuery.isUnavailable ? (
        <EmptyState variant="error" title="Couldn't load reviews" description={reviewsQuery.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => reviewsQuery.refetch() }} />
      ) : reviewsQuery.data.length === 0 ? (
        <EmptyState title="No performance reviews yet" description="Start a review cycle to give your team structured feedback." />
      ) : (
        <div className="space-y-3">
          {reviewsQuery.data.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{r.reviewer?.user ? `Reviewed by ${r.reviewer.user.firstName} ${r.reviewer.user.lastName}` : "Performance review"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(r.reviewPeriodStart)} – {formatDate(r.reviewPeriodEnd)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(r.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
              {r.strengths && (
                <p className="mt-3 text-sm text-foreground">
                  <span className="font-medium">Strengths: </span>
                  {r.strengths}
                </p>
              )}
              {r.improvements && (
                <p className="mt-1 text-sm text-foreground">
                  <span className="font-medium">Areas to improve: </span>
                  {r.improvements}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New performance review</DialogTitle>
            <DialogDescription>Record structured feedback for an employee.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Controller
                control={control}
                name="employeeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeesQuery.data.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.user ? `${e.user.firstName} ${e.user.lastName}` : e.employeeCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reviewPeriodStart">Period start</Label>
                <Input id="reviewPeriodStart" type="date" {...register("reviewPeriodStart")} />
                {errors.reviewPeriodStart && <p className="text-xs text-destructive">{errors.reviewPeriodStart.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reviewPeriodEnd">Period end</Label>
                <Input id="reviewPeriodEnd" type="date" {...register("reviewPeriodEnd")} />
                {errors.reviewPeriodEnd && <p className="text-xs text-destructive">{errors.reviewPeriodEnd.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input id="rating" type="number" min={0} max={5} step="0.5" {...register("rating")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="strengths">Strengths</Label>
              <Textarea id="strengths" rows={2} {...register("strengths")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="improvements">Areas to improve</Label>
              <Textarea id="improvements" rows={2} {...register("improvements")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goals">Goals</Label>
              <Textarea id="goals" rows={2} {...register("goals")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
