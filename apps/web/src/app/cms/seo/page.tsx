"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import type { BlogPost, CmsPage, SeoSettings } from "@/types";

const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
});
type SeoFormValues = z.infer<typeof seoSchema>;

type EntityOption = { id: string; label: string; kind: "blog-posts" | "pages"; seo?: SeoSettings | null };

export default function CmsSeoPage() {
  const postsQuery = useApiQuery<BlogPost[]>(["cms", "blog-posts", "seo"], "/cms/blog-posts", {
    fallback: [],
    params: { limit: 100 },
  });
  const pagesQuery = useApiQuery<CmsPage[]>(["cms", "pages"], "/cms/pages", { fallback: [] });

  const options: EntityOption[] = [
    ...postsQuery.data.map((p) => ({ id: p.id, label: `Blog: ${p.title}`, kind: "blog-posts" as const, seo: p.seo })),
    ...pagesQuery.data.map((p) => ({ id: p.id, label: `Page: ${p.title}`, kind: "pages" as const, seo: p.seo })),
  ];

  const [selectedKey, setSelectedKey] = React.useState<string>("");
  const selected = options.find((o) => `${o.kind}:${o.id}` === selectedKey);

  const {
    register,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SeoFormValues>({ resolver: zodResolver(seoSchema) });

  React.useEffect(() => {
    reset({
      metaTitle: selected?.seo?.metaTitle ?? "",
      metaDescription: selected?.seo?.metaDescription ?? "",
      metaKeywords: selected?.seo?.metaKeywords ?? "",
      ogImage: selected?.seo?.ogImage ?? "",
      canonicalUrl: selected?.seo?.canonicalUrl ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const saveSeo = useApiMutation<SeoFormValues>(
    async (values) => {
      if (!selected) throw new Error("Select a page or post first.");
      return (await api.post(`/cms/${selected.kind}/${selected.id}/seo`, values)).data;
    },
    {
      successMessage: "SEO settings saved.",
      invalidateKeys: [["cms", "blog-posts", "seo"], ["cms", "pages"]],
    }
  );

  const isLoading = postsQuery.isLoading || pagesQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="CMS" title="SEO" description="Manage meta tags, Open Graph images and canonical URLs." />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <Label>Select content</Label>
            <Select value={selectedKey} onValueChange={setSelectedKey}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading…" : "Choose a blog post or page"} />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={`${o.kind}:${o.id}`} value={`${o.kind}:${o.id}`}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selected ? (
            <EmptyState icon={Search} title="Nothing selected" description="Choose a blog post or page above to edit its SEO settings." />
          ) : (
            <form onSubmit={handleSubmit((values) => saveSeo.mutate(values))} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="metaTitle">Meta title</Label>
                <Input id="metaTitle" {...register("metaTitle")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="metaDescription">Meta description</Label>
                <Textarea id="metaDescription" rows={3} {...register("metaDescription")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="metaKeywords">Meta keywords</Label>
                <Input id="metaKeywords" placeholder="comma, separated, keywords" {...register("metaKeywords")} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ogImage">OG image URL</Label>
                  <Input id="ogImage" placeholder="https://..." {...register("ogImage")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input id="canonicalUrl" placeholder="https://..." {...register("canonicalUrl")} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save SEO settings
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
