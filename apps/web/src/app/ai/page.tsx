"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { AI_TOOLS } from "@/config/navigation";

export default function AiHubPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI Studio"
        title="AI tools"
        description="Speed up delivery with AI-assisted proposals, contracts, code reviews and more."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AI_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.slug}
              href={`/ai/${tool.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5.5 w-5.5" />
              </span>
              <div className="space-y-1">
                <h3 className="font-display text-base font-semibold text-foreground">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Open tool <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-secondary/20 p-5">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          These tools use a live AI model when configured, and fall back to a templated response so your workflow is
          never blocked.
        </p>
      </div>
    </div>
  );
}
