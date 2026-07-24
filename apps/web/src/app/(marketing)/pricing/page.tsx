import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/marketing/reveal";
import { CtaBand } from "@/components/marketing/cta-band";
import { pricingTiers, pricingFaqs } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for dedicated software engineering teams — Starter, Growth, and Enterprise plans.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Dedicated teams, transparent pricing"
        description="No hourly surprises, no black-box retainers. Pick the model that matches how big your roadmap is."
      />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, idx) => (
            <Reveal key={tier.slug} delay={idx * 0.05}>
              <Card
                className={cn(
                  "flex h-full flex-col p-8",
                  tier.highlighted && "border-primary/50 shadow-lg ring-1 ring-primary/20"
                )}
              >
                {tier.highlighted && (
                  <span className="mb-4 w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                <div className="mt-6">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">{tier.priceNote}</p>
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-primary">
                  {tier.bestFor}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8"
                  variant={tier.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/consultation">{tier.cta}</Link>
                </Button>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading title="Pricing questions" align="center" className="mx-auto" />
        <div className="mt-10 space-y-4">
          {pricingFaqs.map((faq) => (
            <Reveal key={faq.question}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-base font-semibold text-foreground">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
