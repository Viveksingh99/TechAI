import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactForm } from "@/components/marketing/contact-form";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with TechAI — questions, project inquiries, partnerships, and careers.",
};

const contactDetails = [
  { icon: Mail, label: "Email", value: "hello@techai.dev" },
  { icon: Phone, label: "Phone", value: "+1 (415) 555-0182" },
  { icon: MapPin, label: "HQ", value: "San Francisco, CA — Remote-first team" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about what you're building"
        description="Whether it's a new project, an existing product that needs help, or a partnership idea — we read every message ourselves."
      />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            {contactDetails.map((detail, idx) => (
              <Reveal key={detail.label} delay={idx * 0.05}>
                <Card className="flex items-center gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <detail.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{detail.label}</p>
                    <p className="text-sm font-medium text-foreground">{detail.value}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
            <Reveal delay={0.15}>
              <Card className="p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Prefer a live conversation? Book a slot directly on our{" "}
                  <a href="/consultation" className="font-medium text-primary hover:underline">
                    consultation calendar
                  </a>{" "}
                  and we&apos;ll come prepared with questions specific to your project.
                </p>
              </Card>
            </Reveal>
          </div>

          <Reveal>
            <Card className="p-8">
              <ContactForm />
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  );
}
