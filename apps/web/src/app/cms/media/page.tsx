"use client";

import * as React from "react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Trash2, FileText, Music, Video, ImageOff } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
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
import { formatDate } from "@/lib/format";
import type { Media } from "@/types";

const MEDIA_TYPES = ["IMAGE", "VIDEO", "DOCUMENT", "AUDIO", "OTHER"];

const mediaSchema = z.object({
  fileName: z.string().min(1, "Required"),
  url: z.string().min(1, "Required"),
  type: z.string().optional(),
  altText: z.string().optional(),
});
type MediaFormValues = z.infer<typeof mediaSchema>;

export default function CmsMediaPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const mediaQuery = useApiQuery<Media[]>(["cms", "media"], "/cms/media", { fallback: [], params: { limit: 100 } });

  const createMedia = useApiMutation<MediaFormValues>(
    async (values) => (await api.post("/cms/media", values)).data,
    { successMessage: "Media added.", invalidateKeys: [["cms", "media"]] }
  );

  const deleteMedia = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.delete(`/cms/media/${id}`)).data,
    { successMessage: "Media deleted.", invalidateKeys: [["cms", "media"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MediaFormValues>({ resolver: zodResolver(mediaSchema), defaultValues: { type: "IMAGE" } });

  async function onSubmit(values: MediaFormValues) {
    await createMedia.mutateAsync(values);
    reset({ type: "IMAGE" });
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CMS"
        title="Media library"
        description="Upload and organize images, documents and other assets."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add media
          </Button>
        }
      />

      {mediaQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-secondary/40" />
          ))}
        </div>
      ) : mediaQuery.isUnavailable ? (
        <EmptyState variant="error" title="Couldn't load media" description={mediaQuery.errorMessage ?? undefined} action={{ label: "Retry", onClick: () => mediaQuery.refetch() }} />
      ) : mediaQuery.data.length === 0 ? (
        <EmptyState title="No media yet" description="Add your first image or file to the library." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {mediaQuery.data.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex aspect-square items-center justify-center bg-secondary/30">
                {item.type === "IMAGE" ? (
                  <Image
                    src={item.url}
                    alt={item.altText ?? item.fileName}
                    width={200}
                    height={200}
                    unoptimized
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : item.type === "VIDEO" ? (
                  <Video className="h-8 w-8 text-muted-foreground" />
                ) : item.type === "AUDIO" ? (
                  <Music className="h-8 w-8 text-muted-foreground" />
                ) : item.type === "OTHER" ? (
                  <ImageOff className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-foreground">{item.fileName}</p>
                <p className="text-[11px] text-muted-foreground">{formatDate(item.createdAt)}</p>
              </div>
              <button
                onClick={() => deleteMedia.mutate({ id: item.id })}
                className="absolute right-2 top-2 hidden rounded-full bg-background/90 p-1.5 text-destructive shadow-sm group-hover:block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add media</DialogTitle>
            <DialogDescription>Register a file already hosted at a URL.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fileName">File name</Label>
              <Input id="fileName" placeholder="hero-banner.png" {...register("fileName")} />
              {errors.fileName && <p className="text-xs text-destructive">{errors.fileName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="url">URL</Label>
              <Input id="url" placeholder="https://..." {...register("url")} />
              {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDIA_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="altText">Alt text</Label>
                <Input id="altText" {...register("altText")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add media
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
