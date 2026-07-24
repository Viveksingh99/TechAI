export interface PricingTier {
  name: string;
  slug: string;
  price: string;
  priceNote: string;
  description: string;
  bestFor: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    slug: "starter",
    price: "$8,500",
    priceNote: "per month, min. 2 months",
    description:
      "A focused, senior engineer-led team for well-scoped projects and MVPs.",
    bestFor: "Founders and small teams shipping a first product",
    features: [
      "1 dedicated senior engineer + shared PM",
      "Weekly sprint planning and demos",
      "Web, mobile, or backend focus",
      "Slack + async standups",
      "Code ownership from day one",
      "Basic CI/CD setup included",
    ],
    cta: "Start a project",
  },
  {
    name: "Growth",
    slug: "growth",
    price: "$22,000",
    priceNote: "per month, min. 3 months",
    description:
      "A full-stack squad for products that need to move fast across multiple fronts.",
    bestFor: "Scale-ups building multiple features in parallel",
    features: [
      "3-4 person cross-functional squad",
      "Dedicated product designer",
      "Bi-weekly stakeholder reviews",
      "QA automation and performance testing",
      "Architecture and technical strategy support",
      "Priority Slack response (business hours)",
    ],
    highlighted: true,
    cta: "Book a consultation",
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    price: "Custom",
    priceNote: "scoped to your engagement",
    description:
      "Dedicated pods, embedded architects, and compliance-ready delivery for complex programs.",
    bestFor: "Enterprises running multi-team, multi-quarter initiatives",
    features: [
      "Multiple dedicated squads with embedded architects",
      "Custom SLAs and 24/7 on-call support",
      "Security review and compliance support (SOC 2, HIPAA)",
      "Dedicated engagement and delivery manager",
      "Quarterly business reviews and roadmap planning",
      "Flexible ramp-up and ramp-down of team size",
    ],
    cta: "Talk to our team",
  },
];

export const pricingFaqs = [
  {
    question: "How is pricing structured?",
    answer:
      "We price by dedicated monthly capacity rather than hourly billing, so your team stays consistent and focused on your roadmap instead of tracking hours.",
  },
  {
    question: "Can we start smaller and scale up?",
    answer:
      "Yes. Most Enterprise engagements start as a Starter or Growth pod and expand once we've proven velocity and fit — we build the ramp-up plan together.",
  },
  {
    question: "What's included in the minimum engagement?",
    answer:
      "Discovery and technical scoping, sprint planning cadence, and a dedicated team for the full engagement window — there are no separate onboarding fees.",
  },
  {
    question: "Do you offer fixed-price projects?",
    answer:
      "For tightly scoped work (a defined MVP, a design system, a migration) we can quote fixed price after a short discovery phase. Ongoing product development is best served by our monthly capacity model.",
  },
];
