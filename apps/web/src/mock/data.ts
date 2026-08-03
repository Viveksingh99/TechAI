import type { UserRole } from "@/lib/auth-store";
import type {
  ApiUser,
  Project,
  Task,
  Bug,
  Sprint,
  TimeEntry,
  ProjectMember,
  ProjectActivity,
  PipelineStage,
  Lead,
  Deal,
  Contact,
  Company,
  FollowUp,
  Employee,
  Attendance,
  Leave,
  Holiday,
  PerformanceReview,
  JobPosting,
  JobApplication,
  SalarySlip,
  Invoice,
  Quotation,
  Expense,
  Subscription,
  Contract,
  Ticket,
  Meeting,
  BlogPost,
  Media,
  CmsPage,
  CmsCategory,
  ApiKey,
  AuditLog,
  Notification,
  Message,
  Milestone,
  ProjectDocument,
  Permission,
} from "@/types";

const now = new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

/** Demo accounts — password is anything ≥ 6 chars in mock mode */
export const MOCK_ACCOUNTS: Array<{
  email: string;
  password: string;
  user: ApiUser;
}> = [
  {
    email: "admin@techai.com",
    password: "Admin@12345",
    user: {
      id: "user_admin",
      email: "admin@techai.com",
      firstName: "Ava",
      lastName: "Sharma",
      phone: "+91 98765 00001",
      avatar: null,
      role: "SUPER_ADMIN",
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: now,
      createdAt: daysAgo(120),
    },
  },
  {
    email: "sales@techai.com",
    password: "Sales@12345",
    user: {
      id: "user_sales",
      email: "sales@techai.com",
      firstName: "Rohan",
      lastName: "Mehta",
      role: "SALES",
      isActive: true,
      createdAt: daysAgo(90),
    },
  },
  {
    email: "hr@techai.com",
    password: "Hr@12345",
    user: {
      id: "user_hr",
      email: "hr@techai.com",
      firstName: "Neha",
      lastName: "Kapoor",
      role: "HR",
      isActive: true,
      createdAt: daysAgo(80),
    },
  },
  {
    email: "pm@techai.com",
    password: "Manager@12345",
    user: {
      id: "user_pm",
      email: "pm@techai.com",
      firstName: "Kabir",
      lastName: "Singh",
      role: "PROJECT_MANAGER",
      isActive: true,
      createdAt: daysAgo(70),
    },
  },
  {
    email: "developer@techai.com",
    password: "Developer@12345",
    user: {
      id: "user_dev",
      email: "developer@techai.com",
      firstName: "Ishaan",
      lastName: "Verma",
      role: "DEVELOPER",
      isActive: true,
      createdAt: daysAgo(60),
    },
  },
  {
    email: "client@techai.com",
    password: "Client@12345",
    user: {
      id: "user_client",
      email: "client@techai.com",
      firstName: "Priya",
      lastName: "Nair",
      role: "CLIENT",
      isActive: true,
      createdAt: daysAgo(40),
    },
  },
];

export const users: ApiUser[] = [
  ...MOCK_ACCOUNTS.map((a) => a.user),
  {
    id: "user_designer",
    email: "designer@techai.com",
    firstName: "Mira",
    lastName: "Das",
    role: "DESIGNER",
    isActive: true,
    createdAt: daysAgo(55),
  },
  {
    id: "user_qa",
    email: "qa@techai.com",
    firstName: "Arjun",
    lastName: "Patel",
    role: "QA",
    isActive: true,
    createdAt: daysAgo(50),
  },
];

export const permissions: Permission[] = [
  { id: "perm_1", name: "users.read", module: "users", action: "read" },
  { id: "perm_2", name: "users.write", module: "users", action: "write" },
  { id: "perm_3", name: "projects.read", module: "projects", action: "read" },
  { id: "perm_4", name: "projects.write", module: "projects", action: "write" },
  { id: "perm_5", name: "crm.read", module: "crm", action: "read" },
  { id: "perm_6", name: "crm.write", module: "crm", action: "write" },
  { id: "perm_7", name: "finance.read", module: "finance", action: "read" },
  { id: "perm_8", name: "hr.read", module: "hr", action: "read" },
];

export const projects: Project[] = [
  {
    id: "proj_1",
    name: "NovaPay Mobile Banking",
    slug: "novapay-mobile-banking",
    description: "Cross-platform banking app with biometric auth and real-time transfers.",
    clientId: "user_client",
    client: { id: "user_client", firstName: "Priya", lastName: "Nair" },
    managerId: "user_pm",
    manager: { id: "user_pm", firstName: "Kabir", lastName: "Singh" },
    status: "IN_PROGRESS",
    priority: "HIGH",
    startDate: daysAgo(45),
    endDate: daysFromNow(60),
    budget: 180000,
    progress: 62,
    createdAt: daysAgo(50),
    membersCount: 5,
  },
  {
    id: "proj_2",
    name: "Helix CRM Platform",
    slug: "helix-crm-platform",
    description: "Custom CRM with pipeline automation and WhatsApp integrations.",
    clientId: "user_client",
    client: { id: "user_client", firstName: "Priya", lastName: "Nair" },
    managerId: "user_pm",
    manager: { id: "user_pm", firstName: "Kabir", lastName: "Singh" },
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    startDate: daysAgo(30),
    endDate: daysFromNow(90),
    budget: 95000,
    progress: 38,
    createdAt: daysAgo(35),
    membersCount: 4,
  },
  {
    id: "proj_3",
    name: "Orbit Retail E-commerce",
    slug: "orbit-retail-ecommerce",
    description: "Headless commerce storefront with inventory sync.",
    status: "COMPLETED",
    priority: "MEDIUM",
    startDate: daysAgo(180),
    endDate: daysAgo(20),
    budget: 120000,
    progress: 100,
    createdAt: daysAgo(190),
    membersCount: 6,
  },
];

