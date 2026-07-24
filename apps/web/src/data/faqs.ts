export interface Faq {
  category: string;
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    category: "Getting started",
    question: "How do we start working with TechAI?",
    answer:
      "Book a free consultation through our site, and we'll schedule a call within one business day to understand your goals. From there, most engagements begin with a short discovery phase to scope work before any contract is signed.",
  },
  {
    category: "Getting started",
    question: "Do you sign NDAs before discussing our project?",
    answer:
      "Yes, we're happy to sign an NDA before any detailed discussion. Just let us know during your first call and we'll send one over immediately.",
  },
  {
    category: "Getting started",
    question: "What information do you need from us to scope a project?",
    answer:
      "A rough sense of your goals, timeline, and budget range is enough to start. We'll ask clarifying questions during discovery — you don't need a finished spec before reaching out.",
  },
  {
    category: "Engagement & pricing",
    question: "Do you work hourly, fixed-price, or dedicated team models?",
    answer:
      "We primarily work on a dedicated monthly capacity model (see our Pricing page), with fixed-price available for tightly scoped, well-defined projects like migrations or design systems.",
  },
  {
    category: "Engagement & pricing",
    question: "What's the minimum engagement length?",
    answer:
      "Our Starter tier has a 2-month minimum; Growth and Enterprise engagements typically run 3+ months given the ramp-up investment on both sides.",
  },
  {
    category: "Engagement & pricing",
    question: "Can we scale the team size up or down during the engagement?",
    answer:
      "Yes — most long-term clients adjust team size as priorities shift. We just need 2-3 weeks notice to ramp engineers on or off cleanly.",
  },
  {
    category: "Process",
    question: "How do you keep us updated on progress?",
    answer:
      "Weekly sprint demos, a shared project board, and direct Slack access to your team are standard on every engagement. Enterprise clients also get bi-weekly stakeholder reviews.",
  },
  {
    category: "Process",
    question: "What if we need to change direction mid-project?",
    answer:
      "Our sprint-based process is built for this. We re-prioritize the backlog at sprint boundaries rather than locking you into a rigid plan that can't adapt.",
  },
  {
    category: "Process",
    question: "Who owns the code and IP we build together?",
    answer:
      "You do, fully and unconditionally, from day one. Our contracts assign all IP rights for work product to the client.",
  },
  {
    category: "Team & delivery",
    question: "Where is your team located?",
    answer:
      "TechAI has engineers and designers across North America, Europe, and Asia, allowing us to offer overlapping-hours coverage for most client time zones.",
  },
  {
    category: "Team & delivery",
    question: "Will the same team stay on our project throughout?",
    answer:
      "Yes, team continuity is a core promise — we staff for long-term engagement, not rotating contractors, and flag any planned team changes well in advance.",
  },
  {
    category: "Team & delivery",
    question: "Do you provide ongoing support after launch?",
    answer:
      "Most clients transition to our Maintenance & Support service post-launch, with SLA-backed response times and monthly enhancement capacity.",
  },
];
