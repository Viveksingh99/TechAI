import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { TechCategoryGrid } from "@/components/marketing/tech-strip";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Technologies",
  description:
    "The frontend, backend, mobile, data, AI, and cloud technologies TechAI uses to build production software.",
};

export default function TechnologiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Technologies"
        title="The right tool for the job, every time"
        description="We stay opinionated about quality and pragmatic about tools — choosing technology based on your product's needs, not our comfort zone."
      />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <TechCategoryGrid />
      </section>
      <CtaBand
        title="Not sure which stack fits your product?"
        description="Tell us what you're building — we'll recommend an architecture, not just a tech list."
      />
    </>
  );
}