export const tasks: Task[] = [
  {
    id: "task_1",
    projectId: "proj_1",
    project: { id: "proj_1", name: "NovaPay Mobile Banking" },
    title: "Implement biometric login flow",
    description: "Face ID / fingerprint on iOS and Android.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeId: "user_dev",
    assignee: { id: "user_dev", firstName: "Ishaan", lastName: "Verma" },
    dueDate: daysFromNow(5),
    estimatedHours: 16,
    tags: ["mobile", "auth"],
    createdAt: daysAgo(10),
  },
  {
    id: "task_2",
    projectId: "proj_1",
    project: { id: "proj_1", name: "NovaPay Mobile Banking" },
    title: "Design transfer confirmation screens",
    status: "DONE",
    priority: "MEDIUM",
    assigneeId: "user_designer",
    assignee: { id: "user_designer", firstName: "Mira", lastName: "Das" },
    dueDate: daysAgo(2),
    estimatedHours: 8,
    createdAt: daysAgo(14),
  },
  {
    id: "task_3",
    projectId: "proj_1",
    project: { id: "proj_1", name: "NovaPay Mobile Banking" },
    title: "QA regression on payment module",
    status: "TODO",
    priority: "HIGH",
    assigneeId: "user_qa",
    assignee: { id: "user_qa", firstName: "Arjun", lastName: "Patel" },
    dueDate: daysFromNow(8),
    estimatedHours: 12,
    createdAt: daysAgo(3),
  },
  {
    id: "task_4",
    projectId: "proj_2",
    project: { id: "proj_2", name: "Helix CRM Platform" },
    title: "Build deal kanban board API",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeId: "user_dev",
    assignee: { id: "user_dev", firstName: "Ishaan", lastName: "Verma" },
    dueDate: daysFromNow(4),
    estimatedHours: 20,
    createdAt: daysAgo(7),
  },
  {
    id: "task_5",
    projectId: "proj_2",
    project: { id: "proj_2", name: "Helix CRM Platform" },
    title: "Wire lead capture forms",
    status: "REVIEW",
    priority: "MEDIUM",
    assigneeId: "user_dev",
    assignee: { id: "user_dev", firstName: "Ishaan", lastName: "Verma" },
    dueDate: daysFromNow(2),
    estimatedHours: 10,
    createdAt: daysAgo(5),
  },
];

export const bugs: Bug[] = [
  {
    id: "bug_1",
    projectId: "proj_1",
    title: "Transfer fails offline with blank error",
    description: "When network drops mid-transfer, UI shows empty toast.",
    severity: "HIGH",
    status: "OPEN",
    assignee: { id: "user_dev", firstName: "Ishaan", lastName: "Verma" },
    createdAt: daysAgo(2),
  },
  {
    id: "bug_2",
    projectId: "proj_1",
    title: "Dark mode contrast on statement PDF",
    severity: "LOW",
    status: "IN_PROGRESS",
    assignee: { id: "user_designer", firstName: "Mira", lastName: "Das" },
    createdAt: daysAgo(6),
  },
];

export const sprints: Sprint[] = [
  {
    id: "sprint_1",
    projectId: "proj_1",
    name: "Sprint 12 — Auth & Transfers",
    goal: "Ship biometric login and P2P transfers.",
    startDate: daysAgo(10),
    endDate: daysFromNow(4),
    status: "ACTIVE",
    createdAt: daysAgo(12),
  },
  {
    id: "sprint_2",
    projectId: "proj_2",
    name: "Sprint 4 — Pipeline UI",
    goal: "Kanban + stage automation.",
    startDate: daysAgo(7),
    endDate: daysFromNow(7),
    status: "ACTIVE",
    createdAt: daysAgo(8),
  },
];

export const timeEntries: TimeEntry[] = [
  {
    id: "time_1",
    projectId: "proj_1",
    taskId: "task_1",
    task: { id: "task_1", title: "Implement biometric login flow" },
    userId: "user_dev",
    user: { firstName: "Ishaan", lastName: "Verma" },
    description: "Native module integration",
    startTime: daysAgo(1),
    endTime: daysAgo(1),
    durationMinutes: 210,
    isBillable: true,
    createdAt: daysAgo(1),
  },
  {
    id: "time_2",
    projectId: "proj_2",
    taskId: "task_4",
    task: { id: "task_4", title: "Build deal kanban board API" },
    userId: "user_dev",
    user: { firstName: "Ishaan", lastName: "Verma" },
    startTime: daysAgo(0),
    durationMinutes: 90,
    isBillable: true,
    createdAt: now,
  },
];

