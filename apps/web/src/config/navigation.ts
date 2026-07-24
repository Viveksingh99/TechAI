import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FolderKanban,
  CreditCard,
  Settings,
  ScrollText,
  BarChart3,
  KeyRound,
  Briefcase,
  FileText,
  FileSignature,
  Wallet,
  Milestone,
  LifeBuoy,
  MessageSquare,
  FolderOpen,
  CalendarDays,
  Star,
  Bell,
  Clock,
  CalendarCheck,
  ListTodo,
  Video,
  Banknote,
  TrendingUp,
  User,
  Target,
  GitBranch,
  Building2,
  Contact2,
  PhoneCall,
  ClipboardList,
  UserPlus,
  Receipt,
  ReceiptText,
  PiggyBank,
  RefreshCcw,
  Percent,
  Newspaper,
  Image as ImageIcon,
  FileStack,
  Search,
  Sparkles,
  PartyPopper,
  ClipboardCheck,
  Bug,
} from "lucide-react";
import type { UserRole } from "@/lib/auth-store";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export type PanelKey =
  | "admin"
  | "client"
  | "employee"
  | "crm"
  | "pm"
  | "hr"
  | "finance"
  | "cms"
  | "ai";

export interface PanelConfig {
  key: PanelKey;
  label: string;
  basePath: string;
  items: NavItem[];
}

export const PANEL_NAV: Record<PanelKey, PanelConfig> = {
  admin: {
    key: "admin",
    label: "Admin",
    basePath: "/admin",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "API Keys", href: "/admin/api-keys", icon: KeyRound },
      { label: "Audit Logs", href: "/admin/logs", icon: ScrollText },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  client: {
    key: "client",
    label: "Client Portal",
    basePath: "/client",
    items: [
      { label: "Overview", href: "/client", icon: LayoutDashboard, exact: true },
      { label: "Projects", href: "/client/projects", icon: Briefcase },
      { label: "Milestones", href: "/client/milestones", icon: Milestone },
      { label: "Invoices", href: "/client/invoices", icon: FileText },
      { label: "Contracts", href: "/client/contracts", icon: FileSignature },
      { label: "Payments", href: "/client/payments", icon: Wallet },
      { label: "Support Tickets", href: "/client/tickets", icon: LifeBuoy },
      { label: "Messages", href: "/client/messages", icon: MessageSquare },
      { label: "Documents", href: "/client/documents", icon: FolderOpen },
      { label: "Meetings", href: "/client/meetings", icon: CalendarDays },
      { label: "Feedback", href: "/client/feedback", icon: Star },
      { label: "Notifications", href: "/client/notifications", icon: Bell },
    ],
  },
  employee: {
    key: "employee",
    label: "My Workspace",
    basePath: "/employee",
    items: [
      { label: "Overview", href: "/employee", icon: LayoutDashboard, exact: true },
      { label: "Attendance", href: "/employee/attendance", icon: Clock },
      { label: "Leave", href: "/employee/leave", icon: CalendarCheck },
      { label: "Tasks", href: "/employee/tasks", icon: ListTodo },
      { label: "Projects", href: "/employee/projects", icon: FolderKanban },
      { label: "Calendar", href: "/employee/calendar", icon: CalendarDays },
      { label: "Meetings", href: "/employee/meetings", icon: Video },
      { label: "Salary", href: "/employee/salary", icon: Banknote },
      { label: "Performance", href: "/employee/performance", icon: TrendingUp },
      { label: "Messages", href: "/employee/messages", icon: MessageSquare },
      { label: "Notifications", href: "/employee/notifications", icon: Bell },
      { label: "Profile", href: "/employee/profile", icon: User },
    ],
  },
  crm: {
    key: "crm",
    label: "Sales CRM",
    basePath: "/crm",
    items: [
      { label: "Overview", href: "/crm", icon: LayoutDashboard, exact: true },
      { label: "Leads", href: "/crm/leads", icon: Target },
      { label: "Pipeline", href: "/crm/pipeline", icon: GitBranch },
      { label: "Deals", href: "/crm/deals", icon: Briefcase },
      { label: "Contacts", href: "/crm/contacts", icon: Contact2 },
      { label: "Companies", href: "/crm/companies", icon: Building2 },
      { label: "Follow-ups", href: "/crm/follow-ups", icon: PhoneCall },
    ],
  },
  pm: {
    key: "pm",
    label: "Project Management",
    basePath: "/pm",
    items: [
      { label: "Overview", href: "/pm", icon: LayoutDashboard, exact: true },
      { label: "Projects", href: "/pm/projects", icon: FolderKanban },
      { label: "Tasks", href: "/pm/tasks", icon: ClipboardList },
    ],
  },
  hr: {
    key: "hr",
    label: "Human Resources",
    basePath: "/hr",
    items: [
      { label: "Overview", href: "/hr", icon: LayoutDashboard, exact: true },
      { label: "Employees", href: "/hr/employees", icon: Users },
      { label: "Recruitment", href: "/hr/recruitment", icon: UserPlus },
      { label: "Payroll", href: "/hr/payroll", icon: Banknote },
      { label: "Attendance", href: "/hr/attendance", icon: Clock },
      { label: "Leave", href: "/hr/leave", icon: CalendarCheck },
      { label: "Holidays", href: "/hr/holidays", icon: PartyPopper },
      { label: "Reviews", href: "/hr/reviews", icon: ClipboardCheck },
    ],
  },
  finance: {
    key: "finance",
    label: "Finance",
    basePath: "/finance",
    items: [
      { label: "Overview", href: "/finance", icon: LayoutDashboard, exact: true },
      { label: "Invoices", href: "/finance/invoices", icon: Receipt },
      { label: "Quotations", href: "/finance/quotations", icon: ReceiptText },
      { label: "Expenses", href: "/finance/expenses", icon: PiggyBank },
      { label: "Subscriptions", href: "/finance/subscriptions", icon: RefreshCcw },
      { label: "Taxes", href: "/finance/taxes", icon: Percent },
    ],
  },
  cms: {
    key: "cms",
    label: "CMS",
    basePath: "/cms",
    items: [
      { label: "Overview", href: "/cms", icon: LayoutDashboard, exact: true },
      { label: "Blog", href: "/cms/blog", icon: Newspaper },
      { label: "Media Library", href: "/cms/media", icon: ImageIcon },
      { label: "Pages", href: "/cms/pages", icon: FileStack },
      { label: "SEO", href: "/cms/seo", icon: Search },
    ],
  },
  ai: {
    key: "ai",
    label: "AI Tools",
    basePath: "/ai",
    items: [{ label: "AI Tools Hub", href: "/ai", icon: Sparkles, exact: true }],
  },
};

