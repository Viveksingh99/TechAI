"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiQuery } from "@/hooks/use-api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Milestone, Project, ProjectDocument } from "@/types";

export default function ClientProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const project = useApiQuery<Project | null>(["client", "project", projectId], `/client/projects/${projectId}`, {
    fallback: null,
  });
  const milestones = useApiQuery<Milestone[]>(["client", "project", projectId, "milestones"], `/client/projects/${projectId}/milestones`, {
    fallback: [],
  });
  const documents = useApiQuery<ProjectDocument[]>(["client", "project", projectId, "documents"], `/client/projects/${projectId}/documents`, {
    fallback: [],
  });

  if (project.isLoading) return <PageSkeleton />;

  if (project.isUnavailable || !project.data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/client/projects")}>
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
      <Button variant="ghost" size="sm" onClick={() => router.push("/client/projects")} className="-ml-2">
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

      <Tabs defaultValue="milestones">
        <TabsList>
          <TabsTrigger value="milestones">Timeline & milestones</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="mt-5">
          {milestones.isLoading ? (
            <PageSkeleton />
          ) : milestones.isUnavailable ? (
            <EmptyState variant="error" title="Couldn't load milestones" description={milestones.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => milestones.refetch() }} />
          ) : milestones.data.length === 0 ? (
            <EmptyState title="No milestones yet" description="Your project manager hasn't added milestones for this project." />
          ) : (
            <div className="space-y-0">
              {milestones.data
                .sort((a, b) => a.order - b.order)
                .map((m, idx) => (
                  <div key={m.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {m.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      {idx < milestones.data.length - 1 && <div className="mt-1 h-full w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-6">
                      <p className="font-medium text-foreground">{m.title}</p>
                      {m.description && <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {m.isCompleted ? "Completed" : "Due"} {formatDate(m.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-5">
          {documents.isLoading ? (
            <PageSkeleton />
          ) : documents.isUnavailable ? (
            <EmptyState variant="error" title="Couldn't load documents" description={documents.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => documents.refetch() }} />
          ) : documents.data.length === 0 ? (
            <EmptyState title="No documents shared yet" description="Contracts, briefs and deliverables will be shared here." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {documents.data.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <FileText className="h-4.5 w-4.5" />
                  </span>
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
                  </div>
                  <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          )}
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