export const projectMembers: ProjectMember[] = [
  {
    id: "pmem_1",
    userId: "user_pm",
    user: { id: "user_pm", firstName: "Kabir", lastName: "Singh", email: "pm@techai.com" },
    role: "MANAGER",
  },
  {
    id: "pmem_2",
    userId: "user_dev",
    user: { id: "user_dev", firstName: "Ishaan", lastName: "Verma", email: "developer@techai.com" },
    role: "DEVELOPER",
  },
  {
    id: "pmem_3",
    userId: "user_designer",
    user: { id: "user_designer", firstName: "Mira", lastName: "Das", email: "designer@techai.com" },
    role: "DESIGNER",
  },
  {
    id: "pmem_4",
    userId: "user_qa",
    user: { id: "user_qa", firstName: "Arjun", lastName: "Patel", email: "qa@techai.com" },
    role: "QA",
  },
];

export const projectActivity: ProjectActivity[] = [
  {
    id: "act_1",
    action: "TASK_UPDATED",
    entity: "Task",
    description: "Moved “Implement biometric login flow” to In Progress",
    user: { firstName: "Ishaan", lastName: "Verma" },
    createdAt: daysAgo(1),
  },
  {
    id: "act_2",
    action: "BUG_CREATED",
    entity: "Bug",
    description: "Reported “Transfer fails offline with blank error”",
    user: { firstName: "Arjun", lastName: "Patel" },
    createdAt: daysAgo(2),
  },
  {
    id: "act_3",
    action: "MILESTONE_COMPLETED",
    entity: "Milestone",
    description: "Completed “UX prototype sign-off”",
    user: { firstName: "Kabir", lastName: "Singh" },
    createdAt: daysAgo(8),
  },
];

export const milestones: Milestone[] = [
  {
    id: "ms_1",
    projectId: "proj_1",
    title: "UX prototype sign-off",
    description: "Approved high-fidelity flows",
    dueDate: daysAgo(10),
    isCompleted: true,
    order: 1,
  },
  {
    id: "ms_2",
    projectId: "proj_1",
    title: "Beta release",
    description: "Internal bank pilot",
    dueDate: daysFromNow(20),
    isCompleted: false,
    order: 2,
  },
  {
    id: "ms_3",
    projectId: "proj_2",
    title: "CRM MVP launch",
    dueDate: daysFromNow(45),
    isCompleted: false,
    order: 1,
  },
];

export const documents: ProjectDocument[] = [
  {
    id: "doc_1",
    name: "NovaPay SOW.pdf",
    fileUrl: "https://example.com/files/novapay-sow.pdf",
    fileType: "application/pdf",
    fileSize: 842000,
    createdAt: daysAgo(48),
  },
  {
    id: "doc_2",
    name: "Brand guidelines.fig",
    fileUrl: "https://example.com/files/brand.fig",
    fileType: "application/octet-stream",
    fileSize: 2400000,
    createdAt: daysAgo(40),
  },
  {
    id: "doc_3",
    name: "API architecture.png",
    fileUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    fileType: "image/png",
    fileSize: 320000,
    createdAt: daysAgo(20),
  },
];

export const pipelineStages: PipelineStage[] = [
  { id: "stage_1", name: "New", order: 1 },
  { id: "stage_2", name: "Qualified", order: 2 },
  { id: "stage_3", name: "Proposal", order: 3 },
  { id: "stage_4", name: "Negotiation", order: 4 },
  { id: "stage_5", name: "Won", order: 5 },
];

export const companies: Company[] = [
  {
    id: "co_1",
    name: "Nova Financial",
    website: "https://novafinancial.example",
    industry: "FinTech",
    size: "201-500",
    city: "Bengaluru",
    country: "India",
    createdAt: daysAgo(100),
  },
  {
    id: "co_2",
    name: "Helix Labs",
    website: "https://helixlabs.example",
    industry: "SaaS",
    size: "51-200",
    city: "Pune",
    country: "India",
    createdAt: daysAgo(70),
  },
  {
    id: "co_3",
    name: "Orbit Retail",
    website: "https://orbitretail.example",
    industry: "E-commerce",
    size: "11-50",
    city: "Mumbai",
    country: "India",
    createdAt: daysAgo(200),
  },
];

export const contacts: Contact[] = [
  {
    id: "ct_1",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya@novafinancial.example",
    phone: "+91 90000 11111",
    designation: "CTO",
    company: { id: "co_1", name: "Nova Financial" },
    createdAt: daysAgo(95),
  },
  {
    id: "ct_2",
    firstName: "Vikram",
    lastName: "Joshi",
    email: "vikram@helixlabs.example",
    phone: "+91 90000 22222",
    designation: "Head of Product",
    company: { id: "co_2", name: "Helix Labs" },
    createdAt: daysAgo(65),
  },
];

export const leads: Lead[] = [
  {
    id: "lead_1",
    title: "AI chatbot for support desk",
    company: { id: "co_2", name: "Helix Labs" },
    contact: { id: "ct_2", firstName: "Vikram", lastName: "Joshi" },
    email: "vikram@helixlabs.example",
    phone: "+91 90000 22222",
    source: "WEBSITE",
    status: "NEW",
    assignedTo: { id: "user_sales", firstName: "Rohan", lastName: "Mehta" },
    estimatedValue: 45000,
    createdAt: daysAgo(4),
  },
  {
    id: "lead_2",
    title: "Cloud migration discovery",
    company: { id: "co_3", name: "Orbit Retail" },
    source: "REFERRAL",
    status: "CONTACTED",
    assignedTo: { id: "user_sales", firstName: "Rohan", lastName: "Mehta" },
    estimatedValue: 78000,
    createdAt: daysAgo(12),
  },
  {
    id: "lead_3",
    title: "Mobile app redesign",
    email: "growth@startup.example",
    source: "LINKEDIN",
    status: "QUALIFIED",
    estimatedValue: 32000,
    createdAt: daysAgo(8),
  },
];

