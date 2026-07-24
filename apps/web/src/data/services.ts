export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  summary: string;
  description: string;
  heroStat: { label: string; value: string };
  highlights: string[];
  deliverables: string[];
  idealFor: string[];
  techStack: string[];
  engagementModels: string[];
  faqs: ServiceFaq[];
}

export const services: Service[] = [
  {
    slug: "web-development",
    name: "Web Development",
    tagline: "Fast, resilient web platforms built to scale",
    icon: "Code2",
    summary:
      "Custom web applications and marketing sites engineered with modern frameworks, clean architecture, and performance baked in from day one.",
    description:
      "We design and build web platforms that hold up under real traffic — from content-driven marketing sites to complex, data-intensive dashboards. Our engineers work in React, Next.js, and Node.js daily, pairing rigorous architecture with pixel-accurate implementation so your product feels as good as it performs.",
    heroStat: { label: "Avg. Lighthouse score", value: "96+" },
    highlights: [
      "Server-rendered React & Next.js applications with edge-ready performance",
      "Design systems and component libraries your team can extend",
      "Headless CMS integrations (Sanity, Contentful, Payload)",
      "API design, authentication, and third-party integrations",
      "Core Web Vitals and accessibility (WCAG 2.1 AA) compliance",
    ],
    deliverables: [
      "Technical architecture document",
      "Component-driven design system",
      "Production-ready codebase with CI/CD",
      "Automated test suite (unit, integration, e2e)",
      "Performance and accessibility audit report",
    ],
    idealFor: [
      "Startups shipping their first production web app",
      "Enterprises modernizing legacy web platforms",
      "Marketing teams needing high-conversion sites",
    ],
    techStack: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "GraphQL", "PostgreSQL"],
    engagementModels: ["Fixed-scope project", "Dedicated squad", "Staff augmentation"],
    faqs: [
      {
        question: "How long does a typical web build take?",
        answer:
          "A marketing site with a CMS typically ships in 4-6 weeks. Full product builds with custom backends run 10-16 weeks depending on scope. We always start with a scoping sprint to give you a firm timeline before work begins.",
      },
      {
        question: "Do you work with our existing design team?",
        answer:
          "Yes. We regularly plug into existing design workflows in Figma, or we can design end-to-end with our in-house product designers if you don't have one.",
      },
      {
        question: "Can you take over an existing codebase?",
        answer:
          "Absolutely. We start every takeover engagement with a codebase audit covering architecture, dependencies, test coverage, and security before writing a single line of new code.",
      },
    ],
  },
  {
    slug: "mobile-app-development",
    name: "Mobile App Development",
    tagline: "Native-quality apps for iOS and Android",
    icon: "Smartphone",
    summary:
      "Cross-platform and native mobile apps with smooth animations, offline support, and app-store-ready polish.",
    description:
      "We build mobile applications that feel native because they're engineered that way — deep platform integrations, buttery animations, and careful attention to battery and network usage. Whether you need a single React Native codebase or fully native Swift/Kotlin apps, we match the stack to your product's ambitions.",
    heroStat: { label: "Apps shipped to app stores", value: "60+" },
    highlights: [
      "React Native and Flutter apps sharing a single codebase across platforms",
      "Native iOS (Swift) and Android (Kotlin) development for performance-critical apps",
      "Offline-first data sync and background processing",
      "Push notifications, deep linking, and in-app purchases",
      "App Store and Play Store submission and release management",
    ],
    deliverables: [
      "Interactive prototype and clickable flows",
      "Cross-platform or native codebase with CI/CD pipelines",
      "Device and OS compatibility test matrix",
      "App store listing assets and submission support",
      "Crash reporting and analytics instrumentation",
    ],
    idealFor: [
      "Consumer apps needing rapid cross-platform delivery",
      "Fintech and healthtech apps requiring native performance",
      "Existing products expanding from web to mobile",
    ],
    techStack: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "GraphQL", "Expo"],
    engagementModels: ["Fixed-scope project", "Dedicated squad", "MVP sprint"],
    faqs: [
      {
        question: "React Native or native — how do you decide?",
        answer:
          "We look at your performance requirements, team longevity plans, and platform-specific feature needs. Most consumer apps ship faster and cheaper with React Native or Flutter; apps with heavy graphics, AR, or hardware access often warrant native.",
      },
      {
        question: "Do you handle App Store and Play Store submissions?",
        answer:
          "Yes, submission, review-note handling, and release management are part of every mobile engagement.",
      },
    ],
  },
  {
    slug: "ecommerce",
    name: "eCommerce Development",
    tagline: "Storefronts engineered to convert and scale",
    icon: "ShoppingCart",
    summary:
      "Headless and platform-based storefronts on Shopify, custom Next.js commerce, and B2B marketplaces built for peak-season load.",
    description:
      "Commerce is unforgiving — a slow checkout costs revenue every hour it's live. We build storefronts on Shopify Plus, headless commerce stacks, and custom marketplace platforms with checkout flows, inventory sync, and payment infrastructure tested under real load before launch day.",
    heroStat: { label: "GMV supported across clients", value: "$120M+" },
    highlights: [
      "Headless commerce with Shopify, Medusa, or custom Next.js storefronts",
      "Payment gateway integration (Stripe, Razorpay, PayPal, Adyen)",
      "Inventory, fulfillment, and ERP/ CRM synchronization",
      "Subscription billing and multi-currency support",
      "Peak-load testing for sales events and flash drops",
    ],
    deliverables: [
      "Storefront and checkout UX design",
      "Payment and fulfillment integration layer",
      "Admin tooling for merchandising teams",
      "Load and performance testing report",
      "Post-launch monitoring dashboards",
    ],
    idealFor: [
      "DTC brands outgrowing template themes",
      "B2B companies launching self-serve ordering",
      "Marketplaces connecting multiple sellers and buyers",
    ],
    techStack: ["Shopify Plus", "Next.js", "Medusa", "Stripe", "Algolia", "Contentful"],
    engagementModels: ["Fixed-scope project", "Dedicated squad", "Ongoing retainer"],
    faqs: [
      {
        question: "Can you migrate us off our current platform without downtime?",
        answer:
          "Yes. We run parallel environments, migrate catalog and order data in stages, and cut over with a rollback plan so your store stays live throughout.",
      },
      {
        question: "Do you support headless commerce?",
        answer:
          "It's one of our specialties — we've shipped headless storefronts on Shopify's Storefront API, Medusa, and fully custom commerce backends.",
      },
    ],
  },
  {
    slug: "saas",
    name: "SaaS Product Development",
    tagline: "From first user to first thousand, engineered right",
    icon: "Layers",
    summary:
      "Multi-tenant SaaS platforms with billing, permissions, and analytics built in from the architecture up.",
    description:
      "We've built SaaS platforms across fintech, healthtech, and dev tools — which means we don't relearn multi-tenancy, RBAC, or metered billing on your dime. We bring proven patterns for tenant isolation, subscription billing, and usage-based pricing so you can focus on the features that differentiate your product.",
    heroStat: { label: "SaaS platforms launched", value: "35+" },
    highlights: [
      "Multi-tenant architecture with data isolation strategies",
      "Role-based access control and granular permissions",
      "Subscription billing with Stripe Billing or Chargebee",
      "Usage metering, analytics, and admin dashboards",
      "SOC 2-ready infrastructure and audit logging",
    ],
    deliverables: [
      "Product architecture and data model design",
      "Multi-tenant backend with billing integration",
      "Admin and customer-facing dashboards",
      "API and webhook documentation",
      "Scalability and security review",
    ],
    idealFor: [
      "Founders building their first SaaS MVP",
      "Scale-ups replatforming for enterprise customers",
      "Internal tools being productized for external sale",
    ],
    techStack: ["Next.js", "NestJS", "PostgreSQL", "Redis", "Stripe Billing", "AWS", "Docker"],
    engagementModels: ["MVP sprint", "Dedicated squad", "Long-term product partnership"],
    faqs: [
      {
        question: "Can you help us go from idea to MVP quickly?",
        answer:
          "Yes — our MVP sprint model gets a functioning, demoable product in front of users in 6-8 weeks, scoped tightly around your core value proposition.",
      },
      {
        question: "Do you help with enterprise readiness (SSO, SOC 2, audit logs)?",
        answer:
          "We regularly prepare SaaS products for enterprise sales cycles, including SSO/SAML, audit logging, role hierarchies, and SOC 2 control implementation.",
      },
    ],
  },
  {
    slug: "crm",
    name: "CRM Development",
    tagline: "Custom CRMs that match how your team actually sells",
    icon: "Contact",
    summary:
      "Purpose-built CRM systems and Salesforce/HubSpot customizations that fit your sales motion instead of forcing you into someone else's.",
    description:
      "Off-the-shelf CRMs force compromises once your pipeline gets complex. We build custom CRM platforms — or deeply customize Salesforce and HubSpot — so lead routing, pipeline stages, and reporting match exactly how your revenue team operates.",
    heroStat: { label: "Sales workflows automated", value: "200+" },
    highlights: [
      "Custom pipeline, lead scoring, and territory management",
      "Salesforce and HubSpot custom object and workflow development",
      "Email, calendar, and telephony integrations",
      "Automated reporting and revenue forecasting dashboards",
      "Data migration from legacy CRMs with zero record loss",
    ],
    deliverables: [
      "Sales process mapping and system design",
      "Custom CRM or CRM platform customization",
      "Third-party integration layer (email, telephony, marketing)",
      "Migration and data cleansing plan",
      "Team onboarding and training materials",
    ],
    idealFor: [
      "Sales teams with pipelines too complex for templates",
      "Companies consolidating multiple tools into one system",
      "Organizations migrating from spreadsheets to a real CRM",
    ],
    techStack: ["Salesforce", "HubSpot API", "Next.js", "NestJS", "PostgreSQL", "Twilio"],
    engagementModels: ["Fixed-scope project", "Ongoing retainer"],
    faqs: [
      {
        question: "Should we build custom or customize Salesforce/HubSpot?",
        answer:
          "If your existing platform covers 70%+ of your needs, customization is faster and cheaper. We recommend custom builds when workflows are highly specialized or licensing costs at scale outweigh build costs.",
      },
      {
        question: "How do you handle data migration?",
        answer:
          "Every migration starts with a data audit and de-duplication pass, followed by a staged migration with validation checkpoints before cutover.",
      },
    ],
  },
  {
    slug: "erp",
    name: "ERP Development",
    tagline: "Operational systems that connect every department",
    icon: "Boxes",
    summary:
      "Custom ERP modules and integrations spanning inventory, finance, HR, and procurement — built around your operating model.",
    description:
      "Generic ERP suites often mean months of configuration and workarounds. We build custom ERP modules and integrate best-of-breed systems (finance, inventory, HR, procurement) into one connected operating layer tailored to how your business actually runs.",
    heroStat: { label: "Business processes digitized", value: "300+" },
    highlights: [
      "Inventory, procurement, and supply chain modules",
      "Finance and accounting system integrations",
      "HRMS and payroll workflow automation",
      "Custom reporting and executive dashboards",
      "Integration with existing ERPs (SAP, Oracle, Odoo, NetSuite)",
    ],
    deliverables: [
      "Business process audit and system blueprint",
      "Modular ERP architecture with role-based access",
      "Integration layer connecting existing systems",
      "Data migration and reconciliation",
      "Admin training and rollout support",
    ],
    idealFor: [
      "Manufacturing and logistics companies scaling operations",
      "Enterprises consolidating disconnected departmental tools",
      "Organizations outgrowing spreadsheet-based operations",
    ],
    techStack: ["NestJS", "PostgreSQL", "Odoo", "SAP integration", "REST/SOAP APIs", "AWS"],
    engagementModels: ["Fixed-scope project", "Dedicated squad", "Long-term retainer"],
    faqs: [
      {
        question: "Can you integrate with our existing SAP or Oracle system?",
        answer:
          "Yes, we regularly build integration layers against SAP, Oracle, and NetSuite APIs to connect legacy ERP data with modern custom modules.",
      },
      {
        question: "How disruptive is an ERP rollout to daily operations?",
        answer:
          "We phase rollouts by department and run parallel systems during transition windows, minimizing disruption and giving teams time to adjust.",
      },
    ],
  },
  {
    slug: "ai-development",
    name: "AI Development",
    tagline: "Applied AI that ships, not just experiments",
    icon: "Sparkles",
    summary:
      "LLM-powered products, RAG pipelines, and custom ML models integrated into real products with evaluation and guardrails in place.",
    description:
      "We build AI features that survive contact with real users — retrieval-augmented generation pipelines, fine-tuned models, agentic workflows, and classic ML, all shipped with evaluation harnesses, cost controls, and guardrails so AI output stays reliable in production.",
    heroStat: { label: "AI features shipped to production", value: "45+" },
    highlights: [
      "RAG pipelines with vector search (Pinecone, Weaviate, pgvector)",
      "LLM integration (OpenAI, Anthropic, open-source models) with prompt evaluation",
      "Fine-tuning and model customization for domain-specific tasks",
      "Agentic workflows and tool-use orchestration",
      "AI observability, cost monitoring, and safety guardrails",
    ],
    deliverables: [
      "AI feasibility assessment and architecture design",
      "Production RAG or model pipeline with evaluation suite",
      "Prompt and cost monitoring dashboards",
      "Guardrail and safety review",
      "Documentation for ongoing model maintenance",
    ],
    idealFor: [
      "Products adding AI copilots or assistants",
      "Teams needing internal knowledge-base search",
      "Companies automating document or data-heavy workflows",
    ],
    techStack: ["OpenAI", "Anthropic", "LangChain", "pgvector", "Pinecone", "Python", "FastAPI"],
    engagementModels: ["Discovery sprint", "Dedicated squad", "Fixed-scope project"],
    faqs: [
      {
        question: "How do you keep LLM output reliable and safe?",
        answer:
          "We build evaluation suites before shipping any AI feature, monitor output quality in production, and layer in guardrails, content filters, and human-in-the-loop review where the risk profile demands it.",
      },
      {
        question: "Can you work with our existing data and infrastructure?",
        answer:
          "Yes — we typically start with a data and infrastructure audit to design a RAG or fine-tuning approach that fits your existing stack and compliance requirements.",
      },
    ],
  },
  {
    slug: "cloud",
    name: "Cloud Consulting",
    tagline: "Infrastructure that scales without surprises",
    icon: "Cloud",
    summary:
      "Cloud architecture, migration, and cost optimization across AWS, GCP, and Azure with security and reliability as first-class requirements.",
    description:
      "We design cloud infrastructure that scales predictably and fails gracefully. From greenfield architecture to migrating monoliths off aging data centers, we bring infrastructure-as-code discipline, cost governance, and security best practices to every engagement.",
    heroStat: { label: "Cloud spend optimized", value: "$8M+" },
    highlights: [
      "Cloud architecture design across AWS, GCP, and Azure",
      "Infrastructure as code with Terraform and Pulumi",
      "Legacy-to-cloud and cloud-to-cloud migrations",
      "Cost optimization and reserved capacity planning",
      "Disaster recovery and multi-region reliability design",
    ],
    deliverables: [
      "Cloud architecture diagrams and decision records",
      "Infrastructure-as-code repository",
      "Migration runbook with rollback plans",
      "Cost optimization report",
      "Monitoring, alerting, and incident response setup",
    ],
    idealFor: [
      "Companies migrating from on-prem or legacy hosting",
      "Scale-ups facing runaway cloud costs",
      "Regulated industries needing compliant infrastructure",
    ],
    techStack: ["AWS", "GCP", "Azure", "Terraform", "Kubernetes", "Pulumi", "Datadog"],
    engagementModels: ["Architecture assessment", "Migration project", "Ongoing retainer"],
    faqs: [
      {
        question: "Which cloud provider do you recommend?",
        answer:
          "It depends on your existing tooling, compliance needs, and team familiarity. We run vendor-neutral assessments and recommend the provider — or multi-cloud approach — that fits your constraints best.",
      },
      {
        question: "Can you reduce our current cloud bill?",
        answer:
          "Cost optimization engagements typically start with a spend audit that identifies over-provisioned resources, missing reserved capacity, and architectural inefficiencies — most clients see 20-40% savings.",
      },
    ],
  },
  {
    slug: "devops",
    name: "DevOps & Platform Engineering",
    tagline: "Ship faster with infrastructure your team trusts",
    icon: "GitBranch",
    summary:
      "CI/CD pipelines, container orchestration, and observability platforms that turn deployments into a non-event.",
    description:
      "Deployment day shouldn't be stressful. We build CI/CD pipelines, container orchestration, and observability stacks that let your engineering team ship multiple times a day with confidence, backed by automated testing gates and rollback strategies.",
    heroStat: { label: "Deploy frequency increase", value: "10x avg." },
    highlights: [
      "CI/CD pipeline design (GitHub Actions, GitLab CI, CircleCI)",
      "Container orchestration with Kubernetes and ECS",
      "Observability stacks (Datadog, Grafana, OpenTelemetry)",
      "Infrastructure automation and self-service environments",
      "Incident response processes and on-call tooling",
    ],
    deliverables: [
      "CI/CD pipeline implementation",
      "Container orchestration setup with autoscaling",
      "Observability dashboards and alerting rules",
      "Runbooks and incident response documentation",
      "Team enablement workshops",
    ],
    idealFor: [
      "Engineering teams stuck on manual deployments",
      "Companies scaling infrastructure ahead of growth",
      "Teams needing better visibility into production systems",
    ],
    techStack: ["Kubernetes", "Docker", "GitHub Actions", "Terraform", "Grafana", "Prometheus"],
    engagementModels: ["Platform audit", "Dedicated squad", "Ongoing retainer"],
    faqs: [
      {
        question: "How quickly can you improve our deployment process?",
        answer:
          "Most teams see meaningful improvements — automated pipelines, reduced deploy time — within the first 2-3 weeks of engagement, with deeper platform work continuing over subsequent sprints.",
      },
      {
        question: "Do you offer ongoing platform support after setup?",
        answer:
          "Yes, many clients move to an ongoing retainer for platform maintenance, on-call support, and continued optimization after the initial build-out.",
      },
    ],
  },
  {
    slug: "ui-ux",
    name: "UI/UX Design",
    tagline: "Interfaces engineered to be understood instantly",
    icon: "PenTool",
    summary:
      "Research-driven product design — from wireframes to polished, developer-ready design systems — that make complex products feel simple.",
    description:
      "Good design disappears into the experience. Our design team combines user research, information architecture, and visual craft to produce interfaces that feel obvious to use, backed by design systems that keep your product consistent as it grows.",
    heroStat: { label: "Products designed end-to-end", value: "90+" },
    highlights: [
      "User research, journey mapping, and usability testing",
      "Wireframing, prototyping, and interaction design",
      "Design systems built for engineering handoff",
      "Accessibility-first visual and interaction design",
      "Brand identity and design language development",
    ],
    deliverables: [
      "User research synthesis and personas",
      "Wireframes and high-fidelity prototypes",
      "Component-based design system in Figma",
      "Developer handoff documentation",
      "Usability testing report",
    ],
    idealFor: [
      "Products with confusing or dated interfaces",
      "Teams needing a scalable design system",
      "Startups establishing a design language pre-launch",
    ],
    techStack: ["Figma", "Framer", "Storybook", "Maze", "Adobe Creative Suite"],
    engagementModels: ["Design sprint", "Dedicated squad", "Ongoing retainer"],
    faqs: [
      {
        question: "Do you design and build, or just design?",
        answer:
          "Both. We can design in isolation and hand off to your engineers, or run fully integrated design + development squads for a seamless build.",
      },
      {
        question: "How do you validate designs before development?",
        answer:
          "We run usability testing on interactive prototypes with real users before a single line of production code is written, catching issues while they're still cheap to fix.",
      },
    ],
  },
  {
    slug: "maintenance",
    name: "Application Maintenance & Support",
    tagline: "Keep critical systems healthy, secure, and current",
    icon: "Wrench",
    summary:
      "Ongoing maintenance, monitoring, and enhancement for production applications — bug fixes, dependency upgrades, and 24/7 support.",
    description:
      "Shipping is the beginning, not the end. Our maintenance teams keep production applications healthy through proactive monitoring, security patching, dependency upgrades, and rapid incident response, so your core team can stay focused on new features.",
    heroStat: { label: "Uptime maintained across clients", value: "99.95%" },
    highlights: [
      "Proactive monitoring and performance tuning",
      "Security patching and dependency upgrades",
      "Bug triage and rapid-response fixes",
      "Feature enhancements and technical debt reduction",
      "24/7 on-call support with defined SLAs",
    ],
    deliverables: [
      "Application health audit",
      "Monitoring and alerting setup",
      "Monthly maintenance and enhancement reports",
      "SLA-backed incident response",
      "Quarterly technical debt roadmap",
    ],
    idealFor: [
      "Products without dedicated in-house maintenance capacity",
      "Legacy systems needing stabilization",
      "Teams wanting predictable support costs",
    ],
    techStack: ["Datadog", "Sentry", "PagerDuty", "GitHub Actions", "AWS", "Docker"],
    engagementModels: ["Monthly retainer", "SLA-based support contract"],
    faqs: [
      {
        question: "What response times can we expect?",
        answer:
          "SLAs are tailored to your risk tolerance — most clients choose between 1-hour critical response with 24/7 on-call, or next-business-day response for lower-severity issues.",
      },
      {
        question: "Can you take over support for an app you didn't build?",
        answer:
          "Yes, every takeover starts with a two-week audit to map the codebase, infrastructure, and known issues before we take on support responsibility.",
      },
    ],
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    tagline: "Growth engineering for products that need an audience",
    icon: "Megaphone",
    summary:
      "SEO, performance marketing, and content strategy built by people who also ship the product — so marketing and engineering stay aligned.",
    description:
      "We approach marketing like engineers: measurable, iterative, and tightly integrated with the product itself. From technical SEO to paid acquisition and content programs, our growth team works alongside your product engineers to close the loop between marketing and product data.",
    heroStat: { label: "Avg. organic traffic growth", value: "3.4x" },
    highlights: [
      "Technical SEO audits and implementation",
      "Paid acquisition strategy across Google, Meta, and LinkedIn",
      "Content strategy and editorial production",
      "Marketing analytics and attribution modeling",
      "Conversion rate optimization and landing page testing",
    ],
    deliverables: [
      "Technical SEO audit and fix roadmap",
      "Paid campaign structure and creative testing plan",
      "Content calendar and editorial guidelines",
      "Analytics and attribution dashboard",
      "Monthly performance reporting",
    ],
    idealFor: [
      "Products with strong retention but weak top-of-funnel",
      "Teams needing SEO integrated with engineering",
      "Companies scaling paid acquisition efficiently",
    ],
    techStack: ["Google Analytics 4", "Search Console", "HubSpot", "Meta Ads", "Segment"],
    engagementModels: ["Monthly retainer", "Growth sprint"],
    faqs: [
      {
        question: "Do you write content or just strategize?",
        answer:
          "Both — our editorial team produces content in-house, backed by SEO research and distribution strategy, so strategy and execution stay tightly connected.",
      },
      {
        question: "How is this different from a typical marketing agency?",
        answer:
          "We have engineers on staff, which means technical SEO fixes, tracking implementation, and landing page experiments ship fast without waiting on a separate dev team.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
