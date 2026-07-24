import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { ServiceCard } from "@/components/marketing/service-card";
import { CtaBand } from "@/components/marketing/cta-band";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore TechAI's full range of software engineering services — web, mobile, eCommerce, SaaS, AI, cloud, DevOps, design, and more.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Every capability you need, under one team"
        description="From your first product to your tenth platform migration — we bring senior engineers and designers who've solved this problem before."
      />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <ServiceCard key={service.slug} service={service} delay={idx * 0.04} />
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
