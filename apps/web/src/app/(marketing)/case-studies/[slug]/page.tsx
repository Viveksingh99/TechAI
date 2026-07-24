import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaBand } from "@/components/marketing/cta-band";
import { caseStudies, getCaseStudyBySlug } from "@/data/case-studies";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return { title: "Case study not found" };
  return { title: study.title, description: study.summary };
}

export default async function CaseStudyDetailPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-mesh-gradient opacity-60" aria-hidden />
        <div className="absolute inset-0 bg-grid-pattern opacity-40 mask-fade-b" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal>
            <Link
              href="/case-studies"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← All Case Studies
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge variant="accent">{study.industry}</Badge>
              <Badge variant="outline">{study.client}</Badge>
              <Badge variant="outline">{study.duration}</Badge>
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {study.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{study.summary}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {study.metrics.map((metric, idx) => (
            <Reveal key={metric.label} delay={idx * 0.05}>
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="font-display text-3xl font-bold text-primary">{metric.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-foreground">The challenge</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {study.challenge}
          </p>
        </Reveal>

        <div className="mt-14">
          <SectionHeading title="Our approach" />
          <div className="mt-6 space-y-3">
            {study.approach.map((point, idx) => (
              <Reveal key={point} delay={idx * 0.04}>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {idx + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/90">{point}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <SectionHeading title="The results" />
          <div className="mt-6 space-y-3">
            {study.results.map((result) => (
              <div key={result} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed text-foreground/90">{result}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-secondary/40 p-6">
          <div>
            <p className="text-xs text-muted-foreground">Team composition</p>
            <p className="mt-1 text-sm font-medium text-foreground">{study.team}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {study.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Want results like this for your product?"
        description="Tell us about your challenge — we'll tell you honestly whether we're the right fit."
      />
    </>
  );
}
