"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Loader2, UserPlus, Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";
import { DataTable } from "@/components/dashboard/data-table";
import { KanbanBoard, type KanbanColumn } from "@/components/dashboard/kanban-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { formatCurrency, formatDate, formatDateTime, initialsFromName } from "@/lib/format";
import type { Bug, Project, ProjectActivity, ProjectMember, Sprint, Task, TimeEntry } from "@/types";

const TASK_COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

const BUG_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const BUG_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"];

export default function PmProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const project = useApiQuery<Project | null>(["pm", "project", projectId], `/projects/${projectId}`, { fallback: null });

  if (project.isLoading) return <PageSkeleton />;

  if (project.isUnavailable || !project.data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/pm/projects")} className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Button>
        <EmptyState
          variant={project.isUnavailable ? "error" : "empty"}
          title={project.isUnavailable ? "Couldn't load this project" : "Project not found"}
          description={project.errorMessage ?? "It may have been removed, or you may not have access."}
          action={{ label: "Retry", onClick: () => project.refetch() }}
        />
      </div>
    );
  }

  const p = project.data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/pm/projects")} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Button>

      <PageHeader
        eyebrow="Project"
        title={p.name}
        description={p.description ?? "No description provided yet."}
        actions={<StatusBadge status={p.status} className="text-sm" />}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoTile label="Priority" value={<StatusBadge status={p.priority} />} />
        <InfoTile label="Budget" value={formatCurrency(p.budget)} />
        <InfoTile label="Start date" value={formatDate(p.startDate)} />
        <InfoTile label="Target date" value={formatDate(p.endDate)} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Overall progress</p>
          <p className="text-sm font-semibold text-primary">{p.progress}%</p>
        </div>
        <Progress value={p.progress} />
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="flex-wrap">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="bugs">Bugs</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-5">
          <TasksTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="sprints" className="mt-5">
          <SprintsTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="bugs" className="mt-5">
          <BugsTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="time" className="mt-5">
          <TimeTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="team" className="mt-5">
          <TeamTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="activity" className="mt-5">
          <ActivityTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm font-semibold text-foreground">{value}</CardContent>
    </Card>
  );
}

// --- Tasks -------------------------------------------------------------

const taskSchema = z.object({
  title: z.string().min(2, "Required"),
  description: z.string().optional().or(z.literal("")),
  priority: z.string().optional(),
  dueDate: z.string().optional().or(z.literal("")),
});
type TaskFormValues = z.infer<typeof taskSchema>;

