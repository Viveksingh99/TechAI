"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, UserPlus, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { JobApplication, JobPosting } from "@/types";

const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"];
const APPLICATION_STATUSES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFERED", "HIRED", "REJECTED", "WITHDRAWN"];

const postingSchema = z.object({
  title: z.string().min(2, "Required"),
  department: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  employmentType: z.string().optional(),
  openings: z.coerce.number().min(1).default(1),
  description: z.string().optional().or(z.literal("")),
});
type PostingFormValues = z.infer<typeof postingSchema>;

export default function HrRecruitmentPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const postingsQuery = useApiQuery<JobPosting[]>(["hr", "job-postings"], "/hr/recruitment/job-postings", {
    fallback: [],
    params: { limit: 100 },
  });
  const applicationsQuery = useApiQuery<JobApplication[]>(["hr", "applications"], "/hr/recruitment/applications", {
    fallback: [],
    params: { limit: 100 },
  });

  const createPosting = useApiMutation<PostingFormValues>(
    async (values) =>
      (
        await api.post("/hr/recruitment/job-postings", {
          ...values,
          department: values.department || undefined,
          location: values.location || undefined,
          description: values.description || undefined,
        })
      ).data,
    { successMessage: "Job posting created.", invalidateKeys: [["hr", "job-postings"]] }
  );

  const updateApplicationStatus = useApiMutation<{ id: string; status: string }>(
    async ({ id, status }) => (await api.patch(`/hr/recruitment/applications/${id}/status`, { status })).data,
    { invalidateKeys: [["hr", "applications"]] }
  );

  const closePosting = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.patch(`/hr/recruitment/job-postings/${id}/close`)).data,
    { successMessage: "Job posting closed.", invalidateKeys: [["hr", "job-postings"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(postingSchema), defaultValues: { employmentType: "FULL_TIME", openings: 1 } });

  async function onSubmit(values: PostingFormValues) {
    await createPosting.mutateAsync(values);
    reset({ employmentType: "FULL_TIME", openings: 1 });
    setDialogOpen(false);
  }

  const openPostings = postingsQuery.data.filter((j) => j.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Human Resources"
        title="Recruitment"
        description="Manage job postings and track candidates through the hiring pipeline."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New job posting
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Open postings" value={openPostings} icon={Briefcase} loading={postingsQuery.isLoading} />
        <StatCard label="Total postings" value={postingsQuery.data.length} loading={postingsQuery.isLoading} />
        <StatCard label="Applications" value={applicationsQuery.data.length} icon={UserPlus} loading={applicationsQuery.isLoading} />
      </div>

      <Tabs defaultValue="postings">
        <TabsList>
          <TabsTrigger value="postings">Job postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="postings" className="mt-5">
          <DataTable
            columns={[
              { key: "title", header: "Role" },
              { key: "department", header: "Department", hideOnMobile: true, render: (j) => j.department ?? "—" },
              { key: "location", header: "Location", hideOnMobile: true, render: (j) => j.location ?? "Remote" },
              { key: "employmentType", header: "Type", hideOnMobile: true, render: (j) => <StatusBadge status={j.employmentType} toneOverride="neutral" /> },
              { key: "openings", header: "Openings" },
              { key: "status", header: "Status", render: (j) => <StatusBadge status={j.status} /> },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (j) =>
                  j.status !== "CLOSED" ? (
                    <Button size="sm" variant="outline" onClick={() => closePosting.mutate({ id: j.id })}>
                      Close
                    </Button>
                  ) : null,
              },
            ]}
            data={postingsQuery.data}
            keyField={(j) => j.id}
            isLoading={postingsQuery.isLoading}
            isError={postingsQuery.isUnavailable}
            errorMessage={postingsQuery.errorMessage}
            onRetry={() => postingsQuery.refetch()}
            emptyTitle="No job postings yet"
            emptyDescription="Create a job posting to start attracting candidates."
          />
        </TabsContent>

        <TabsContent value="applications" className="mt-5">
          <DataTable
            columns={[
              { key: "fullName", header: "Candidate" },
              { key: "jobPosting", header: "Role", render: (a) => a.jobPosting?.title ?? "—" },
              { key: "email", header: "Email", hideOnMobile: true },
              {
                key: "status",
                header: "Status",
                render: (a) => (
                  <Select value={a.status} onValueChange={(status) => updateApplicationStatus.mutate({ id: a.id, status })}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ),
              },
              { key: "createdAt", header: "Applied", hideOnMobile: true, render: (a) => formatDate(a.createdAt) },
            ]}
            data={applicationsQuery.data}
            keyField={(a) => a.id}
            isLoading={applicationsQuery.isLoading}
            isError={applicationsQuery.isUnavailable}
            errorMessage={applicationsQuery.errorMessage}
            onRetry={() => applicationsQuery.refetch()}
            emptyTitle="No applications yet"
            emptyDescription="Applications submitted through the careers page will appear here."
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New job posting</DialogTitle>
            <DialogDescription>Publish a new open role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Role title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...register("department")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Remote" {...register("location")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Employment type</Label>
                <Controller
                  control={control}
                  name="employmentType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="openings">Openings</Label>
                <Input id="openings" type="number" min={1} {...register("openings")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Publish posting
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
