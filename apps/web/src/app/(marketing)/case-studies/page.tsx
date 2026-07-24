import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { CtaBand } from "@/components/marketing/cta-band";
import { caseStudies } from "@/data/case-studies";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "In-depth case studies on how TechAI solved real engineering challenges for fintech, healthtech, eCommerce, and AI companies.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Case Studies"
        title="The challenges, the approach, the results"
        description="Real engagements, real constraints, real numbers — no vague success stories."
      />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {caseStudies.map((study, idx) => (
            <Reveal key={study.slug} delay={idx * 0.05}>
              <Link
                href={`/case-studies/${study.slug}`}
                className="group block rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                  <div className="max-w-2xl">
                    <Badge variant="accent">{study.industry}</Badge>
                    <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
                      {study.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {study.summary}
                    </p>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
                    {study.metrics.slice(0, 2).map((metric) => (
                      <div key={metric.label} className="rounded-xl bg-secondary/50 px-4 py-3">
                        <p className="font-display text-xl font-bold text-primary">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Read the full case study
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