export const deals: Deal[] = [
  {
    id: "deal_1",
    title: "NovaPay Phase 2 — Cards",
    company: { id: "co_1", name: "Nova Financial" },
    stage: pipelineStages[2],
    stageId: "stage_3",
    value: 125000,
    currency: "USD",
    status: "OPEN",
    owner: { id: "user_sales", firstName: "Rohan", lastName: "Mehta" },
    expectedCloseDate: daysFromNow(25),
    createdAt: daysAgo(18),
  },
  {
    id: "deal_2",
    title: "Helix CRM Annual Retainer",
    company: { id: "co_2", name: "Helix Labs" },
    stage: pipelineStages[3],
    stageId: "stage_4",
    value: 60000,
    currency: "USD",
    status: "OPEN",
    owner: { id: "user_sales", firstName: "Rohan", lastName: "Mehta" },
    expectedCloseDate: daysFromNow(12),
    createdAt: daysAgo(22),
  },
  {
    id: "deal_3",
    title: "Orbit Storefront Expansion",
    company: { id: "co_3", name: "Orbit Retail" },
    stage: pipelineStages[1],
    stageId: "stage_2",
    value: 40000,
    currency: "USD",
    status: "OPEN",
    owner: { id: "user_sales", firstName: "Rohan", lastName: "Mehta" },
    expectedCloseDate: daysFromNow(40),
    createdAt: daysAgo(9),
  },
];

export const followUps: FollowUp[] = [
  {
    id: "fu_1",
    dueDate: daysFromNow(1),
    notes: "Send revised proposal with AI add-on pricing",
    status: "PENDING",
    lead: { id: "lead_1", title: "AI chatbot for support desk" },
    assignedTo: { id: "user_sales", firstName: "Rohan", lastName: "Mehta" },
    createdAt: daysAgo(1),
  },
  {
    id: "fu_2",
    dueDate: daysFromNow(3),
    notes: "Demo call with Helix product team",
    status: "PENDING",
    deal: { id: "deal_2", title: "Helix CRM Annual Retainer" },
    assignedTo: { id: "user_sales", firstName: "Rohan", lastName: "Mehta" },
    createdAt: daysAgo(2),
  },
];

export const employees: Employee[] = [
  {
    id: "emp_1",
    userId: "user_pm",
    user: { firstName: "Kabir", lastName: "Singh", email: "pm@techai.com" },
    employeeCode: "TAI-001",
    department: "Delivery",
    designation: "Project Manager",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    dateOfJoining: daysAgo(400),
    ctc: 1800000,
    createdAt: daysAgo(400),
  },
  {
    id: "emp_2",
    userId: "user_dev",
    user: { firstName: "Ishaan", lastName: "Verma", email: "developer@techai.com" },
    employeeCode: "TAI-002",
    department: "Engineering",
    designation: "Senior Developer",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    dateOfJoining: daysAgo(300),
    ctc: 2200000,
    createdAt: daysAgo(300),
  },
  {
    id: "emp_3",
    userId: "user_designer",
    user: { firstName: "Mira", lastName: "Das", email: "designer@techai.com" },
    employeeCode: "TAI-003",
    department: "Design",
    designation: "Product Designer",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    dateOfJoining: daysAgo(250),
    ctc: 1600000,
    createdAt: daysAgo(250),
  },
  {
    id: "emp_4",
    userId: "user_qa",
    user: { firstName: "Arjun", lastName: "Patel", email: "qa@techai.com" },
    employeeCode: "TAI-004",
    department: "Quality",
    designation: "QA Engineer",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    dateOfJoining: daysAgo(200),
    ctc: 1400000,
    createdAt: daysAgo(200),
  },
  {
    id: "emp_5",
    userId: "user_hr",
    user: { firstName: "Neha", lastName: "Kapoor", email: "hr@techai.com" },
    employeeCode: "TAI-005",
    department: "People",
    designation: "HR Manager",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    dateOfJoining: daysAgo(500),
    ctc: 1500000,
    createdAt: daysAgo(500),
  },
];

export const attendance: Attendance[] = [
  {
    id: "att_1",
    employeeId: "emp_2",
    date: daysAgo(0).slice(0, 10),
    checkIn: new Date(new Date().setHours(9, 42, 0, 0)).toISOString(),
    checkOut: null,
    status: "PRESENT",
    workHours: null,
  },
  {
    id: "att_2",
    employeeId: "emp_2",
    date: daysAgo(1).slice(0, 10),
    checkIn: daysAgo(1),
    checkOut: daysAgo(1),
    status: "PRESENT",
    workHours: 8.5,
  },
  {
    id: "att_3",
    employeeId: "emp_3",
    date: daysAgo(0).slice(0, 10),
    checkIn: new Date(new Date().setHours(10, 5, 0, 0)).toISOString(),
    checkOut: null,
    status: "LATE",
    workHours: null,
  },
];

