export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatarInitials: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "TechAI didn't just execute our spec — they questioned parts of it that didn't hold up and made the product better for it. Eighteen months in, their squad still ships like it's week one.",
    name: "Priya Nair",
    role: "VP of Engineering",
    company: "Fintech scale-up",
    avatarInitials: "PN",
    rating: 5,
  },
  {
    quote:
      "We came to TechAI with a legacy platform nobody wanted to touch. They untangled it, migrated us to a modern stack, and we had zero downtime through the whole process.",
    name: "Daniel Osei",
    role: "CTO",
    company: "Healthtech platform",
    avatarInitials: "DO",
    rating: 5,
  },
  {
    quote:
      "The RAG pipeline they built cut our support ticket resolution time by 40%. What impressed me most was how honest they were about what AI could and couldn't do for us.",
    name: "Meredith Cole",
    role: "Head of Product",
    company: "B2B SaaS company",
    avatarInitials: "MC",
    rating: 5,
  },
  {
    quote:
      "Our Black Friday traffic was 9x normal load and the storefront TechAI built didn't blink. That's the kind of engineering rigor you don't notice until it matters most.",
    name: "Arjun Malhotra",
    role: "Director of eCommerce",
    company: "DTC retail brand",
    avatarInitials: "AM",
    rating: 5,
  },
  {
    quote:
      "They embedded with our internal team so seamlessly that new hires assumed TechAI engineers were full-time staff. That's the level of ownership they bring.",
    name: "Sofia Lindgren",
    role: "Engineering Manager",
    company: "Logistics tech company",
    avatarInitials: "SL",
    rating: 5,
  },
  {
    quote:
      "From the first discovery call to launch, the communication was excellent. No surprises, no scope creep we didn't sign off on, and a product that actually shipped on time.",
    name: "Marcus Webb",
    role: "Founder & CEO",
    company: "Early-stage startup",
    avatarInitials: "MW",
    rating: 5,
  },
];
