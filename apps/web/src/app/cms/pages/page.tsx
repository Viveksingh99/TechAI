"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
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
import type { CmsPage } from "@/types";

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const pageSchema = z.object({
  title: z.string().min(1, "Required"),
  slug: z.string().optional(),
  content: z.string().min(1, "Required"),
  status: z.string().optional(),
});
type PageFormValues = z.infer<typeof pageSchema>;

export default function CmsPagesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const pagesQuery = useApiQuery<CmsPage[]>(["cms", "pages", "list"], "/cms/pages", { fallback: [] });

  const createPage = useApiMutation<PageFormValues>(
    async (values) => (await api.post("/cms/pages", values)).data,
    { successMessage: "Page created.", invalidateKeys: [["cms", "pages", "list"], ["cms", "pages"]] }
  );

  const deletePage = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.delete(`/cms/pages/${id}`)).data,
    { successMessage: "Page deleted.", invalidateKeys: [["cms", "pages", "list"], ["cms", "pages"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PageFormValues>({ resolver: zodResolver(pageSchema), defaultValues: { status: "DRAFT" } });

  async function onSubmit(values: PageFormValues) {
    await createPage.mutateAsync(values);
    reset({ status: "DRAFT" });
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CMS"
        title="Pages"
        description="Manage static site pages like About, Contact and Privacy Policy."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New page
          </Button>
        }
      />

      <DataTable
        columns={[
          { key: "title", header: "Title" },
          { key: "slug", header: "Slug", hideOnMobile: true, render: (p) => <span className="font-mono text-xs text-muted-foreground">/{p.slug}</span> },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "createdAt", header: "Created", hideOnMobile: true, render: (p) => formatDate(p.createdAt) },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (p) => (
              <Button size="icon" variant="ghost" onClick={() => deletePage.mutate({ id: p.id })}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            ),
          },
        ]}
        data={pagesQuery.data}
        keyField={(p) => p.id}
        isLoading={pagesQuery.isLoading}
        isError={pagesQuery.isUnavailable}
        errorMessage={pagesQuery.errorMessage}
        onRetry={() => pagesQuery.refetch()}
        emptyTitle="No pages yet"
        emptyDescription="Create a static page for your site."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New page</DialogTitle>
            <DialogDescription>Create a static content page.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="About us" {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input id="slug" placeholder="about-us" {...register("slug")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" rows={6} {...register("content")} />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
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
                Create page
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