export const ROLE_WORKSPACES: Record<UserRole, PanelKey[]> = {
  SUPER_ADMIN: ["admin", "crm", "pm", "hr", "finance", "cms", "employee", "client", "ai"],
  ADMIN: ["admin", "crm", "pm", "hr", "finance", "cms", "employee", "client", "ai"],
  SALES: ["crm", "ai"],
  HR: ["hr", "ai"],
  PROJECT_MANAGER: ["pm", "employee", "ai"],
  DEVELOPER: ["employee", "ai"],
  DESIGNER: ["employee", "ai"],
  QA: ["employee", "ai"],
  CLIENT: ["client"],
};

export function getRoleHome(role: UserRole | undefined | null): string {
  if (!role) return "/login";
  const workspaces = ROLE_WORKSPACES[role];
  const first = workspaces?.[0];
  return first ? PANEL_NAV[first].basePath : "/login";
}

export function getPanelForPath(pathname: string): PanelConfig | null {
  const match = (Object.keys(PANEL_NAV) as PanelKey[]).find((key) =>
    pathname === PANEL_NAV[key].basePath || pathname.startsWith(`${PANEL_NAV[key].basePath}/`)
  );
  return match ? PANEL_NAV[match] : null;
}

export function getWorkspacesForRole(role: UserRole | undefined | null): PanelConfig[] {
  if (!role) return [];
  return (ROLE_WORKSPACES[role] ?? []).map((key) => PANEL_NAV[key]);
}

export const AI_TOOLS = [
  {
    slug: "proposal",
    title: "Proposal Generator",
    description: "Draft client-ready project proposals from a short brief.",
    icon: FileSignature,
  },
  {
    slug: "contract",
    title: "Contract Drafting",
    description: "Generate contract clauses and terms tailored to the engagement.",
    icon: FileText,
  },
  {
    slug: "meeting-notes",
    title: "Meeting Notes",
    description: "Turn raw meeting transcripts into structured notes & action items.",
    icon: Video,
  },
  {
    slug: "task-breakdown",
    title: "Task Breakdown",
    description: "Split a feature or epic into actionable engineering tasks.",
    icon: ListTodo,
  },
  {
    slug: "code-review",
    title: "Code Review Assistant",
    description: "Get an AI first-pass review on a diff or code snippet.",
    icon: Bug,
  },
  {
    slug: "ticket-summary",
    title: "Ticket Summarizer",
    description: "Summarize long support threads into a concise ticket digest.",
    icon: LifeBuoy,
  },
  {
    slug: "email-writer",
    title: "Email Writer",
    description: "Compose professional client or internal emails in seconds.",
    icon: MessageSquare,
  },
  {
    slug: "estimation",
    title: "Effort Estimation",
    description: "Estimate timelines and cost ranges for a scope of work.",
    icon: Percent,
  },
];