export const leaves: Leave[] = [
  {
    id: "leave_1",
    employeeId: "emp_2",
    employee: { user: { firstName: "Ishaan", lastName: "Verma" } },
    leaveType: { id: "lt_1", name: "Casual Leave" },
    startDate: daysFromNow(10).slice(0, 10),
    endDate: daysFromNow(11).slice(0, 10),
    totalDays: 2,
    reason: "Family function",
    status: "PENDING",
    createdAt: daysAgo(1),
  },
  {
    id: "leave_2",
    employeeId: "emp_3",
    employee: { user: { firstName: "Mira", lastName: "Das" } },
    leaveType: { id: "lt_2", name: "Sick Leave" },
    startDate: daysAgo(5).slice(0, 10),
    endDate: daysAgo(5).slice(0, 10),
    totalDays: 1,
    reason: "Fever",
    status: "APPROVED",
    createdAt: daysAgo(6),
  },
];

export const holidays: Holiday[] = [
  { id: "hol_1", name: "Republic Day", date: "2026-01-26", type: "PUBLIC", description: "National holiday" },
  { id: "hol_2", name: "Holi", date: "2026-03-14", type: "PUBLIC" },
  { id: "hol_3", name: "Independence Day", date: "2026-08-15", type: "PUBLIC" },
  { id: "hol_4", name: "Diwali", date: "2026-11-08", type: "PUBLIC" },
  { id: "hol_5", name: "Company Foundation Day", date: "2026-07-24", type: "COMPANY" },
];

export const performanceReviews: PerformanceReview[] = [
  {
    id: "rev_1",
    employeeId: "emp_2",
    reviewer: { user: { firstName: "Kabir", lastName: "Singh" } },
    reviewPeriodStart: daysAgo(120).slice(0, 10),
    reviewPeriodEnd: daysAgo(30).slice(0, 10),
    rating: 4.5,
    strengths: "Strong ownership, clean architecture decisions.",
    improvements: "Delegate more during crunch weeks.",
    goals: "Lead mobile platform guild.",
    status: "ACKNOWLEDGED",
  },
  {
    id: "rev_2",
    employeeId: "emp_3",
    reviewer: { user: { firstName: "Kabir", lastName: "Singh" } },
    reviewPeriodStart: daysAgo(120).slice(0, 10),
    reviewPeriodEnd: daysAgo(30).slice(0, 10),
    rating: 4.2,
    strengths: "Excellent product sense and collaboration.",
    improvements: "Document design systems earlier.",
    status: "SUBMITTED",
  },
];

export const jobPostings: JobPosting[] = [
  {
    id: "job_1",
    title: "Senior React Native Engineer",
    department: "Engineering",
    location: "Bengaluru / Hybrid",
    employmentType: "FULL_TIME",
    status: "OPEN",
    openings: 2,
    description: "Ship production mobile apps for fintech clients.",
    applications: 12,
    createdAt: daysAgo(14),
  },
  {
    id: "job_2",
    title: "Product Designer",
    department: "Design",
    location: "Remote (India)",
    employmentType: "FULL_TIME",
    status: "OPEN",
    openings: 1,
    description: "Own end-to-end product design for B2B SaaS.",
    applications: 8,
    createdAt: daysAgo(21),
  },
];

export const jobApplications: JobApplication[] = [
  {
    id: "app_1",
    jobPostingId: "job_1",
    jobPosting: { id: "job_1", title: "Senior React Native Engineer" },
    fullName: "Sneha Reddy",
    email: "sneha@example.com",
    phone: "+91 98888 11111",
    resumeUrl: "https://example.com/resume-sneha.pdf",
    status: "SCREENING",
    source: "LinkedIn",
    createdAt: daysAgo(3),
  },
  {
    id: "app_2",
    jobPostingId: "job_1",
    jobPosting: { id: "job_1", title: "Senior React Native Engineer" },
    fullName: "Dev Patel",
    email: "dev.patel@example.com",
    resumeUrl: "https://example.com/resume-dev.pdf",
    status: "INTERVIEW",
    createdAt: daysAgo(7),
  },
  {
    id: "app_3",
    jobPostingId: "job_2",
    jobPosting: { id: "job_2", title: "Product Designer" },
    fullName: "Ananya Iyer",
    email: "ananya@example.com",
    resumeUrl: "https://example.com/resume-ananya.pdf",
    portfolioUrl: "https://ananya.design",
    status: "NEW",
    createdAt: daysAgo(2),
  },
];

export const salarySlips: SalarySlip[] = [
  {
    id: "sal_1",
    employeeId: "emp_2",
    employee: { user: { firstName: "Ishaan", lastName: "Verma" } },
    month: 6,
    year: 2026,
    basicSalary: 120000,
    allowances: 35000,
    deductions: 12000,
    bonus: 10000,
    tax: 18000,
    netSalary: 135000,
    status: "PAID",
    paidOn: daysAgo(12),
    createdAt: daysAgo(15),
  },
  {
    id: "sal_2",
    employeeId: "emp_2",
    employee: { user: { firstName: "Ishaan", lastName: "Verma" } },
    month: 7,
    year: 2026,
    basicSalary: 120000,
    allowances: 35000,
    deductions: 12000,
    tax: 18000,
    netSalary: 125000,
    status: "GENERATED",
    createdAt: daysAgo(2),
  },
  {
    id: "sal_3",
    employeeId: "emp_3",
    employee: { user: { firstName: "Mira", lastName: "Das" } },
    month: 7,
    year: 2026,
    basicSalary: 90000,
    allowances: 25000,
    deductions: 8000,
    tax: 14000,
    netSalary: 93000,
    status: "GENERATED",
    createdAt: daysAgo(2),
  },
];

