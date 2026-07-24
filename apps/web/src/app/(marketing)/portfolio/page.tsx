import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { CtaBand } from "@/components/marketing/cta-band";
import { portfolioItems } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A selection of products TechAI has designed and engineered across fintech, healthtech, eCommerce, AI, and logistics.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Products we've helped build, from zero to production"
        description="A selection of engagements across fintech, healthtech, eCommerce, AI, and logistics — each one still running in production today."
      />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item, idx) => (
            <Reveal key={item.slug} delay={idx * 0.04}>
              <Card className="group h-full overflow-hidden p-0">
                <div className={`h-36 w-full bg-gradient-to-br ${item.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-primary">{item.category}</p>
                      <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                        {item.name}
                      </h3>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">{item.year}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/case-studies"
            className="text-sm font-medium text-primary hover:opacity-80"
          >
            Want the full story behind these projects? Read our case studies →
          </Link>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
