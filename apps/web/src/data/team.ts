export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  focus: string[];
}

export const leadershipTeam: TeamMember[] = [
  {
    name: "Rohan Verma",
    role: "Co-Founder & CEO",
    bio: "Started TechAI after a decade building fintech infrastructure. Believes agencies should be judged by the code that's still running two years later.",
    initials: "RV",
    focus: ["Strategy", "Client Partnerships"],
  },
  {
    name: "Ananya Iyer",
    role: "Co-Founder & CTO",
    bio: "Leads technical architecture across every engagement. Previously built platform infrastructure at scale for two Series C startups.",
    initials: "AI",
    focus: ["Architecture", "Platform Engineering"],
  },
  {
    name: "Leo Fischer",
    role: "VP of Design",
    bio: "Runs the design practice with a research-first philosophy — no pixels move until the problem is fully understood.",
    initials: "LF",
    focus: ["Product Design", "Design Systems"],
  },
  {
    name: "Chidi Okafor",
    role: "VP of Engineering",
    bio: "Oversees delivery across all engineering pods, with a focus on code quality bars and engineer growth paths.",
    initials: "CO",
    focus: ["Engineering Delivery", "Mentorship"],
  },
  {
    name: "Hana Kobayashi",
    role: "Head of AI",
    bio: "Leads the applied AI practice, translating research-grade techniques into production systems clients can actually rely on.",
    initials: "HK",
    focus: ["Applied AI", "ML Infrastructure"],
  },
  {
    name: "Diego Fernandez",
    role: "Head of Client Success",
    bio: "Makes sure every engagement has clear scope, honest timelines, and a client who knows exactly where things stand.",
    initials: "DF",
    focus: ["Account Management", "Delivery Ops"],
  },
];

export const companyValues = [
  {
    title: "Ownership over output",
    description:
      "We treat every codebase like we're the ones on call for it at 3am — because often, we are.",
    icon: "ShieldCheck",
  },
  {
    title: "Honest scoping",
    description:
      "We'd rather tell you a timeline is unrealistic upfront than blow through it silently.",
    icon: "MessageSquareText",
  },
  {
    title: "Craft compounds",
    description:
      "Clean architecture and thoughtful design decisions today save months of pain eighteen months from now.",
    icon: "Gem",
  },
  {
    title: "Teach, don't gatekeep",
    description:
      "We document decisions and transfer knowledge so your team is never dependent on us longer than you want to be.",
    icon: "GraduationCap",
  },
];