export const invoices: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "INV-2026-014",
    client: { id: "user_client", firstName: "Priya", lastName: "Nair" },
    project: { id: "proj_1", name: "NovaPay Mobile Banking" },
    subtotal: 42000,
    tax: 7560,
    discount: 0,
    total: 49560,
    amountPaid: 49560,
    currency: "USD",
    status: "PAID",
    issueDate: daysAgo(35).slice(0, 10),
    dueDate: daysAgo(20).slice(0, 10),
  },
  {
    id: "inv_2",
    invoiceNumber: "INV-2026-021",
    client: { id: "user_client", firstName: "Priya", lastName: "Nair" },
    project: { id: "proj_1", name: "NovaPay Mobile Banking" },
    subtotal: 38000,
    tax: 6840,
    discount: 1000,
    total: 43840,
    amountPaid: 0,
    currency: "USD",
    status: "SENT",
    issueDate: daysAgo(5).slice(0, 10),
    dueDate: daysFromNow(10).slice(0, 10),
  },
  {
    id: "inv_3",
    invoiceNumber: "INV-2026-022",
    client: { id: "user_client", firstName: "Priya", lastName: "Nair" },
    project: { id: "proj_2", name: "Helix CRM Platform" },
    subtotal: 22000,
    tax: 3960,
    discount: 0,
    total: 25960,
    amountPaid: 10000,
    currency: "USD",
    status: "PARTIAL",
    issueDate: daysAgo(8).slice(0, 10),
    dueDate: daysFromNow(7).slice(0, 10),
  },
];

export const quotations: Quotation[] = [
  {
    id: "quot_1",
    quotationNumber: "QT-2026-008",
    title: "AI Support Bot — Discovery + MVP",
    total: 48000,
    currency: "USD",
    status: "SENT",
    validUntil: daysFromNow(14).slice(0, 10),
    createdAt: daysAgo(3),
  },
  {
    id: "quot_2",
    quotationNumber: "QT-2026-009",
    title: "Cloud Cost Optimization Retainer",
    total: 18000,
    currency: "USD",
    status: "DRAFT",
    validUntil: daysFromNow(30).slice(0, 10),
    createdAt: daysAgo(1),
  },
];

export const expenses: Expense[] = [
  {
    id: "exp_1",
    title: "AWS infrastructure — June",
    category: "CLOUD",
    amount: 4200,
    currency: "USD",
    project: { id: "proj_1", name: "NovaPay Mobile Banking" },
    submittedBy: { firstName: "Kabir", lastName: "Singh" },
    expenseDate: daysAgo(20).slice(0, 10),
    isApproved: true,
  },
  {
    id: "exp_2",
    title: "Team offsite travel",
    category: "TRAVEL",
    amount: 1800,
    currency: "USD",
    submittedBy: { firstName: "Neha", lastName: "Kapoor" },
    expenseDate: daysAgo(6).slice(0, 10),
    isApproved: false,
  },
];

export const subscriptions: Subscription[] = [
  {
    id: "sub_1",
    planName: "Growth Care",
    client: { id: "user_client", firstName: "Priya", lastName: "Nair" },
    amount: 4500,
    currency: "USD",
    billingCycle: "MONTHLY",
    status: "ACTIVE",
    nextBillingDate: daysFromNow(12).slice(0, 10),
  },
  {
    id: "sub_2",
    planName: "Enterprise Support",
    client: { id: "user_client", firstName: "Priya", lastName: "Nair" },
    amount: 12000,
    currency: "USD",
    billingCycle: "QUARTERLY",
    status: "ACTIVE",
    nextBillingDate: daysFromNow(40).slice(0, 10),
  },
];

export const contracts: Contract[] = [
  {
    id: "con_1",
    title: "NovaPay Master Services Agreement",
    contractNumber: "CTR-2026-003",
    value: 180000,
    status: "SIGNED",
    startDate: daysAgo(50).slice(0, 10),
    endDate: daysFromNow(300).slice(0, 10),
    signedAt: daysAgo(48),
  },
  {
    id: "con_2",
    title: "Helix CRM Statement of Work",
    contractNumber: "CTR-2026-011",
    value: 95000,
    status: "ACTIVE",
    startDate: daysAgo(30).slice(0, 10),
    endDate: daysFromNow(150).slice(0, 10),
    signedAt: daysAgo(28),
  },
];

export const tickets: Ticket[] = [
  {
    id: "tkt_1",
    ticketNumber: "SUP-1042",
    subject: "Sandbox API keys not refreshing",
    description: "Client sandbox keys expire without renewal email.",
    status: "OPEN",
    priority: "HIGH",
    raisedBy: { firstName: "Priya", lastName: "Nair" },
    assignedTo: { firstName: "Ishaan", lastName: "Verma" },
    createdAt: daysAgo(2),
  },
  {
    id: "tkt_2",
    ticketNumber: "SUP-1038",
    subject: "Request for weekly status PDF",
    description: "Need automated weekly PDF for stakeholders.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    raisedBy: { firstName: "Priya", lastName: "Nair" },
    assignedTo: { firstName: "Kabir", lastName: "Singh" },
    createdAt: daysAgo(5),
  },
];

