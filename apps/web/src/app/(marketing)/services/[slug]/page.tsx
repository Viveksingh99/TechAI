import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DynamicIcon } from "@/components/dynamic-icon";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaBand } from "@/components/marketing/cta-band";
import { services, getServiceBySlug } from "@/data/services";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.name,
    description: service.summary,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const otherServices = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-mesh-gradient opacity-60" aria-hidden />
        <div className="absolute inset-0 bg-grid-pattern opacity-40 mask-fade-b" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <Reveal>
            <Link
              href="/services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← All Services
            </Link>
            <div className="mt-6 flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <DynamicIcon name={service.icon} className="h-7 w-7" />
              </span>
              <Badge variant="accent">{service.tagline}</Badge>
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {service.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href="/consultation">
                  Book a Free Consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <div className="rounded-xl border border-border bg-card px-4 py-2.5">
                <p className="text-xs text-muted-foreground">{service.heroStat.label}</p>
                <p className="font-display text-lg font-bold text-foreground">
                  {service.heroStat.value}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading title="What's included" />
            <div className="mt-8 space-y-3">
              {service.highlights.map((highlight) => (
                <Reveal key={highlight}>
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground/90">{highlight}</span>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-14">
              <SectionHeading title="What you'll receive" />
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {service.deliverables.map((d) => (
                  <li
                    key={d}
                    className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground/90"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold text-foreground">
                Ideal for
              </h3>
              <ul className="mt-4 space-y-3">
                {service.idealFor.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold text-foreground">
                Tech we use
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.techStack.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold text-foreground">
                Engagement models
              </h3>
              <ul className="mt-4 space-y-2">
                {service.engagementModels.map((model) => (
                  <li key={model} className="text-sm text-muted-foreground">
                    {model}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading title="Frequently asked questions" align="center" className="mx-auto" />
        <div className="mt-10 space-y-4">
          {service.faqs.map((faq) => (
            <Reveal key={faq.question}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-base font-semibold text-foreground">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Explore more" title="Other services you might need" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {otherServices.map((s, idx) => (
            <ServiceMini key={s.slug} slug={s.slug} name={s.name} summary={s.summary} icon={s.icon} delay={idx * 0.05} />
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}

function ServiceMini({
  slug,
  name,
  summary,
  icon,
  delay,
}: {
  slug: string;
  name: string;
  summary: string;
  icon: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/services/${slug}`}
        className="block h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <DynamicIcon name={icon} className="h-5 w-5" />
        </span>
        <h3 className="mt-4 font-display text-base font-semibold text-foreground">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{summary}</p>
      </Link>
    </Reveal>
  );
}
