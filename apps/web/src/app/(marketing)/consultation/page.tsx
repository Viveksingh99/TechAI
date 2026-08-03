import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";
import { ConsultationForm } from "@/components/marketing/consultation-form";
import { Reveal } from "@/components/marketing/reveal";
import { COMPANY } from "@/data/company";

export const metadata: Metadata = {
  title: "Book a Free Consultation",
  description:
    "Book a free consultation with TechAI's engineering team to scope your next web, mobile, or AI product.",
};

const whatToExpect = [
  "A 30-minute call with a senior engineer, not a salesperson",
  "Honest feedback on scope, timeline, and feasibility",
  "A follow-up summary with recommended next steps",
  "No pressure, no obligation to proceed",
];

export default function ConsultationPage() {
  return (
    <>
      <PageHero
        eyebrow="Free Consultation"
        title="Let's scope your project together"
        description="Tell us what you're building. We'll come back with honest feedback on scope, approach, and timeline — before you commit to anything."
      />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-foreground">What to expect</h2>
              <ul className="mt-6 space-y-4">
                {whatToExpect.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="mt-8">
              <Card className="bg-secondary/40 p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Prefer email first?{" "}
                  <a href={COMPANY.emailHref} className="font-medium text-primary hover:underline">
                    {COMPANY.email}
                  </a>
                </p>
              </Card>
            </Reveal>
          </div>
          <Reveal delay={0.05}>
            <Card className="p-8">
              <ConsultationForm />
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  );
}
