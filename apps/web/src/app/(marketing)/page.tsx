import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeHero } from "@/components/marketing/home-hero";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceCard } from "@/components/marketing/service-card";
import { TechStrip } from "@/components/marketing/tech-strip";
import { ProcessTimeline } from "@/components/marketing/process-timeline";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { CtaBand } from "@/components/marketing/cta-band";
import { services } from "@/data/services";
import { testimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "TechAI — Software Engineering & AI Product Studio",
  description:
    "TechAI is a software agency that designs, builds, and scales web, mobile, AI, and cloud products for startups and enterprises.",
};

export default function HomePage() {
  const featuredServices = services.slice(0, 6);

  return (
    <>
      <HomeHero />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="What we do"
            title="End-to-end product engineering"
            description="From a blank repo to a platform running at scale — we cover the full stack of building modern software products."
          />
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/services">
              All services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service, idx) => (
            <ServiceCard key={service.slug} service={service} delay={idx * 0.05} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Engineered with the technologies powering today&apos;s best products
          </p>
          <div className="mt-8">
            <TechStrip />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <SectionHeading
          eyebrow="How we work"
          title="A process built for momentum, not meetings"
          description="Five stages, one continuous feedback loop — designed to keep you shipping instead of waiting."
          align="center"
          className="mx-auto"
        />
        <div className="mt-16">
          <ProcessTimeline />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <SectionHeading
          eyebrow="Client stories"
          title="Trusted by teams who need software that just works"
          align="center"
          className="mx-auto"
        />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((testimonial, idx) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} delay={idx * 0.05} />
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
