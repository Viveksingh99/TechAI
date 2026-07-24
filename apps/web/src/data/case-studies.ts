export interface CaseStudyMetric {
  label: string;
  value: string;
}

export interface CaseStudy {
  slug: string;
  client: string;
  industry: string;
  title: string;
  summary: string;
  challenge: string;
  approach: string[];
  results: string[];
  metrics: CaseStudyMetric[];
  tags: string[];
  duration: string;
  team: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "ledgerflow-multi-tenant-rebuild",
    client: "LedgerFlow",
    industry: "Fintech",
    title: "Rebuilding a fintech platform for multi-tenant scale",
    summary:
      "LedgerFlow's single-tenant architecture couldn't support their enterprise sales pipeline. We rebuilt the core platform for true multi-tenancy without a single day of downtime for existing customers.",
    challenge:
      "LedgerFlow had product-market fit but an architecture that provisioned a full separate deployment per customer — untenable as their enterprise pipeline grew past 50 prospective logos. Sales was closing deals the infrastructure couldn't support within committed timelines.",
    approach: [
      "Audited existing single-tenant architecture and mapped a migration path to shared multi-tenant infrastructure with row-level data isolation",
      "Designed a phased migration strategy moving customers in batches with automated verification at each step",
      "Rebuilt the billing and permissions layer to support tenant-level configuration and usage-based pricing",
      "Implemented comprehensive integration tests covering tenant isolation edge cases before any customer migration",
    ],
    results: [
      "Migrated 140 existing customers to the new architecture with zero reported downtime",
      "Reduced infrastructure cost per customer by 74% by eliminating per-tenant deployments",
      "Cut new customer provisioning time from 3 days to under 10 minutes",
      "Enabled sales to close 22 previously-blocked enterprise deals within the following quarter",
    ],
    metrics: [
      { label: "Infra cost reduction", value: "74%" },
      { label: "Provisioning time", value: "10 min" },
      { label: "Customers migrated", value: "140" },
      { label: "Downtime during migration", value: "0 hrs" },
    ],
    tags: ["Fintech", "Multi-tenancy", "Migration", "NestJS"],
    duration: "7 months",
    team: "5 engineers, 1 architect, 1 PM",
  },
  {
    slug: "docuwise-ai-contract-review",
    client: "DocuWise AI",
    industry: "Legal Tech",
    title: "Cutting contract review time by 65% with a custom RAG pipeline",
    summary:
      "DocuWise wanted to help legal teams review contracts faster without sacrificing accuracy. We built a retrieval-augmented generation pipeline with a rigorous evaluation harness that legal teams could actually trust.",
    challenge:
      "Generic LLM prompting produced plausible-sounding but occasionally incorrect contract clause analysis — an unacceptable risk profile for legal review workflows where errors carry real liability.",
    approach: [
      "Built a custom RAG pipeline over a curated corpus of contract clauses, precedent, and jurisdiction-specific case law",
      "Designed a multi-stage retrieval and re-ranking system to surface the most relevant precedent for each clause",
      "Created an evaluation harness with legal-expert-reviewed ground truth to measure accuracy before every deployment",
      "Added confidence scoring and source citation to every AI-generated analysis so lawyers could verify claims quickly",
    ],
    results: [
      "Reduced average contract review time from 4.5 hours to under 90 minutes",
      "Achieved 94% agreement with expert legal reviewers on flagged clause risk ratings",
      "Processed over 30,000 contract reviews in the first six months post-launch",
      "Enabled DocuWise to close a Series A round citing the product's technical differentiation",
    ],
    metrics: [
      { label: "Review time reduction", value: "65%" },
      { label: "Expert agreement rate", value: "94%" },
      { label: "Contracts processed", value: "30K+" },
      { label: "Time to first value", value: "3 weeks" },
    ],
    tags: ["AI", "RAG", "Legal Tech", "LangChain"],
    duration: "5 months",
    team: "3 engineers, 1 ML specialist, 1 PM",
  },
  {
    slug: "orbital-commerce-black-friday",
    client: "Orbital Commerce",
    industry: "eCommerce",
    title: "Surviving a 9x Black Friday traffic spike without downtime",
    summary:
      "Orbital's previous storefront buckled under peak-season load two years running. We rebuilt their commerce stack headless and load-tested it against real traffic patterns before the next sales event.",
    challenge:
      "Orbital's monolithic theme-based storefront had crashed during the prior two Black Friday events, costing an estimated $400K in lost sales and significant brand damage across their 40 regional storefronts.",
    approach: [
      "Migrated to a headless architecture using Shopify's Storefront API with a custom Next.js frontend deployed on the edge",
      "Implemented aggressive caching and stale-while-revalidate strategies for product and inventory data",
      "Built a custom load-testing suite simulating realistic Black Friday traffic patterns across all 40 storefronts",
      "Set up real-time monitoring and auto-scaling infrastructure with a dedicated war-room protocol for the sales event",
    ],
    results: [
      "Handled 9x normal traffic during Black Friday with zero downtime across all storefronts",
      "Improved average page load time from 4.2s to 0.8s",
      "Increased Black Friday conversion rate by 31% year-over-year",
      "Reduced infrastructure costs by 28% despite handling significantly higher peak load",
    ],
    metrics: [
      { label: "Peak traffic handled", value: "9x normal" },
      { label: "Page load improvement", value: "81%" },
      { label: "Conversion rate lift", value: "+31%" },
      { label: "Downtime", value: "0 min" },
    ],
    tags: ["eCommerce", "Headless", "Performance", "Shopify"],
    duration: "4 months",
    team: "4 engineers, 1 architect",
  },
  {
    slug: "carewell-connect-telehealth-launch",
    client: "Carewell Connect",
    industry: "Healthtech",
    title: "Launching a HIPAA-compliant telehealth platform in 14 weeks",
    summary:
      "Carewell needed to launch a full telehealth platform ahead of a funding milestone. We delivered a production-ready, HIPAA-compliant app spanning video consultations, messaging, and care plan tracking.",
    challenge:
      "Carewell had a hard deadline tied to their Series A close and no existing engineering team capable of building HIPAA-compliant infrastructure from scratch within the timeline.",
    approach: [
      "Ran a compressed two-week discovery phase to lock scope around the MVP's core clinical workflows",
      "Built on HIPAA-eligible AWS infrastructure with encrypted data at rest and in transit, and full audit logging",
      "Integrated WebRTC-based video consultations with automatic session recording and consent management",
      "Designed and built the full React Native app for iOS and Android from a single shared codebase",
    ],
    results: [
      "Launched to app stores in 14 weeks from kickoff, hitting the Series A milestone deadline",
      "Passed third-party HIPAA compliance audit with zero critical findings",
      "Onboarded 8,000 patients and 200 care providers in the first quarter post-launch",
      "Maintained 99.97% platform uptime through the initial six months of operation",
    ],
    metrics: [
      { label: "Time to launch", value: "14 weeks" },
      { label: "Compliance audit findings", value: "0 critical" },
      { label: "Patients onboarded (Q1)", value: "8,000" },
      { label: "Platform uptime", value: "99.97%" },
    ],
    tags: ["Healthtech", "Mobile", "HIPAA", "React Native"],
    duration: "14 weeks",
    team: "6 engineers, 1 designer, 1 PM",
  },
];

export function getCaseStudyBySlug(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
