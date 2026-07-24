import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { CtaBand } from "@/components/marketing/cta-band";
import { faqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about working with TechAI — engagement models, pricing, process, and team.",
};

const categories = Array.from(new Set(faqs.map((f) => f.category)));

export default function FaqsPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQs"
        title="Questions we get asked before every kickoff"
        description="Can't find what you're looking for? Reach out — we respond within one business day."
      />
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="mb-5 font-display text-xl font-bold text-foreground">{category}</h2>
            <FaqAccordion faqs={faqs.filter((f) => f.category === category)} />
          </div>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
