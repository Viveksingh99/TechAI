import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/components/dynamic-icon";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/marketing/reveal";
import { CtaBand } from "@/components/marketing/cta-band";
import { leadershipTeam, companyValues } from "@/data/team";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the leadership team behind TechAI and the values that shape how we build software for clients.",
};

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title="The people behind every engagement"
        description="TechAI is built by engineers, designers, and operators who've shipped production software at scale — and who still write code, review designs, and join client calls."
      />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leadershipTeam.map((member, idx) => (
            <Reveal key={member.name} delay={idx * 0.05}>
              <Card className="h-full p-6">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-base">{member.initials}</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-primary">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {member.focus.map((f) => (
                    <Badge key={f} variant="outline" className="text-[11px]">
                      {f}
                    </Badge>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What we believe"
            title="Values that show up in the work, not just the wall"
            align="center"
            className="mx-auto"
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {companyValues.map((value, idx) => (
              <Reveal key={value.title} delay={idx * 0.05}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <DynamicIcon name={value.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Like how we think? Let's talk about your project."
        description="Book a call with the team — often with one of the people you just read about."
      />
    </>
  );
}
