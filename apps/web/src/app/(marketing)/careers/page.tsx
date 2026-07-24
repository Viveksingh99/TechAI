import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/marketing/reveal";
import { jobOpenings, cultureValues, benefits } from "@/data/careers";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join TechAI — open engineering, design, and delivery roles at a remote-first software agency.",
};

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build software that ships, with people who care how"
        description="We're a remote-first team of engineers, designers, and operators solving hard problems for real clients — not building internal tools nobody uses."
      />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Open roles" title="Where we're hiring right now" />
        <div className="mt-10 space-y-4">
          {jobOpenings.map((job, idx) => (
            <Reveal key={job.slug} delay={idx * 0.04}>
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">{job.department}</Badge>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                    {job.title}
                  </h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </p>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">{job.description}</p>
                </div>
                <Button variant="outline" asChild className="shrink-0">
                  <Link href={`/contact?role=${job.slug}`}>
                    Apply
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Culture" title="How we work together" align="center" className="mx-auto" />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cultureValues.map((value, idx) => (
              <Reveal key={value.title} delay={idx * 0.05}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Benefits" title="What you get" align="center" className="mx-auto" />
        <ul className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground/90"
            >
              {benefit}
            </li>
          ))}
        </ul>
        <Button size="lg" className="mt-10" asChild>
          <Link href="/contact">
            Don&apos;t see your role? Reach out anyway
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </>
  );
}
