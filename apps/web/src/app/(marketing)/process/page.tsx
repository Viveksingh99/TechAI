import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { ProcessTimeline } from "@/components/marketing/process-timeline";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How TechAI takes products from discovery to launch and beyond — a five-stage process built for momentum.",
};

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Process"
        title="Structured enough to trust, flexible enough to adapt"
        description="Every engagement moves through the same five stages — with enough rigor to de-risk delivery and enough flexibility to respond when priorities shift."
      />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <ProcessTimeline showDeliverables />
      </section>
      <CtaBand />
    </>
  );
}