function TasksTab({ projectId }: { projectId: string }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const tasksQuery = useApiQuery<Task[]>(["pm", "project", projectId, "tasks"], `/projects/${projectId}/tasks`, { fallback: [] });

  const createTask = useApiMutation<TaskFormValues>(
    async (values) =>
      (await api.post(`/projects/${projectId}/tasks`, { ...values, description: values.description || undefined, dueDate: values.dueDate || undefined })).data,
    { successMessage: "Task created.", invalidateKeys: [["pm", "project", projectId, "tasks"]] }
  );

  const updateStatus = useApiMutation<{ id: string; status: string }>(
    async ({ id, status }) => (await api.patch(`/projects/${projectId}/tasks/${id}/status`, { status })).data,
    { invalidateKeys: [["pm", "project", projectId, "tasks"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({ resolver: zodResolver(taskSchema), defaultValues: { priority: "MEDIUM" } });

  async function onSubmit(values: TaskFormValues) {
    await createTask.mutateAsync(values);
    reset({ priority: "MEDIUM" });
    setDialogOpen(false);
  }

  const columns: KanbanColumn<Task>[] = TASK_COLUMNS.map((c) => ({
    id: c.id,
    title: c.title,
    items: tasksQuery.data.filter((t) => t.status === c.id),
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      {tasksQuery.isLoading ? (
        <div className="flex gap-4">
          {TASK_COLUMNS.map((c) => (
            <div key={c.id} className="h-64 w-[280px] shrink-0 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : tasksQuery.isUnavailable ? (
        <EmptyState variant="error" title="Couldn't load tasks" description={tasksQuery.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => tasksQuery.refetch() }} />
      ) : (
        <KanbanBoard
          columns={columns}
          keyField={(t) => t.id}
          onMove={(taskId, _from, toStatus) => updateStatus.mutate({ id: taskId, status: toStatus })}
          renderCard={(t) => (
            <div className="space-y-2">
              <p className="text-sm font-medium leading-snug text-foreground">{t.title}</p>
              <div className="flex items-center justify-between">
                <StatusBadge status={t.priority} />
                {t.dueDate && <span className="text-xs text-muted-foreground">{formatDate(t.dueDate, "MMM d")}</span>}
              </div>
              {t.assignee && (
                <p className="text-xs text-muted-foreground">{t.assignee.firstName} {t.assignee.lastName}</p>
              )}
            </div>
          )}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>Add a task to this project&apos;s board.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
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
                        {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
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
                <Label htmlFor="dueDate">Due date</Label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sprints -------------------------------------------------------------

const sprintSchema = z.object({
  name: z.string().min(2, "Required"),
  goal: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
});
type SprintFormValues = z.infer<typeof sprintSchema>;

function SprintsTab({ projectId }: { projectId: string }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const sprintsQuery = useApiQuery<Sprint[]>(["pm", "project", projectId, "sprints"], `/projects/${projectId}/sprints`, { fallback: [] });

  const createSprint = useApiMutation<SprintFormValues>(
    async (values) => (await api.post(`/projects/${projectId}/sprints`, { ...values, goal: values.goal || undefined })).data,
    { successMessage: "Sprint created.", invalidateKeys: [["pm", "project", projectId, "sprints"]] }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SprintFormValues>({ resolver: zodResolver(sprintSchema) });

  async function onSubmit(values: SprintFormValues) {
    await createSprint.mutateAsync(values);
    reset();
    setDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New sprint
        </Button>
      </div>

      {sprintsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : sprintsQuery.isUnavailable ? (
        <EmptyState variant="error" title="Couldn't load sprints" description={sprintsQuery.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => sprintsQuery.refetch() }} />
      ) : sprintsQuery.data.length === 0 ? (
        <EmptyState title="No sprints yet" description="Plan your first sprint to organize work into iterations." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sprintsQuery.data.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">{s.name}</p>
                <StatusBadge status={s.status} />
              </div>
              {s.goal && <p className="mt-1 text-sm text-muted-foreground">{s.goal}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(s.startDate)} – {formatDate(s.endDate)}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New sprint</DialogTitle>
            <DialogDescription>Plan a new iteration for this project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Sprint name</Label>
              <Input id="name" placeholder="e.g. Sprint 4" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal">Goal</Label>
              <Textarea id="goal" rows={2} {...register("goal")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start date</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" type="date" {...register("endDate")} />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create sprint
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Bugs -------------------------------------------------------------

const bugSchema = z.object({
  title: z.string().min(2, "Required"),
  description: z.string().optional().or(z.literal("")),
  severity: z.string().optional(),
});
type BugFormValues = z.infer<typeof bugSchema>;

function BugsTab({ projectId }: { projectId: string }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const bugsQuery = useApiQuery<Bug[]>(["pm", "project", projectId, "bugs"], `/projects/${projectId}/bugs`, { fallback: [] });

  const createBug = useApiMutation<BugFormValues>(
    async (values) => (await api.post(`/projects/${projectId}/bugs`, { ...values, description: values.description || undefined })).data,
    { successMessage: "Bug reported.", invalidateKeys: [["pm", "project", projectId, "bugs"]] }
  );

  const updateBugStatus = useApiMutation<{ id: string; status: string }>(
    async ({ id, status }) => (await api.patch(`/projects/${projectId}/bugs/${id}`, { status })).data,
    { invalidateKeys: [["pm", "project", projectId, "bugs"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BugFormValues>({ resolver: zodResolver(bugSchema), defaultValues: { severity: "MEDIUM" } });

  async function onSubmit(values: BugFormValues) {
    await createBug.mutateAsync(values);
    reset({ severity: "MEDIUM" });
    setDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Report bug
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "title", header: "Bug" },
          { key: "severity", header: "Severity", render: (b) => <StatusBadge status={b.severity} /> },
          {
            key: "status",
            header: "Status",
            render: (b) => (
              <Select value={b.status} onValueChange={(status) => updateBugStatus.mutate({ id: b.id, status })}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUG_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
          },
          { key: "assignee", header: "Assignee", hideOnMobile: true, render: (b) => (b.assignee ? `${b.assignee.firstName} ${b.assignee.lastName}` : "Unassigned") },
          { key: "createdAt", header: "Reported", hideOnMobile: true, render: (b) => formatDate(b.createdAt) },
        ]}
        data={bugsQuery.data}
        keyField={(b) => b.id}
        isLoading={bugsQuery.isLoading}
        isError={bugsQuery.isUnavailable}
        errorMessage={bugsQuery.errorMessage}
        onRetry={() => bugsQuery.refetch()}
        emptyTitle="No bugs reported"
        emptyDescription="Bugs found during development or QA will be tracked here."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report a bug</DialogTitle>
            <DialogDescription>Log an issue found in this project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...register("description")} />
            </div>
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Controller
                control={control}
                name="severity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUG_SEVERITIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Report bug
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Time -------------------------------------------------------------

const timeSchema = z.object({
  description: z.string().optional().or(z.literal("")),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().optional().or(z.literal("")),
});
type TimeFormValues = z.infer<typeof timeSchema>;

function TimeTab({ projectId }: { projectId: string }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const timeQuery = useApiQuery<TimeEntry[]>(["pm", "project", projectId, "time-entries"], `/projects/${projectId}/time-entries`, {
    fallback: [],
  });

  const logTime = useApiMutation<TimeFormValues>(
    async (values) =>
      (await api.post(`/projects/${projectId}/time-entries`, { ...values, description: values.description || undefined, endTime: values.endTime || undefined })).data,
    { successMessage: "Time logged.", invalidateKeys: [["pm", "project", projectId, "time-entries"]] }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TimeFormValues>({ resolver: zodResolver(timeSchema) });

  async function onSubmit(values: TimeFormValues) {
    await logTime.mutateAsync(values);
    reset();
    setDialogOpen(false);
  }

  const totalHours = timeQuery.data.reduce((sum, t) => sum + (t.durationMinutes ?? 0), 0) / 60;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <Clock className="mr-1.5 inline h-4 w-4" />
          {totalHours.toFixed(1)}h logged in total
        </p>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Log time
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "user", header: "Team member", render: (t) => (t.user ? `${t.user.firstName} ${t.user.lastName}` : "—") },
          { key: "description", header: "Description", render: (t) => t.description ?? "—" },
          { key: "startTime", header: "Started", render: (t) => formatDateTime(t.startTime) },
          { key: "durationMinutes", header: "Duration", hideOnMobile: true, render: (t) => (t.durationMinutes ? `${(t.durationMinutes / 60).toFixed(1)}h` : "In progress") },
          { key: "isBillable", header: "Billable", hideOnMobile: true, render: (t) => (t.isBillable ? "Yes" : "No") },
        ]}
        data={timeQuery.data}
        keyField={(t) => t.id}
        isLoading={timeQuery.isLoading}
        isError={timeQuery.isUnavailable}
        errorMessage={timeQuery.errorMessage}
        onRetry={() => timeQuery.refetch()}
        emptyTitle="No time logged yet"
        emptyDescription="Time entries logged by the team will appear here."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log time</DialogTitle>
            <DialogDescription>Record time spent working on this project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startTime">Start</Label>
                <Input id="startTime" type="datetime-local" {...register("startTime")} />
                {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime">End</Label>
                <Input id="endTime" type="datetime-local" {...register("endTime")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Log time
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Team -------------------------------------------------------------

const memberSchema = z.object({
  userId: z.string().min(1, "Required"),
  role: z.string().optional(),
});
type MemberFormValues = z.infer<typeof memberSchema>;

function TeamTab({ projectId }: { projectId: string }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const membersQuery = useApiQuery<ProjectMember[]>(["pm", "project", projectId, "members"], `/projects/${projectId}/members`, {
    fallback: [],
  });

  const addMember = useApiMutation<MemberFormValues>(
    async (values) => (await api.post(`/projects/${projectId}/members`, values)).data,
    { successMessage: "Member added.", invalidateKeys: [["pm", "project", projectId, "members"]] }
  );

  const removeMember = useApiMutation<{ userId: string }>(
    async ({ userId }) => (await api.delete(`/projects/${projectId}/members/${userId}`)).data,
    { successMessage: "Member removed.", invalidateKeys: [["pm", "project", projectId, "members"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({ resolver: zodResolver(memberSchema), defaultValues: { role: "MEMBER" } });

  async function onSubmit(values: MemberFormValues) {
    await addMember.mutateAsync(values);
    reset({ role: "MEMBER" });
    setDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add member
        </Button>
      </div>

      {membersQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : membersQuery.isUnavailable ? (
        <EmptyState variant="error" title="Couldn't load team" description={membersQuery.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => membersQuery.refetch() }} />
      ) : membersQuery.data.length === 0 ? (
        <EmptyState title="No team members yet" description="Add teammates to this project so they can start collaborating." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {membersQuery.data.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initialsFromName(`${m.user?.firstName ?? "?"} ${m.user?.lastName ?? ""}`)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{m.user ? `${m.user.firstName} ${m.user.lastName}` : m.userId}</p>
                  <p className="text-xs text-muted-foreground">{m.role ?? "MEMBER"}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeMember.mutate({ userId: m.userId })}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add team member</DialogTitle>
            <DialogDescription>Enter the user ID of the teammate to add to this project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" placeholder="e.g. clx1234..." {...register("userId")} />
              {errors.userId && <p className="text-xs text-destructive">{errors.userId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {["MANAGER", "MEMBER", "VIEWER"].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Add member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Activity -------------------------------------------------------------

function ActivityTab({ projectId }: { projectId: string }) {
  const activityQuery = useApiQuery<ProjectActivity[]>(["pm", "project", projectId, "activity"], `/projects/${projectId}/activity`, {
    fallback: [],
    params: { limit: 50 },
  });

  if (activityQuery.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (activityQuery.isUnavailable) {
    return (
      <EmptyState
        variant="error"
        title="Couldn't load activity"
        description={activityQuery.errorMessage ?? undefined}
        action={{ label: "Retry", onClick: () => activityQuery.refetch() }}
      />
    );
  }

  if (activityQuery.data.length === 0) {
    return <EmptyState title="No activity yet" description="Actions taken on this project will be logged here." />;
  }

  return (
    <div className="space-y-2">
      {activityQuery.data.map((a) => (
        <div key={a.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="text-sm text-foreground">
              <span className="font-medium">{a.user ? `${a.user.firstName} ${a.user.lastName}` : "System"}</span>{" "}
              {a.description ?? a.action}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
