import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { CtaBand } from "@/components/marketing/cta-band";
import { testimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "What clients say about working with TechAI's engineering and design teams.",
};

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="What it's actually like to work with us"
        description="No highlight reel — these are the same clients you can talk to before signing anything."
      />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} delay={idx * 0.05} />
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