export const meetings: Meeting[] = [
  {
    id: "mtg_1",
    title: "NovaPay Sprint Review",
    description: "Demo biometric login & transfer flows",
    startTime: daysFromNow(1),
    endTime: daysFromNow(1),
    location: "Zoom",
    meetingLink: "https://meet.example.com/novapay",
    status: "SCHEDULED",
    organizer: { firstName: "Kabir", lastName: "Singh" },
  },
  {
    id: "mtg_2",
    title: "Helix Pipeline Workshop",
    startTime: daysFromNow(3),
    endTime: daysFromNow(3),
    meetingLink: "https://meet.example.com/helix",
    status: "SCHEDULED",
    organizer: { firstName: "Rohan", lastName: "Mehta" },
  },
  {
    id: "mtg_3",
    title: "Client kickoff — Orbit Phase 2",
    startTime: daysAgo(3),
    endTime: daysAgo(3),
    status: "COMPLETED",
    organizer: { firstName: "Kabir", lastName: "Singh" },
  },
];

export const categories: CmsCategory[] = [
  { id: "cat_1", name: "Engineering", slug: "engineering" },
  { id: "cat_2", name: "Product", slug: "product" },
  { id: "cat_3", name: "Company", slug: "company" },
];

export const blogPosts: BlogPost[] = [
  {
    id: "post_1",
    title: "How we ship agency projects in 8-week cycles",
    slug: "8-week-delivery-cycles",
    excerpt: "A practical playbook for predictable delivery without sacrificing craft.",
    content: "Full article content for mock CMS...",
    status: "PUBLISHED",
    isFeatured: true,
    viewCount: 1840,
    author: { firstName: "Kabir", lastName: "Singh" },
    category: categories[0],
    publishedAt: daysAgo(12),
    createdAt: daysAgo(14),
    seo: {
      metaTitle: "8-week delivery cycles | TechAI",
      metaDescription: "How TechAI ships software projects in focused 8-week cycles.",
    },
  },
  {
    id: "post_2",
    title: "Choosing React Native vs Flutter in 2026",
    slug: "react-native-vs-flutter-2026",
    excerpt: "Trade-offs we use when advising clients on mobile stacks.",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 920,
    author: { firstName: "Ishaan", lastName: "Verma" },
    category: categories[0],
    publishedAt: daysAgo(20),
    createdAt: daysAgo(22),
  },
  {
    id: "post_3",
    title: "Draft: AI estimation experiments",
    slug: "ai-estimation-experiments",
    excerpt: "Internal notes on AI-assisted project estimation.",
    status: "DRAFT",
    isFeatured: false,
    viewCount: 0,
    author: { firstName: "Ava", lastName: "Sharma" },
    category: categories[1],
    createdAt: daysAgo(2),
  },
];

export const media: Media[] = [
  {
    id: "media_1",
    fileName: "hero-mesh.jpg",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
    type: "IMAGE",
    mimeType: "image/jpeg",
    size: 540000,
    altText: "Abstract tech mesh",
    uploadedBy: { firstName: "Mira", lastName: "Das" },
    createdAt: daysAgo(30),
  },
  {
    id: "media_2",
    fileName: "team-collab.png",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200",
    type: "IMAGE",
    mimeType: "image/png",
    size: 780000,
    altText: "Team collaboration",
    uploadedBy: { firstName: "Neha", lastName: "Kapoor" },
    createdAt: daysAgo(18),
  },
];

export const cmsPages: CmsPage[] = [
  {
    id: "page_1",
    title: "About TechAI",
    slug: "about",
    content: "We are a digital product studio...",
    status: "PUBLISHED",
    createdAt: daysAgo(100),
    updatedAt: daysAgo(10),
    seo: { metaTitle: "About | TechAI", metaDescription: "About TechAI agency" },
  },
  {
    id: "page_2",
    title: "Privacy Policy",
    slug: "privacy",
    content: "Privacy policy content...",
    status: "PUBLISHED",
    createdAt: daysAgo(200),
    updatedAt: daysAgo(40),
  },
];

export const apiKeys: ApiKey[] = [
  {
    id: "key_1",
    name: "Marketing site",
    key: "tai_live_••••••••9f2a",
    scopes: ["cms:read", "public:write"],
    lastUsedAt: daysAgo(1),
    isActive: true,
    createdAt: daysAgo(60),
  },
  {
    id: "key_2",
    name: "CI pipeline",
    key: "tai_test_••••••••11bc",
    scopes: ["projects:read"],
    lastUsedAt: daysAgo(3),
    expiresAt: daysFromNow(90),
    isActive: true,
    createdAt: daysAgo(20),
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "log_1",
    action: "LOGIN",
    entity: "User",
    entityId: "user_admin",
    description: "Super admin signed in",
    user: { firstName: "Ava", lastName: "Sharma" },
    createdAt: daysAgo(0),
  },
  {
    id: "log_2",
    action: "UPDATE",
    entity: "Project",
    entityId: "proj_1",
    description: "Updated project progress to 62%",
    user: { firstName: "Kabir", lastName: "Singh" },
    createdAt: daysAgo(1),
  },
  {
    id: "log_3",
    action: "CREATE",
    entity: "Invoice",
    entityId: "inv_2",
    description: "Created invoice INV-2026-021",
    user: { firstName: "Ava", lastName: "Sharma" },
    createdAt: daysAgo(5),
  },
];

