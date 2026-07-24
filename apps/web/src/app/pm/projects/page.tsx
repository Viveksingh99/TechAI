"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Progress } from "@/components/ui/progress";
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
import type { Project } from "@/types";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const projectSchema = z.object({
  name: z.string().min(2, "Required"),
  description: z.string().optional().or(z.literal("")),
  priority: z.string().optional(),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().min(0).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function PmProjectsPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const projectsQuery = useApiQuery<Project[]>(["pm", "projects"], "/projects", { fallback: [], params: { limit: 100 } });

  const createProject = useApiMutation<ProjectFormValues>(
    async (values) =>
      (
        await api.post("/projects", {
          ...values,
          description: values.description || undefined,
          startDate: values.startDate || undefined,
          endDate: values.endDate || undefined,
        })
      ).data,
    { successMessage: "Project created.", invalidateKeys: [["pm", "projects"], ["pm", "projects", "overview"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(projectSchema), defaultValues: { priority: "MEDIUM" } });

  async function onSubmit(values: ProjectFormValues) {
    await createProject.mutateAsync(values);
    reset({ priority: "MEDIUM" });
    setDialogOpen(false);
  }

  const active = projectsQuery.data.filter((p) => p.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project Management"
        title="Projects"
        description="Every project across the delivery organization."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total projects" value={projectsQuery.data.length} icon={FolderKanban} loading={projectsQuery.isLoading} />
        <StatCard label="In progress" value={active} loading={projectsQuery.isLoading} />
        <StatCard
          label="Completed"
          value={projectsQuery.data.filter((p) => p.status === "COMPLETED").length}
          loading={projectsQuery.isLoading}
        />
      </div>

      <DataTable
        columns={[
          { key: "name", header: "Project" },
          { key: "client", header: "Client", hideOnMobile: true, render: (p) => (p.client ? `${p.client.firstName} ${p.client.lastName}` : "—") },
          { key: "priority", header: "Priority", hideOnMobile: true, render: (p) => <StatusBadge status={p.priority} /> },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          {
            key: "progress",
            header: "Progress",
            render: (p) => (
              <div className="flex items-center gap-2">
                <Progress value={p.progress} className="w-24" />
                <span className="text-xs text-muted-foreground">{p.progress}%</span>
              </div>
            ),
          },
          { key: "endDate", header: "Due", hideOnMobile: true, render: (p) => formatDate(p.endDate) },
        ]}
        data={projectsQuery.data}
        keyField={(p) => p.id}
        isLoading={projectsQuery.isLoading}
        isError={projectsQuery.isUnavailable}
        errorMessage={projectsQuery.errorMessage}
        onRetry={() => projectsQuery.refetch()}
        onRowClick={(p) => router.push(`/pm/projects/${p.id}`)}
        emptyTitle="No projects yet"
        emptyDescription="Create your first project to start tracking delivery."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>Set up a new project for delivery tracking.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Project name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget">Budget</Label>
                <Input id="budget" type="number" min={0} step="0.01" {...register("budget")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start date</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" type="date" {...register("endDate")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
