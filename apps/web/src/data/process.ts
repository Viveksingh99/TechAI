export interface ProcessStep {
  step: string;
  title: string;
  description: string;
  deliverables: string[];
  icon: string;
}

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Discover",
    description:
      "We start by understanding your business, users, and constraints — not just the feature list. Stakeholder interviews, technical audits, and competitive analysis ground every decision that follows.",
    deliverables: ["Discovery workshop", "Technical feasibility assessment", "Success metrics definition"],
    icon: "Search",
  },
  {
    step: "02",
    title: "Design",
    description:
      "Product designers translate research into wireframes, prototypes, and a design system. We validate flows with real users before a single line of production code is written.",
    deliverables: ["User flows & wireframes", "High-fidelity prototypes", "Design system foundations"],
    icon: "PenTool",
  },
  {
    step: "03",
    title: "Build",
    description:
      "Engineers work in focused sprints with continuous integration from day one. You get weekly demos and full visibility into what's shipping and why, not a black box until launch.",
    deliverables: ["Sprint-based development", "Weekly demos", "Automated testing & CI/CD"],
    icon: "Hammer",
  },
  {
    step: "04",
    title: "Launch",
    description:
      "We de-risk launch day with staged rollouts, load testing, and monitoring in place before your first real user touches production.",
    deliverables: ["Staged rollout plan", "Performance & security review", "Launch-day monitoring"],
    icon: "Rocket",
  },
  {
    step: "05",
    title: "Grow",
    description:
      "Post-launch, we stay close to usage data — fixing what's broken, doubling down on what's working, and planning the next roadmap increment with you.",
    deliverables: ["Usage analytics review", "Iterative roadmap planning", "Ongoing support options"],
    icon: "TrendingUp",
  },
];