export const notifications: Notification[] = [
  {
    id: "notif_1",
    title: "Invoice paid",
    message: "INV-2026-014 was marked as paid by Nova Financial.",
    type: "BILLING",
    isRead: false,
    link: "/finance/invoices",
    createdAt: daysAgo(1),
  },
  {
    id: "notif_2",
    title: "New support ticket",
    message: "SUP-1042 — Sandbox API keys not refreshing",
    type: "SUPPORT",
    isRead: false,
    link: "/client/tickets",
    createdAt: daysAgo(2),
  },
  {
    id: "notif_3",
    title: "Leave request",
    message: "Ishaan Verma requested 2 days of casual leave.",
    type: "HR",
    isRead: true,
    link: "/hr/leave",
    createdAt: daysAgo(1),
  },
];

export const messages: Message[] = [
  {
    id: "msg_1",
    content: "Hi team — can we move the sprint review to Thursday?",
    senderId: "user_client",
    sender: { firstName: "Priya", lastName: "Nair" },
    createdAt: daysAgo(1),
    isRead: true,
  },
  {
    id: "msg_2",
    content: "Thursday 4pm IST works. I'll send a calendar invite.",
    senderId: "user_pm",
    sender: { firstName: "Kabir", lastName: "Singh" },
    createdAt: daysAgo(1),
    isRead: true,
  },
  {
    id: "msg_3",
    content: "Also sharing the latest Figma file for biometric screens.",
    senderId: "user_designer",
    sender: { firstName: "Mira", lastName: "Das" },
    createdAt: daysAgo(0),
    isRead: false,
  },
];

export const payments = [
  {
    id: "pay_1",
    amount: 49560,
    currency: "USD",
    method: "STRIPE",
    status: "SUCCEEDED",
    invoiceNumber: "INV-2026-014",
    clientName: "Priya Nair",
    paidAt: daysAgo(18),
    createdAt: daysAgo(18),
  },
  {
    id: "pay_2",
    amount: 10000,
    currency: "USD",
    method: "RAZORPAY",
    status: "SUCCEEDED",
    invoiceNumber: "INV-2026-022",
    clientName: "Priya Nair",
    paidAt: daysAgo(4),
    createdAt: daysAgo(4),
  },
];

export const feedback = [
  {
    id: "fb_1",
    rating: 5,
    comment: "Great communication and on-time milestones.",
    projectName: "NovaPay Mobile Banking",
    createdAt: daysAgo(15),
  },
  {
    id: "fb_2",
    rating: 4,
    comment: "Solid delivery. Would love faster design turnarounds.",
    projectName: "Helix CRM Platform",
    createdAt: daysAgo(6),
  },
];

export const adminSettings = {
  companyName: "TechAI",
  supportEmail: "tech1001ai@gmail.com",
  timezone: "Asia/Kolkata",
  currency: "USD",
  invoicePrefix: "INV",
  maintenanceMode: false,
};

export const salesAnalytics = {
  leads: {
    total: leads.length,
    byStatus: Object.entries(
      leads.reduce<Record<string, number>>((acc, lead) => {
        acc[lead.status] = (acc[lead.status] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => ({ status, count })),
  },
  deals: {
    total: deals.length,
    open: deals.filter((d) => d.status === "OPEN").length,
    won: deals.filter((d) => d.status === "WON").length,
    lost: deals.filter((d) => d.status === "LOST").length,
    winRate: 28,
    wonValue: deals
      .filter((d) => d.status === "WON")
      .reduce((sum, d) => sum + Number(d.value), 0),
    openPipelineValue: deals
      .filter((d) => d.status === "OPEN")
      .reduce((sum, d) => sum + Number(d.value), 0),
  },
  companies: companies.length,
  contacts: contacts.length,
};

export const revenueDashboard = {
  totalRevenue: 245000,
  outstandingAmount: 59800,
  overdueInvoices: 1,
  monthlyRecurringRevenue: 16500,
  outstanding: 59800,
  mrr: 16500,
  expensesThisMonth: 6000,
  profitThisMonth: 28500,
  invoicesByStatus: [
    { status: "PAID", count: 8, amount: 186000 },
    { status: "SENT", count: 3, amount: 43840 },
    { status: "PARTIAL", count: 2, amount: 25960 },
    { status: "OVERDUE", count: 1, amount: 12000 },
  ],
  monthly: [
    { month: "Feb", revenue: 28000 },
    { month: "Mar", revenue: 32000 },
    { month: "Apr", revenue: 41000 },
    { month: "May", revenue: 38000 },
    { month: "Jun", revenue: 52000 },
    { month: "Jul", revenue: 54000 },
  ],
};

export const analyticsSummary = {
  users: users.length,
  projects: projects.length,
  activeProjects: projects.filter((p) => p.status === "IN_PROGRESS").length,
  revenueYtd: 245000,
  ticketsOpen: tickets.filter((t) => t.status !== "CLOSED").length,
};

export const analyticsGrowth = [
  { name: "Feb", value: 4 },
  { name: "Mar", value: 6 },
  { name: "Apr", value: 9 },
  { name: "May", value: 11 },
  { name: "Jun", value: 14 },
  { name: "Jul", value: users.length },
];

export const analyticsFunnel = [
  { name: "Leads", value: 48 },
  { name: "Qualified", value: 22 },
  { name: "Proposals", value: 14 },
  { name: "Won", value: 6 },
];

export const revenueSeries = revenueDashboard.monthly;

export type MockRole = UserRole;
