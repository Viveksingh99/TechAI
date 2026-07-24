export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "when-to-rebuild-vs-refactor",
    title: "When to rebuild vs. refactor: a framework we use with every client",
    excerpt:
      "Rewriting a codebase feels satisfying but is rarely the right call. Here's the framework we use to decide when a rebuild is actually justified.",
    category: "Engineering",
    author: "Ananya Iyer",
    authorRole: "Co-Founder & CTO",
    date: "2026-06-02",
    readTime: "7 min read",
    content: [
      "Every engineering team eventually stares down a codebase that feels impossible to work in, and the instinct is almost always the same: burn it down and start fresh. We understand the appeal — a rewrite promises a clean slate free of the accumulated decisions you didn't make. But after two decades of collective experience taking over other people's codebases, we can say with confidence: most rewrites fail to deliver on that promise, and many make things worse.",
      "The framework we use starts with a simple question: is the pain coming from the architecture, or from the code within it? These are very different problems. Messy code within a sound architecture is a refactoring problem — extract functions, add tests, improve naming, and the pain recedes without touching the foundations. Architectural pain — a monolith that can't scale, a data model that fundamentally doesn't fit the current product — is a different category entirely, and refactoring alone won't fix it.",
      "Even when architecture is the real culprit, a full rebuild is rarely the answer. We favor the 'strangler fig' pattern: build the new architecture alongside the old one, migrate functionality piece by piece, and decommission the legacy system only once every piece has a proven replacement. This approach costs more calendar time upfront but virtually eliminates the biggest risk of rewrites — the multi-month period where you have two half-working systems and no shippable product.",
      "The other factor we weigh heavily: how well do you actually understand why the current system behaves the way it does? Old code is often ugly for reasons that aren't visible from the outside — edge cases discovered in production, regulatory requirements, integrations you'd forgotten existed. A rewrite that doesn't account for this tacit knowledge tends to reintroduce bugs that were fixed years ago.",
      "Our rule of thumb: if you can point to specific architectural constraints causing specific measurable problems (not just 'it feels bad to work in'), and you have a migration plan that keeps the product shippable throughout, a rebuild might be justified. Otherwise, invest in refactoring — it's less exciting, but it's usually the faster path to a codebase your team actually enjoys working in.",
    ],
  },
  {
    slug: "evaluating-llm-features-before-shipping",
    title: "How we evaluate LLM features before they ever reach production",
    excerpt:
      "Shipping AI features without an evaluation strategy is how teams end up with unreliable products. Here's our process for testing before launch.",
    category: "AI",
    author: "Hana Kobayashi",
    authorRole: "Head of AI",
    date: "2026-05-14",
    readTime: "6 min read",
    content: [
      "The gap between an impressive LLM demo and a reliable production feature is enormous, and it's where most AI initiatives quietly stall. A model that nails your five test prompts in a live demo can fail unpredictably against the long tail of real user input — and without a systematic evaluation process, you won't find out until customers do.",
      "Before we write a single line of production integration code, we build an evaluation dataset — a curated, growing set of real or realistic inputs paired with what a correct or acceptable output looks like. This dataset becomes the yardstick for every prompt change, model swap, or pipeline adjustment going forward. Teams that skip this step end up evaluating changes by vibes, which doesn't scale past the first few iterations.",
      "For generative outputs where there's no single 'correct' answer, we use a combination of rubric-based scoring (does the output meet defined criteria: factual accuracy, tone, completeness) and, where appropriate, LLM-as-judge evaluation calibrated against human ratings. We're careful to validate that automated judges actually correlate with human judgment before trusting them at scale.",
      "We also build cost and latency into the evaluation from day one. A feature that produces great output but costs $2 per request or takes 12 seconds to respond isn't shippable in most product contexts — and it's much cheaper to catch that during evaluation than after launch when usage-based cloud bills start rolling in.",
      "Finally, evaluation doesn't stop at launch. We instrument production systems to sample real outputs for ongoing quality review, and we treat model or prompt provider changes (a new model version, a pricing change) as events that trigger re-evaluation, not silent production changes. AI features degrade quietly if you're not watching — our job is to make sure someone always is.",
    ],
  },
  {
    slug: "design-systems-that-survive-contact-with-engineering",
    title: "Design systems that survive contact with engineering",
    excerpt:
      "Most design systems look great in Figma and fall apart the moment engineers start implementing them. Here's how we avoid that gap.",
    category: "Design",
    author: "Leo Fischer",
    authorRole: "VP of Design",
    date: "2026-04-22",
    readTime: "5 min read",
    content: [
      "A design system's real test isn't how it looks in a Figma file — it's whether an engineer six months from now can build a new screen that feels consistent without asking a designer for help. Most design systems fail this test not because the visual design is bad, but because the system was designed in isolation from how it would actually be implemented.",
      "We build design systems with engineers in the room from the first working session, not just at handoff. Every component decision gets tested against a simple question: how would this actually get built, and does the API we're implicitly designing (props, variants, states) make sense as code, not just as a Figma component with variants?",
      "Documentation is the unglamorous part everyone skips, and it's the single biggest predictor of whether a design system survives past the initial build. We document not just what each component looks like, but when to use it versus a similar-looking alternative, and — critically — what NOT to do with it. The failure mode we see most often isn't a missing component; it's five slightly different implementations of the same pattern because nobody could tell if an existing component fit their need.",
      "We also treat the design system as a product with its own roadmap and deprecation process, not a one-time deliverable. Components get versioned, breaking changes get migration guides, and usage gets audited periodically to catch drift between the documented system and what's actually in the live product.",
    ],
  },
  {
    slug: "cloud-cost-audit-checklist",
    title: "The cloud cost audit checklist we run for every new infrastructure client",
    excerpt:
      "Most cloud cost problems come from the same five sources. Here's the checklist we use to find 20-40% in savings before touching architecture.",
    category: "Cloud",
    author: "Chidi Okafor",
    authorRole: "VP of Engineering",
    date: "2026-03-30",
    readTime: "8 min read",
    content: [
      "When a new infrastructure client comes to us with a cloud bill that's grown faster than their user base, our first move isn't architectural redesign — it's a structured audit that consistently finds the same handful of cost sources, regardless of company size or stack.",
      "The first stop is always compute right-sizing. It's astonishingly common to find production instances provisioned for a peak load that happened once, eighteen months ago, and never scaled back down. We pull actual utilization metrics over a 30-day window and flag anything running below 30% average utilization for resizing or auto-scaling.",
      "Second is storage lifecycle policies — or the lack thereof. Object storage buckets accumulating logs, backups, and old build artifacts with no expiration policy are one of the most common silent cost leaks we find, often adding up to thousands of dollars a month for data nobody will ever access again.",
      "Third, reserved capacity and savings plans. Many teams run entirely on on-demand pricing for workloads that are, in practice, completely predictable — a mistake that alone often accounts for 20-30% in avoidable spend for steady-state workloads.",
      "Fourth is data transfer costs, which are easy to overlook and hard to reason about, especially across multi-region or multi-cloud setups. We map actual data flow patterns to find unnecessary cross-region transfers that could be eliminated with better data locality.",
      "Finally, we audit for zombie resources — orphaned load balancers, unattached volumes, forgotten staging environments running 24/7 for a demo three months ago. Individually small, collectively these often represent a surprising chunk of avoidable spend. Running through these five areas systematically, before any architectural changes, is how we typically find that first 20-40% in savings within the first two weeks of an engagement.",
    ],
  },
  {
    slug: "staff-augmentation-vs-dedicated-squads",
    title: "Staff augmentation vs. dedicated squads: choosing the right engagement model",
    excerpt:
      "Not every project needs a full team, and not every gap needs a single contractor. Here's how we help clients pick the right model.",
    category: "Business",
    author: "Diego Fernandez",
    authorRole: "Head of Client Success",
    date: "2026-03-08",
    readTime: "5 min read",
    content: [
      "One of the most common questions we get from prospective clients isn't about technology at all — it's about engagement structure. Should you bring in individual contractors to fill specific skill gaps, or a dedicated squad that owns a workstream end to end? The answer depends less on budget and more on how much context-switching your internal team can absorb.",
      "Staff augmentation works best when you have strong internal technical leadership and product direction, and you simply need more hands executing against a well-defined backlog. The augmented engineers plug into your existing processes, standups, and code review culture. This model shines for filling a temporary skill gap — you need a React Native specialist for a three-month mobile push, for example — without disrupting how your team already operates.",
      "Dedicated squads make more sense when you need end-to-end ownership of a workstream, especially one that's somewhat separable from your core team's daily work — a new product line, a platform migration, an AI feature initiative. The squad brings its own internal processes, PM, and technical lead, which means less day-to-day management overhead for your team, but requires more upfront investment in clear scope and success criteria since the squad operates with more autonomy.",
      "The failure mode we see most often is mismatched expectations: a company brings in staff augmentation engineers but expects dedicated-squad-level autonomy and ownership, or vice versa — bringing in a dedicated squad but attempting to manage each engineer's daily tasks individually. Getting explicit about which model you actually need, before the engagement starts, prevents most of the friction we see in the first month of a new partnership.",
    ],
  },
  {
    slug: "core-web-vitals-that-actually-move-conversion",
    title: "The Core Web Vitals that actually move conversion (and the ones that don't)",
    excerpt:
      "Not all performance metrics are created equal. Here's what we've learned optimizing storefronts and SaaS dashboards for real business impact.",
    category: "Engineering",
    author: "Rohan Verma",
    authorRole: "Co-Founder & CEO",
    date: "2026-02-18",
    readTime: "6 min read",
    content: [
      "Every performance optimization guide treats Core Web Vitals as equally important, chasing a perfect Lighthouse score across the board. After optimizing dozens of commerce storefronts and SaaS dashboards, we've found the relationship between specific metrics and actual business outcomes is far more uneven than the conventional wisdom suggests.",
      "Largest Contentful Paint (LCP) has the strongest, most consistent correlation with conversion across every client vertical we've worked with. Users decide within the first couple seconds whether a page feels trustworthy and fast; a slow LCP taxes that first impression directly. This is the metric we prioritize first and hardest, particularly for landing pages and product detail pages where first impressions carry outsized weight.",
      "Cumulative Layout Shift (CLS) matters most on content-heavy and commerce pages where users are actively scanning and about to tap something — a shifting layout that causes a mis-tap on a checkout page has an outsized, disproportionate effect on conversion relative to its 'severity' in a Lighthouse score.",
      "Interaction to Next Paint (INP), the metric that replaced First Input Delay, matters far more for SaaS dashboards and interactive tools than for content sites. If your product involves a lot of filtering, sorting, or real-time data manipulation, INP regressions are often the actual cause of a 'this app feels sluggish' complaint from users, even when other metrics look fine.",
      "Our practical advice: instrument real user monitoring (not just synthetic lab tests) segmented by page type, and correlate it with your actual conversion or engagement funnel data before deciding where to invest optimization effort. A 200ms LCP improvement on your highest-traffic landing page is worth more than a perfect score on a page few users ever land on.",
    ],
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
