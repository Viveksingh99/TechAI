export interface PortfolioItem {
  slug: string;
  name: string;
  category: string;
  summary: string;
  tags: string[];
  year: string;
  color: string;
}

export const portfolioItems: PortfolioItem[] = [
  {
    slug: "ledgerflow",
    name: "LedgerFlow",
    category: "Fintech · SaaS",
    summary:
      "A multi-tenant expense management platform processing thousands of reconciliations daily for mid-market finance teams.",
    tags: ["Next.js", "NestJS", "PostgreSQL", "Stripe"],
    year: "2025",
    color: "from-emerald-500/30 to-cyan-500/20",
  },
  {
    slug: "carewell-connect",
    name: "Carewell Connect",
    category: "Healthtech · Mobile",
    summary:
      "A HIPAA-compliant telehealth app connecting patients with care teams via video, messaging, and care plan tracking.",
    tags: ["React Native", "Node.js", "WebRTC", "AWS"],
    year: "2025",
    color: "from-sky-500/30 to-emerald-500/20",
  },
  {
    slug: "orbital-commerce",
    name: "Orbital Commerce",
    category: "eCommerce · Headless",
    summary:
      "A headless commerce storefront supporting 40+ regional storefronts from a single Next.js and Shopify backend.",
    tags: ["Next.js", "Shopify", "Algolia", "Vercel"],
    year: "2024",
    color: "from-teal-500/30 to-slate-500/20",
  },
  {
    slug: "fleetsight",
    name: "FleetSight",
    category: "Logistics · IoT Dashboard",
    summary:
      "A real-time fleet monitoring dashboard visualizing telemetry from 12,000+ connected vehicles across three continents.",
    tags: ["React", "GraphQL", "TimescaleDB", "AWS IoT"],
    year: "2024",
    color: "from-emerald-500/30 to-indigo-500/20",
  },
  {
    slug: "docuwise-ai",
    name: "DocuWise AI",
    category: "AI · Document Intelligence",
    summary:
      "An AI-powered contract analysis tool that cuts legal review time by 65% using a custom RAG pipeline over case law.",
    tags: ["Python", "LangChain", "pgvector", "OpenAI"],
    year: "2025",
    color: "from-cyan-500/30 to-emerald-500/20",
  },
  {
    slug: "propelhr",
    name: "PropelHR",
    category: "HR Tech · SaaS",
    summary:
      "An HRMS platform automating onboarding, payroll sync, and performance reviews for distributed teams across 15 countries.",
    tags: ["Next.js", "NestJS", "PostgreSQL", "Temporal"],
    year: "2024",
    color: "from-slate-500/30 to-emerald-500/20",
  },
  {
    slug: "buildledger-erp",
    name: "BuildLedger ERP",
    category: "Construction · ERP",
    summary:
      "A custom ERP connecting procurement, project costing, and subcontractor management for a national construction firm.",
    tags: ["React", "NestJS", "PostgreSQL", "Odoo"],
    year: "2023",
    color: "from-emerald-500/30 to-teal-500/20",
  },
  {
    slug: "marketpulse",
    name: "MarketPulse",
    category: "Fintech · Analytics",
    summary:
      "A real-time market analytics platform streaming and visualizing millions of price ticks per second for retail traders.",
    tags: ["React", "Go", "Kafka", "ClickHouse"],
    year: "2023",
    color: "from-indigo-500/30 to-emerald-500/20",
  },
  {
    slug: "greenroute",
    name: "GreenRoute",
    category: "Climate Tech · Mobile",
    summary:
      "A carbon footprint tracking app for enterprise fleets, combining route optimization with emissions reporting.",
    tags: ["Flutter", "Node.js", "MongoDB", "GCP"],
    year: "2024",
    color: "from-emerald-500/30 to-lime-500/20",
  },
];
