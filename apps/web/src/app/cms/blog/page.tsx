"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Trash2, Star } from "lucide-react";
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
import type { BlogPost, CmsCategory } from "@/types";

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const postSchema = z.object({
  title: z.string().min(1, "Required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Required"),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.string().optional(),
});
type PostFormValues = z.infer<typeof postSchema>;

export default function CmsBlogPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const postsQuery = useApiQuery<BlogPost[]>(["cms", "blog-posts"], "/cms/blog-posts", {
    fallback: [],
    params: { limit: 100 },
  });
  const categoriesQuery = useApiQuery<CmsCategory[]>(["cms", "categories"], "/cms/categories", { fallback: [] });

  const createPost = useApiMutation<PostFormValues>(
    async (values) => (await api.post("/cms/blog-posts", values)).data,
    { successMessage: "Blog post created.", invalidateKeys: [["cms", "blog-posts"]] }
  );

  const deletePost = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.delete(`/cms/blog-posts/${id}`)).data,
    { successMessage: "Blog post deleted.", invalidateKeys: [["cms", "blog-posts"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({ resolver: zodResolver(postSchema), defaultValues: { status: "DRAFT" } });

  async function onSubmit(values: PostFormValues) {
    await createPost.mutateAsync(values);
    reset({ status: "DRAFT" });
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CMS"
        title="Blog"
        description="Write, publish and manage articles for the public site."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New post
          </Button>
        }
      />

      <DataTable
        columns={[
          {
            key: "title",
            header: "Title",
            render: (p) => (
              <span className="inline-flex items-center gap-1.5">
                {p.isFeatured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                {p.title}
              </span>
            ),
          },
          { key: "category", header: "Category", hideOnMobile: true, render: (p) => p.category?.name ?? "—" },
          { key: "author", header: "Author", hideOnMobile: true, render: (p) => (p.author ? `${p.author.firstName} ${p.author.lastName}` : "—") },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
          { key: "viewCount", header: "Views", hideOnMobile: true },
          { key: "createdAt", header: "Created", hideOnMobile: true, render: (p) => formatDate(p.createdAt) },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (p) => (
              <Button size="icon" variant="ghost" onClick={() => deletePost.mutate({ id: p.id })}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            ),
          },
        ]}
        data={postsQuery.data}
        keyField={(p) => p.id}
        isLoading={postsQuery.isLoading}
        isError={postsQuery.isUnavailable}
        errorMessage={postsQuery.errorMessage}
        onRetry={() => postsQuery.refetch()}
        emptyTitle="No blog posts yet"
        emptyDescription="Write your first article to publish it to the site."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New blog post</DialogTitle>
            <DialogDescription>Draft an article for the public blog.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="10 tips for scaling your startup" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" rows={2} {...register("excerpt")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" rows={6} {...register("content")} />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesQuery.data.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coverImage">Cover image URL</Label>
              <Input id="coverImage" placeholder="https://..." {...register("coverImage")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
