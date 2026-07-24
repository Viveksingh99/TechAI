export interface TechCategory {
  category: string;
  description: string;
  items: { name: string; icon: string }[];
}

export const technologyCategories: TechCategory[] = [
  {
    category: "Frontend",
    description: "Interfaces that feel fast on every device.",
    items: [
      { name: "React", icon: "Atom" },
      { name: "Next.js", icon: "Triangle" },
      { name: "TypeScript", icon: "FileCode2" },
      { name: "Tailwind CSS", icon: "Wind" },
      { name: "Vue.js", icon: "Layers" },
      { name: "Framer Motion", icon: "Sparkles" },
    ],
  },
  {
    category: "Backend",
    description: "Reliable services built to handle real-world scale.",
    items: [
      { name: "Node.js", icon: "Server" },
      { name: "NestJS", icon: "Hexagon" },
      { name: "Python / Django", icon: "Terminal" },
      { name: "Go", icon: "Gauge" },
      { name: "GraphQL", icon: "Share2" },
      { name: "REST APIs", icon: "Cable" },
    ],
  },
  {
    category: "Mobile",
    description: "Cross-platform and native experiences that feel right at home.",
    items: [
      { name: "React Native", icon: "Smartphone" },
      { name: "Flutter", icon: "Zap" },
      { name: "Swift", icon: "Apple" },
      { name: "Kotlin", icon: "Bot" },
    ],
  },
  {
    category: "Data & AI",
    description: "Infrastructure for storing, modeling, and reasoning over data.",
    items: [
      { name: "PostgreSQL", icon: "Database" },
      { name: "MongoDB", icon: "Leaf" },
      { name: "Redis", icon: "Zap" },
      { name: "OpenAI", icon: "Sparkles" },
      { name: "LangChain", icon: "Link2" },
      { name: "pgvector", icon: "ScanSearch" },
    ],
  },
  {
    category: "Cloud & DevOps",
    description: "Infrastructure automation and reliability at every layer.",
    items: [
      { name: "AWS", icon: "Cloud" },
      { name: "Google Cloud", icon: "CloudCog" },
      { name: "Docker", icon: "Container" },
      { name: "Kubernetes", icon: "Ship" },
      { name: "Terraform", icon: "Blocks" },
      { name: "GitHub Actions", icon: "GitBranch" },
    ],
  },
  {
    category: "Commerce & CMS",
    description: "Flexible platforms for content and transactions.",
    items: [
      { name: "Shopify", icon: "ShoppingBag" },
      { name: "Stripe", icon: "CreditCard" },
      { name: "Contentful", icon: "FileText" },
      { name: "Sanity", icon: "PenLine" },
    ],
  },
];
