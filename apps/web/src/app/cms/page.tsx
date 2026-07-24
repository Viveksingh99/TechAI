"use client";

import Link from "next/link";
import { FileText, Image as ImageIcon, Layout, Search, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { BlogPost, CmsPage, Media } from "@/types";

export default function CmsOverviewPage() {
  const postsQuery = useApiQuery<BlogPost[]>(["cms", "blog-posts", "overview"], "/cms/blog-posts", {
    fallback: [],
    params: { limit: 100 },
  });
  const pagesQuery = useApiQuery<CmsPage[]>(["cms", "pages"], "/cms/pages", { fallback: [] });
  const mediaQuery = useApiQuery<Media[]>(["cms", "media", "overview"], "/cms/media", {
    fallback: [],
    params: { limit: 100 },
  });

  const published = postsQuery.data.filter((p) => p.status === "PUBLISHED").length;
  const recentPosts = [...postsQuery.data]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="CMS" title="Content overview" description="Manage your public site's blog, pages, media and SEO." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Blog posts" value={postsQuery.data.length} icon={FileText} loading={postsQuery.isLoading} hint={`${published} published`} />
        <StatCard label="Pages" value={pagesQuery.data.length} icon={Layout} loading={pagesQuery.isLoading} />
        <StatCard label="Media files" value={mediaQuery.data.length} icon={ImageIcon} loading={mediaQuery.isLoading} />
        <StatCard label="SEO ready" value={postsQuery.data.filter((p) => p.seo).length} icon={Search} loading={postsQuery.isLoading} hint="Posts with meta tags" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent posts</h2>
            <Link href="/cms/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {postsQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-secondary/40" />
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <EmptyState title="No blog posts yet" description="Publish your first article to see it here." />
          ) : (
            <div className="divide-y divide-border">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                  </div>
                  <StatusBadge status={post.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <QuickLink href="/cms/blog" icon={FileText} title="Blog" description="Write and publish articles" />
          <QuickLink href="/cms/pages" icon={Layout} title="Pages" description="Manage static site pages" />
          <QuickLink href="/cms/media" icon={ImageIcon} title="Media library" description="Upload and organize assets" />
          <QuickLink href="/cms/seo" icon={Search} title="SEO" description="Optimize meta tags and previews" />
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
