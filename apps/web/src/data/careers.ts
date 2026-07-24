export interface JobOpening {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

export const jobOpenings: JobOpening[] = [
  {
    slug: "senior-fullstack-engineer",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (US / EU overlap)",
    type: "Full-time",
    description:
      "Own feature delivery across React/Next.js frontends and Node.js backends for client engagements spanning fintech, healthtech, and SaaS.",
  },
  {
    slug: "senior-mobile-engineer",
    title: "Senior Mobile Engineer (React Native)",
    department: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Lead mobile architecture decisions and mentor engineers across our React Native project portfolio.",
  },
  {
    slug: "ai-ml-engineer",
    title: "AI/ML Engineer",
    department: "AI Practice",
    location: "Remote (US / EU overlap)",
    type: "Full-time",
    description:
      "Build production RAG pipelines, evaluation harnesses, and fine-tuning workflows for client-facing AI features.",
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    department: "Design",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Lead research, prototyping, and design system work across 2-3 concurrent client engagements.",
  },
  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    department: "Platform",
    location: "Remote (Global)",
    type: "Full-time",
    description:
      "Design CI/CD pipelines and cloud infrastructure for client platforms across AWS, GCP, and Azure.",
  },
  {
    slug: "technical-project-manager",
    title: "Technical Project Manager",
    department: "Delivery",
    location: "Remote (US / EU overlap)",
    type: "Full-time",
    description:
      "Own delivery cadence, scope, and client communication for 1-2 dedicated squads at a time.",
  },
];

export const cultureValues = [
  {
    title: "Async-first, meeting-light",
    description: "We default to written communication and async updates so people can do focused work across time zones.",
  },
  {
    title: "Real ownership, real trust",
    description: "Engineers talk directly to clients. No layers of translation between the people building and the people deciding.",
  },
  {
    title: "Growth is structured, not accidental",
    description: "Every team member has a growth plan reviewed quarterly, with dedicated learning time built into sprints.",
  },
  {
    title: "Remote done properly",
    description: "Home office stipends, flexible hours within overlap windows, and an annual team offsite — not just a Slack workspace.",
  },
];

export const benefits = [
  "Competitive salary benchmarked annually against market data",
  "Remote-first with flexible hours inside your team's overlap window",
  "Annual learning & development budget",
  "Home office setup stipend",
  "Health coverage stipend for all team members",
  "Company-wide offsite once a year",
];
