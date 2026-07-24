import type { InternalAxiosRequestConfig } from "axios";
import {
  MOCK_ACCOUNTS,
  salesAnalytics,
  revenueDashboard,
  analyticsSummary,
  analyticsGrowth,
  analyticsFunnel,
  revenueSeries,
} from "@/mock/data";
import { mockStore } from "@/mock/store";
import { cuid, wrapMock } from "@/mock/utils";

function pathOf(url = ""): string {
  const bare = url.split("?")[0] ?? url;
  return bare.replace(/^\/+/, "").replace(/^api\/v1\//, "");
}

function bodyOf(config: InternalAxiosRequestConfig): Record<string, unknown> {
  if (!config.data) return {};
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof config.data === "object") return config.data as Record<string, unknown>;
  return {};
}

function notFound(path: string) {
  const err = new Error(`Mock route not found: ${path}`) as Error & {
    response?: { status: number; data: unknown };
  };
  err.response = {
    status: 404,
    data: wrapMock(null, { message: `No mock handler for /${path}` }),
  };
  throw err;
}

function aiResponse(tool: string, input: Record<string, unknown>) {
  const title = String(input.title ?? input.topic ?? input.subject ?? tool);
  return {
    mock: true,
    tool,
    title,
    content: `## ${title}\n\nThis is **mock AI output** for \`${tool}\`.\n\n- Generated without OpenAI\n- Replace by setting NEXT_PUBLIC_USE_MOCK=false and configuring OPENAI_API_KEY on the API\n\n### Summary\nTechAI would produce a polished ${tool.replace(/-/g, " ")} here based on your inputs.\n\n### Next steps\n1. Review with your team\n2. Edit tone and scope\n3. Export to PDF / Notion`,
    tokensUsed: 0,
  };
}

export async function handleMockRequest(config: InternalAxiosRequestConfig): Promise<unknown> {
  const method = (config.method ?? "get").toLowerCase();
  const path = pathOf(config.url ?? "");
  const body = bodyOf(config);

  // ---------- Auth ----------
  if (path === "auth/login" && method === "post") {
    const email = String(body.email ?? "").toLowerCase();
    const account = MOCK_ACCOUNTS.find((a) => a.email === email);
    if (!account) {
      const err = new Error("Invalid credentials") as Error & { response?: { status: number; data: unknown } };
      err.response = { status: 401, data: { message: "Invalid email or password" } };
      throw err;
    }
    // Accept any password length ≥ 6 in mock mode (login form already validates)
    return {
      user: account.user,
      accessToken: `mock_access_${account.user.id}`,
      refreshToken: `mock_refresh_${account.user.id}`,
    };
  }

  if (path === "auth/register" && method === "post") {
    const user = {
      id: cuid("user"),
      email: String(body.email ?? ""),
      firstName: String(body.firstName ?? "New"),
      lastName: String(body.lastName ?? "Client"),
      role: "CLIENT",
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockStore.users.unshift(user as (typeof mockStore.users)[number]);
    return {
      user,
      accessToken: `mock_access_${user.id}`,
      refreshToken: `mock_refresh_${user.id}`,
    };
  }

  if (path === "auth/me" && method === "get") {
    return wrapMock(MOCK_ACCOUNTS[0].user);
  }

  if (path === "auth/forgot-password" && method === "post") {
    return wrapMock({ message: "If that email exists, a reset link was sent (mock)." });
  }

  // ---------- Users / Admin ----------
  if (path === "users" && method === "get") return wrapMock(mockStore.users);
  if (path === "users" && method === "post") {
    const user = {
      id: cuid("user"),
      email: String(body.email ?? ""),
      firstName: String(body.firstName ?? ""),
      lastName: String(body.lastName ?? ""),
      role: String(body.role ?? "DEVELOPER"),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockStore.users.unshift(user as (typeof mockStore.users)[number]);
    return wrapMock(user);
  }
  if (path.match(/^users\/[^/]+$/) && method === "patch") {
    const id = path.split("/")[1];
    const idx = mockStore.users.findIndex((u) => u.id === id);
    if (idx >= 0) mockStore.users[idx] = { ...mockStore.users[idx], ...body } as (typeof mockStore.users)[number];
    return wrapMock(mockStore.users[idx] ?? null);
  }
  if (path.match(/^users\/[^/]+$/) && method === "delete") {
    const id = path.split("/")[1];
    mockStore.users = mockStore.users.filter((u) => u.id !== id);
    return wrapMock({ ok: true });
  }
  if (path === "users/profile/me" && method === "patch") {
    return wrapMock({ ...MOCK_ACCOUNTS[0].user, ...body });
  }
  if (path === "users/profile/change-password" && method === "patch") {
    return wrapMock({ ok: true });
  }
  if (path === "permissions" && method === "get") return wrapMock(mockStore.permissions);

  if (path === "admin/logs" || path === "admin/audit-logs") return wrapMock(mockStore.auditLogs);
  if (path === "admin/api-keys" && method === "get") return wrapMock(mockStore.apiKeys);
  if (path === "admin/api-keys" && method === "post") {
    const key = {
      id: cuid("key"),
      name: String(body.name ?? "New key"),
      key: `tai_mock_${cuid()}`,
      scopes: ["read"],
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockStore.apiKeys.unshift(key);
    return wrapMock(key);
  }
  if (path.match(/^admin\/api-keys\/[^/]+$/) && method === "delete") {
    const id = path.split("/")[2];
    mockStore.apiKeys = mockStore.apiKeys.filter((k) => k.id !== id);
    return wrapMock({ ok: true });
  }
  if (path === "admin/settings" && method === "get") return wrapMock(mockStore.adminSettings);
  if (path === "admin/settings" && method === "patch") {
    mockStore.adminSettings = { ...mockStore.adminSettings, ...body };
    return wrapMock(mockStore.adminSettings);
  }
  if (path === "admin/dashboard") return wrapMock(analyticsSummary);
  if (path === "admin/analytics/summary") return wrapMock(analyticsSummary);
  if (path === "admin/analytics/growth") return wrapMock(analyticsGrowth);
  if (path === "admin/analytics/funnel") return wrapMock(analyticsFunnel);
  if (path === "admin/analytics/revenue") return wrapMock(revenueSeries);
  if (path === "payments") return wrapMock(mockStore.payments);

  // ---------- Projects ----------
  if (path === "projects" && method === "get") return wrapMock(mockStore.projects);
  if (path === "projects" && method === "post") {
    const project = {
      id: cuid("proj"),
      name: String(body.name ?? "New Project"),
      slug: String(body.name ?? "new-project").toLowerCase().replace(/\s+/g, "-"),
      description: (body.description as string) ?? null,
      status: "PLANNING",
      priority: String(body.priority ?? "MEDIUM"),
      progress: 0,
      createdAt: new Date().toISOString(),
      membersCount: 1,
    };
    mockStore.projects.unshift(project as (typeof mockStore.projects)[number]);
    return wrapMock(project);
  }
  if (path.match(/^projects\/[^/]+$/) && method === "get") {
    const id = path.split("/")[1];
    return wrapMock(mockStore.projects.find((p) => p.id === id) ?? null);
  }
  if (path.match(/^projects\/[^/]+\/tasks$/) && method === "get") {
    const id = path.split("/")[1];
    return wrapMock(mockStore.tasks.filter((t) => t.projectId === id));
  }
  if (path.match(/^projects\/[^/]+\/tasks$/) && method === "post") {
    const projectId = path.split("/")[1];
    const task = {
      id: cuid("task"),
      projectId,
      title: String(body.title ?? "New task"),
      description: (body.description as string) ?? null,
      status: "TODO",
      priority: String(body.priority ?? "MEDIUM"),
      dueDate: (body.dueDate as string) ?? null,
      createdAt: new Date().toISOString(),
    };
    mockStore.tasks.unshift(task as (typeof mockStore.tasks)[number]);
    return wrapMock(task);
  }
  if (path.match(/^projects\/[^/]+\/tasks\/[^/]+\/status$/) && method === "patch") {
    const taskId = path.split("/")[3];
    const idx = mockStore.tasks.findIndex((t) => t.id === taskId);
    if (idx >= 0) mockStore.tasks[idx] = { ...mockStore.tasks[idx], status: String(body.status) };
    return wrapMock(mockStore.tasks[idx] ?? null);
  }
  if (path.match(/^tasks\/[^/]+$/) && method === "patch") {
    const id = path.split("/")[1];
    const idx = mockStore.tasks.findIndex((t) => t.id === id);
    if (idx >= 0) mockStore.tasks[idx] = { ...mockStore.tasks[idx], ...body } as (typeof mockStore.tasks)[number];
    return wrapMock(mockStore.tasks[idx] ?? null);
  }
  if (path.match(/^projects\/[^/]+\/sprints$/) && method === "get") {
    const id = path.split("/")[1];
    return wrapMock(mockStore.sprints.filter((s) => s.projectId === id));
  }
  if (path.match(/^projects\/[^/]+\/sprints$/) && method === "post") {
    const projectId = path.split("/")[1];
    const sprint = {
      id: cuid("sprint"),
      projectId,
      name: String(body.name ?? "Sprint"),
      goal: (body.goal as string) ?? null,
      status: "PLANNED",
      createdAt: new Date().toISOString(),
    };
    mockStore.sprints.unshift(sprint as (typeof mockStore.sprints)[number]);
    return wrapMock(sprint);
  }
  if (path.match(/^projects\/[^/]+\/bugs$/) && method === "get") {
    const id = path.split("/")[1];
    return wrapMock(mockStore.bugs.filter((b) => b.projectId === id));
  }
  if (path.match(/^projects\/[^/]+\/bugs$/) && method === "post") {
    const projectId = path.split("/")[1];
    const bug = {
      id: cuid("bug"),
      projectId,
      title: String(body.title ?? "Bug"),
      description: (body.description as string) ?? null,
      severity: String(body.severity ?? "MEDIUM"),
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    mockStore.bugs.unshift(bug as (typeof mockStore.bugs)[number]);
    return wrapMock(bug);
  }
  if (path.match(/^projects\/[^/]+\/bugs\/[^/]+$/) && method === "patch") {
    const id = path.split("/")[3];
    const idx = mockStore.bugs.findIndex((b) => b.id === id);
    if (idx >= 0) mockStore.bugs[idx] = { ...mockStore.bugs[idx], ...body } as (typeof mockStore.bugs)[number];
    return wrapMock(mockStore.bugs[idx] ?? null);
  }
  if (path.match(/^projects\/[^/]+\/time-entries$/) && method === "get") {
    const id = path.split("/")[1];
    return wrapMock(mockStore.timeEntries.filter((t) => t.projectId === id));
  }
  if (path.match(/^projects\/[^/]+\/time-entries$/) && method === "post") {
    const projectId = path.split("/")[1];
    const entry = {
      id: cuid("time"),
      projectId,
      userId: "user_dev",
      description: (body.description as string) ?? null,
      startTime: String(body.startTime ?? new Date().toISOString()),
      endTime: (body.endTime as string) ?? null,
      durationMinutes: 60,
      isBillable: true,
      createdAt: new Date().toISOString(),
    };
    mockStore.timeEntries.unshift(entry as (typeof mockStore.timeEntries)[number]);
    return wrapMock(entry);
  }
  if (path.match(/^projects\/[^/]+\/members$/) && method === "get") {
    return wrapMock(mockStore.projectMembers);
  }
  if (path.match(/^projects\/[^/]+\/members$/) && method === "post") {
    const member = {
      id: cuid("pmem"),
      userId: String(body.userId ?? "user_dev"),
      user: { id: "user_dev", firstName: "Ishaan", lastName: "Verma" },
      role: String(body.role ?? "DEVELOPER"),
    };
    mockStore.projectMembers.push(member);
    return wrapMock(member);
  }
  if (path.match(/^projects\/[^/]+\/members\/[^/]+$/) && method === "delete") {
    const userId = path.split("/")[3];
    mockStore.projectMembers = mockStore.projectMembers.filter((m) => m.userId !== userId);
    return wrapMock({ ok: true });
  }
  if (path.match(/^projects\/[^/]+\/activity$/) && method === "get") {
    return wrapMock(mockStore.projectActivity);
  }

  // ---------- CRM ----------
  if (path === "crm/analytics/summary") return wrapMock(salesAnalytics);
  if (path === "crm/pipeline-stages") return wrapMock(mockStore.pipelineStages);
  if (path === "crm/leads" && method === "get") return wrapMock(mockStore.leads);
  if (path === "crm/leads" && method === "post") {
    const lead = {
      id: cuid("lead"),
      title: String(body.title ?? "New lead"),
      source: String(body.source ?? "WEBSITE"),
      status: "NEW",
      estimatedValue: body.estimatedValue ?? null,
      createdAt: new Date().toISOString(),
    };
    mockStore.leads.unshift(lead as (typeof mockStore.leads)[number]);
    return wrapMock(lead);
  }
  if (path === "crm/deals" && method === "get") return wrapMock(mockStore.deals);
  if (path === "crm/deals" && method === "post") {
    const stage = mockStore.pipelineStages[0];
    const deal = {
      id: cuid("deal"),
      title: String(body.title ?? "New deal"),
      stageId: String(body.stageId ?? stage.id),
      stage,
      value: Number(body.value ?? 0),
      currency: String(body.currency ?? "USD"),
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    mockStore.deals.unshift(deal as (typeof mockStore.deals)[number]);
    return wrapMock(deal);
  }
  if (path === "crm/deals/board") {
    return wrapMock(
      mockStore.pipelineStages.map((stage) => ({
        ...stage,
        deals: mockStore.deals.filter((d) => d.stageId === stage.id),
      }))
    );
  }
  if (path.match(/^crm\/deals\/[^/]+\/stage$/) && method === "patch") {
    const id = path.split("/")[2];
    const idx = mockStore.deals.findIndex((d) => d.id === id);
    const stage = mockStore.pipelineStages.find((s) => s.id === body.stageId);
    if (idx >= 0 && stage) {
      mockStore.deals[idx] = { ...mockStore.deals[idx], stageId: stage.id, stage };
    }
    return wrapMock(mockStore.deals[idx] ?? null);
  }
  if (path === "crm/contacts" && method === "get") return wrapMock(mockStore.contacts);
  if (path === "crm/contacts" && method === "post") {
    const contact = {
      id: cuid("ct"),
      firstName: String(body.firstName ?? ""),
      lastName: (body.lastName as string) ?? null,
      email: (body.email as string) ?? null,
      phone: (body.phone as string) ?? null,
      createdAt: new Date().toISOString(),
    };
    mockStore.contacts.unshift(contact as (typeof mockStore.contacts)[number]);
    return wrapMock(contact);
  }
  if (path === "crm/companies" && method === "get") return wrapMock(mockStore.companies);
  if (path === "crm/companies" && method === "post") {
    const company = {
      id: cuid("co"),
      name: String(body.name ?? "Company"),
      website: (body.website as string) ?? null,
      industry: (body.industry as string) ?? null,
      createdAt: new Date().toISOString(),
    };
    mockStore.companies.unshift(company as (typeof mockStore.companies)[number]);
    return wrapMock(company);
  }
  if (path === "crm/follow-ups" && method === "get") return wrapMock(mockStore.followUps);
  if (path === "crm/follow-ups" && method === "post") {
    const fu = {
      id: cuid("fu"),
      dueDate: String(body.dueDate ?? new Date().toISOString()),
      notes: (body.notes as string) ?? null,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    mockStore.followUps.unshift(fu as (typeof mockStore.followUps)[number]);
    return wrapMock(fu);
  }
  if (path.match(/^crm\/follow-ups\/[^/]+\/complete$/) && method === "patch") {
    const id = path.split("/")[2];
    const idx = mockStore.followUps.findIndex((f) => f.id === id);
    if (idx >= 0) mockStore.followUps[idx] = { ...mockStore.followUps[idx], status: "COMPLETED" };
    return wrapMock(mockStore.followUps[idx] ?? null);
  }

  // ---------- HR ----------
  if (path === "hr/employees" && method === "get") return wrapMock(mockStore.employees);
  if (path === "hr/employees" && method === "post") {
    const emp = {
      id: cuid("emp"),
      userId: cuid("user"),
      user: {
        firstName: String(body.firstName ?? "New"),
        lastName: String(body.lastName ?? "Hire"),
        email: String(body.email ?? "new@techai.com"),
      },
      employeeCode: `TAI-${String(mockStore.employees.length + 1).padStart(3, "0")}`,
      department: (body.department as string) ?? "Engineering",
      designation: (body.designation as string) ?? "Associate",
      employmentType: String(body.employmentType ?? "FULL_TIME"),
      status: "ACTIVE",
      dateOfJoining: String(body.dateOfJoining ?? new Date().toISOString().slice(0, 10)),
      createdAt: new Date().toISOString(),
    };
    mockStore.employees.unshift(emp as (typeof mockStore.employees)[number]);
    return wrapMock(emp);
  }
  if (path === "hr/attendance") return wrapMock(mockStore.attendance);
  if (path === "hr/leaves" && method === "get") return wrapMock(mockStore.leaves);
  if (path.match(/^hr\/leaves\/[^/]+\/approve$/) && method === "patch") {
    const id = path.split("/")[2];
    const idx = mockStore.leaves.findIndex((l) => l.id === id);
    if (idx >= 0) mockStore.leaves[idx] = { ...mockStore.leaves[idx], status: "APPROVED" };
    return wrapMock(mockStore.leaves[idx] ?? null);
  }
  if (path.match(/^hr\/leaves\/[^/]+\/reject$/) && method === "patch") {
    const id = path.split("/")[2];
    const idx = mockStore.leaves.findIndex((l) => l.id === id);
    if (idx >= 0) mockStore.leaves[idx] = { ...mockStore.leaves[idx], status: "REJECTED" };
    return wrapMock(mockStore.leaves[idx] ?? null);
  }
  if (path === "hr/holidays" && method === "get") return wrapMock(mockStore.holidays);
  if (path === "hr/holidays" && method === "post") {
    const holiday = {
      id: cuid("hol"),
      name: String(body.name ?? "Holiday"),
      date: String(body.date ?? new Date().toISOString().slice(0, 10)),
      type: String(body.type ?? "PUBLIC"),
      description: (body.description as string) ?? null,
    };
    mockStore.holidays.push(holiday);
    return wrapMock(holiday);
  }
  if (path === "hr/performance-reviews" && method === "get") return wrapMock(mockStore.performanceReviews);
  if (path === "hr/performance-reviews" && method === "post") {
    const review = {
      id: cuid("rev"),
      employeeId: String(body.employeeId ?? "emp_2"),
      reviewPeriodStart: String(body.reviewPeriodStart ?? ""),
      reviewPeriodEnd: String(body.reviewPeriodEnd ?? ""),
      rating: Number(body.rating ?? 4),
      status: "DRAFT",
    };
    mockStore.performanceReviews.unshift(review as (typeof mockStore.performanceReviews)[number]);
    return wrapMock(review);
  }
  if (path === "hr/salary-slips" && method === "get") return wrapMock(mockStore.salarySlips);
  if (path === "hr/salary-slips" && method === "post") {
    const slip = {
      id: cuid("sal"),
      employeeId: String(body.employeeId ?? "emp_2"),
      month: Number(body.month ?? 7),
      year: Number(body.year ?? 2026),
      basicSalary: Number(body.basicSalary ?? 100000),
      netSalary: Number(body.netSalary ?? 100000),
      status: "GENERATED",
      createdAt: new Date().toISOString(),
    };
    mockStore.salarySlips.unshift(slip as (typeof mockStore.salarySlips)[number]);
    return wrapMock(slip);
  }
  if (path.match(/^hr\/salary-slips\/[^/]+\/mark-paid$/) && method === "patch") {
    const id = path.split("/")[2];
    const idx = mockStore.salarySlips.findIndex((s) => s.id === id);
    if (idx >= 0) {
      mockStore.salarySlips[idx] = {
        ...mockStore.salarySlips[idx],
        status: "PAID",
        paidOn: new Date().toISOString(),
      };
    }
    return wrapMock(mockStore.salarySlips[idx] ?? null);
  }
  if (path === "hr/recruitment/job-postings" && method === "get") return wrapMock(mockStore.jobPostings);
  if (path === "hr/recruitment/job-postings" && method === "post") {
    const job = {
      id: cuid("job"),
      title: String(body.title ?? "Open role"),
      department: (body.department as string) ?? null,
      location: (body.location as string) ?? null,
      employmentType: String(body.employmentType ?? "FULL_TIME"),
      status: "OPEN",
      openings: Number(body.openings ?? 1),
      applications: 0,
      createdAt: new Date().toISOString(),
    };
    mockStore.jobPostings.unshift(job as (typeof mockStore.jobPostings)[number]);
    return wrapMock(job);
  }
  if (path.match(/^hr\/recruitment\/job-postings\/[^/]+\/close$/) && method === "patch") {
    const id = path.split("/")[3];
    const idx = mockStore.jobPostings.findIndex((j) => j.id === id);
    if (idx >= 0) mockStore.jobPostings[idx] = { ...mockStore.jobPostings[idx], status: "CLOSED" };
    return wrapMock(mockStore.jobPostings[idx] ?? null);
  }
  if (path === "hr/recruitment/applications") return wrapMock(mockStore.jobApplications);
  if (path.match(/^hr\/recruitment\/applications\/[^/]+\/status$/) && method === "patch") {
    const id = path.split("/")[3];
    const idx = mockStore.jobApplications.findIndex((a) => a.id === id);
    if (idx >= 0) mockStore.jobApplications[idx] = { ...mockStore.jobApplications[idx], status: String(body.status) };
    return wrapMock(mockStore.jobApplications[idx] ?? null);
  }

  // ---------- Finance ----------
  if (path === "finance/dashboard/revenue") return wrapMock(revenueDashboard);
  if (path === "finance/invoices" && method === "get") return wrapMock(mockStore.invoices);
  if (path === "finance/invoices" && method === "post") {
    const inv = {
      id: cuid("inv"),
      invoiceNumber: `INV-MOCK-${mockStore.invoices.length + 1}`,
      subtotal: 1000,
      tax: 180,
      discount: 0,
      total: 1180,
      amountPaid: 0,
      currency: String(body.currency ?? "USD"),
      status: "DRAFT",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
    };
    mockStore.invoices.unshift(inv as (typeof mockStore.invoices)[number]);
    return wrapMock(inv);
  }
  if (path.match(/^finance\/invoices\/[^/]+\/mark-paid$/) && method === "patch") {
    const id = path.split("/")[2];
    const idx = mockStore.invoices.findIndex((i) => i.id === id);
    if (idx >= 0) {
      mockStore.invoices[idx] = {
        ...mockStore.invoices[idx],
        status: "PAID",
        amountPaid: mockStore.invoices[idx].total,
      };
    }
    return wrapMock(mockStore.invoices[idx] ?? null);
  }
  if (path === "finance/quotations" && method === "get") return wrapMock(mockStore.quotations);
  if (path === "finance/quotations" && method === "post") {
    const q = {
      id: cuid("quot"),
      quotationNumber: `QT-MOCK-${mockStore.quotations.length + 1}`,
      title: String(body.title ?? "Quotation"),
      total: 5000,
      currency: "USD",
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    };
    mockStore.quotations.unshift(q as (typeof mockStore.quotations)[number]);
    return wrapMock(q);
  }
  if (path === "finance/expenses" && method === "get") return wrapMock(mockStore.expenses);
  if (path === "finance/expenses" && method === "post") {
    const exp = {
      id: cuid("exp"),
      title: String(body.title ?? "Expense"),
      category: String(body.category ?? "OTHER"),
      amount: Number(body.amount ?? 0),
      currency: String(body.currency ?? "USD"),
      expenseDate: String(body.expenseDate ?? new Date().toISOString().slice(0, 10)),
      isApproved: false,
    };
    mockStore.expenses.unshift(exp as (typeof mockStore.expenses)[number]);
    return wrapMock(exp);
  }
  if (path.match(/^finance\/expenses\/[^/]+\/approve$/) && method === "patch") {
    const id = path.split("/")[2];
    const idx = mockStore.expenses.findIndex((e) => e.id === id);
    if (idx >= 0) mockStore.expenses[idx] = { ...mockStore.expenses[idx], isApproved: true };
    return wrapMock(mockStore.expenses[idx] ?? null);
  }
  if (path === "finance/subscriptions" && method === "get") return wrapMock(mockStore.subscriptions);
  if (path === "finance/subscriptions" && method === "post") {
    const sub = {
      id: cuid("sub"),
      planName: String(body.planName ?? "Plan"),
      amount: Number(body.amount ?? 0),
      currency: String(body.currency ?? "USD"),
      billingCycle: String(body.billingCycle ?? "MONTHLY"),
      status: "ACTIVE",
    };
    mockStore.subscriptions.unshift(sub as (typeof mockStore.subscriptions)[number]);
    return wrapMock(sub);
  }
  if (path.match(/^finance\/subscriptions\/[^/]+\/cancel$/) && method === "patch") {
    const id = path.split("/")[2];
    const idx = mockStore.subscriptions.findIndex((s) => s.id === id);
    if (idx >= 0) mockStore.subscriptions[idx] = { ...mockStore.subscriptions[idx], status: "CANCELLED" };
    return wrapMock(mockStore.subscriptions[idx] ?? null);
  }

  // ---------- CMS ----------
  if (path === "cms/blog-posts" && method === "get") return wrapMock(mockStore.blogPosts);
  if (path === "cms/blog-posts" && method === "post") {
    const post = {
      id: cuid("post"),
      title: String(body.title ?? "Untitled"),
      slug: String(body.slug ?? "untitled"),
      excerpt: (body.excerpt as string) ?? null,
      status: String(body.status ?? "DRAFT"),
      isFeatured: Boolean(body.isFeatured),
      viewCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockStore.blogPosts.unshift(post as (typeof mockStore.blogPosts)[number]);
    return wrapMock(post);
  }
  if (path.match(/^cms\/blog-posts\/[^/]+$/) && method === "delete") {
    const id = path.split("/")[2];
    mockStore.blogPosts = mockStore.blogPosts.filter((p) => p.id !== id);
    return wrapMock({ ok: true });
  }
  if (path === "cms/categories") return wrapMock(mockStore.categories);
  if (path === "cms/media" && method === "get") return wrapMock(mockStore.media);
  if (path === "cms/media" && method === "post") {
    const item = {
      id: cuid("media"),
      fileName: String(body.fileName ?? "file"),
      url: String(body.url ?? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800"),
      type: String(body.type ?? "IMAGE"),
      createdAt: new Date().toISOString(),
    };
    mockStore.media.unshift(item as (typeof mockStore.media)[number]);
    return wrapMock(item);
  }
  if (path.match(/^cms\/media\/[^/]+$/) && method === "delete") {
    const id = path.split("/")[2];
    mockStore.media = mockStore.media.filter((m) => m.id !== id);
    return wrapMock({ ok: true });
  }
  if (path === "cms/pages" && method === "get") return wrapMock(mockStore.cmsPages);
  if (path === "cms/pages" && method === "post") {
    const page = {
      id: cuid("page"),
      title: String(body.title ?? "Page"),
      slug: String(body.slug ?? "page"),
      status: String(body.status ?? "DRAFT"),
      createdAt: new Date().toISOString(),
    };
    mockStore.cmsPages.unshift(page as (typeof mockStore.cmsPages)[number]);
    return wrapMock(page);
  }
  if (path.match(/^cms\/pages\/[^/]+$/) && method === "delete") {
    const id = path.split("/")[2];
    mockStore.cmsPages = mockStore.cmsPages.filter((p) => p.id !== id);
    return wrapMock({ ok: true });
  }
  if (path.match(/^cms\/(blog-posts|pages)\/[^/]+\/seo$/) && method === "post") {
    return wrapMock({ ...body, id: cuid("seo") });
  }

  // ---------- Client ----------
  if (path === "client/projects" || path === "client/projects/overview") return wrapMock(mockStore.projects);
  if (path.match(/^client\/projects\/[^/]+$/) && method === "get") {
    const id = path.split("/")[2];
    return wrapMock(mockStore.projects.find((p) => p.id === id) ?? mockStore.projects[0] ?? null);
  }
  if (path.match(/^client\/projects\/[^/]+\/milestones$/)) {
    const id = path.split("/")[2];
    return wrapMock(mockStore.milestones.filter((m) => m.projectId === id));
  }
  if (path.match(/^client\/projects\/[^/]+\/documents$/)) return wrapMock(mockStore.documents);
  if (path === "client/invoices") return wrapMock(mockStore.invoices);
  if (path === "client/contracts") return wrapMock(mockStore.contracts);
  if (path === "client/payments") return wrapMock(mockStore.payments);
  if (path === "client/milestones") {
    return wrapMock(
      mockStore.milestones.map((m) => ({
        ...m,
        project: mockStore.projects.find((p) => p.id === m.projectId),
      }))
    );
  }
  if (path === "client/tickets" && method === "get") return wrapMock(mockStore.tickets);
  if (path === "client/tickets" && method === "post") {
    const ticket = {
      id: cuid("tkt"),
      ticketNumber: `SUP-${1000 + mockStore.tickets.length}`,
      subject: String(body.subject ?? "Support request"),
      description: String(body.description ?? ""),
      status: "OPEN",
      priority: String(body.priority ?? "MEDIUM"),
      raisedBy: { firstName: "Priya", lastName: "Nair" },
      createdAt: new Date().toISOString(),
    };
    mockStore.tickets.unshift(ticket as (typeof mockStore.tickets)[number]);
    return wrapMock(ticket);
  }
  if (path === "client/messages" || path === "employee/messages") {
    if (method === "get") return wrapMock(mockStore.messages);
    if (method === "post") {
      const msg = {
        id: cuid("msg"),
        content: String(body.content ?? ""),
        senderId: "user_admin",
        sender: { firstName: "You", lastName: "" },
        createdAt: new Date().toISOString(),
        isRead: true,
      };
      mockStore.messages.push(msg);
      return wrapMock(msg);
    }
  }
  if (path === "client/documents" && method === "get") return wrapMock(mockStore.documents);
  if (path === "client/documents" && method === "post") {
    const doc = {
      id: cuid("doc"),
      name: "Uploaded document.pdf",
      fileUrl: "https://example.com/files/uploaded.pdf",
      fileType: "application/pdf",
      fileSize: 120000,
      createdAt: new Date().toISOString(),
    };
    mockStore.documents.unshift(doc);
    return wrapMock(doc);
  }
  if (path === "client/meetings" || path === "employee/meetings") return wrapMock(mockStore.meetings);
  if (path === "client/feedback" && method === "get") return wrapMock(mockStore.feedback);
  if (path === "client/feedback" && method === "post") {
    const item = {
      id: cuid("fb"),
      rating: Number(body.rating ?? 5),
      comment: String(body.comment ?? ""),
      projectName: "NovaPay Mobile Banking",
      createdAt: new Date().toISOString(),
    };
    mockStore.feedback.unshift(item);
    return wrapMock(item);
  }

  // ---------- Employee ----------
  if (path === "employee/tasks") return wrapMock(mockStore.tasks);
  if (path === "employee/projects") return wrapMock(mockStore.projects);
  if (path === "employee/attendance" && method === "get") return wrapMock(mockStore.attendance);
  if (path === "employee/attendance/check-in" && method === "post") {
    const row = {
      id: cuid("att"),
      employeeId: "emp_2",
      date: new Date().toISOString().slice(0, 10),
      checkIn: new Date().toISOString(),
      checkOut: null,
      status: "PRESENT",
      workHours: null,
    };
    mockStore.attendance.unshift(row as (typeof mockStore.attendance)[number]);
    return wrapMock(row);
  }
  if (path === "employee/attendance/check-out" && method === "post") {
    if (mockStore.attendance[0]) {
      mockStore.attendance[0] = {
        ...mockStore.attendance[0],
        checkOut: new Date().toISOString(),
        workHours: 8,
      };
    }
    return wrapMock(mockStore.attendance[0] ?? null);
  }
  if (path === "employee/leave" && method === "get") return wrapMock(mockStore.leaves);
  if (path === "employee/leave" && method === "post") {
    const leave = {
      id: cuid("leave"),
      employeeId: "emp_2",
      employee: { user: { firstName: "Ishaan", lastName: "Verma" } },
      leaveType: { id: "lt_1", name: "Casual Leave" },
      startDate: String(body.startDate ?? ""),
      endDate: String(body.endDate ?? ""),
      totalDays: 1,
      reason: (body.reason as string) ?? null,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    mockStore.leaves.unshift(leave as (typeof mockStore.leaves)[number]);
    return wrapMock(leave);
  }
  if (path === "employee/salary") return wrapMock(mockStore.salarySlips.filter((s) => s.employeeId === "emp_2"));
  if (path === "employee/performance") return wrapMock(mockStore.performanceReviews.filter((r) => r.employeeId === "emp_2"));

  // ---------- Notifications ----------
  if (path === "notifications" && method === "get") return wrapMock(mockStore.notifications);
  if (path.match(/^notifications\/[^/]+\/read$/) && method === "patch") {
    const id = path.split("/")[1];
    const idx = mockStore.notifications.findIndex((n) => n.id === id);
    if (idx >= 0) mockStore.notifications[idx] = { ...mockStore.notifications[idx], isRead: true };
    return wrapMock(mockStore.notifications[idx] ?? null);
  }
  if (path === "notifications/read-all" && method === "patch") {
    mockStore.notifications = mockStore.notifications.map((n) => ({ ...n, isRead: true }));
    return wrapMock({ ok: true });
  }

  // ---------- AI ----------
  if (path.startsWith("ai/") && method === "post") {
    return wrapMock(aiResponse(path.replace(/^ai\//, ""), body));
  }

  // Public CMS intake
  if ((path === "cms/contact" || path === "cms/consultation" || path === "cms/newsletter") && method === "post") {
    return wrapMock({ ok: true, message: "Received (mock)" });
  }

  if (method === "get") {
    // Soft fallback for unknown GET lists
    return wrapMock([]);
  }

  notFound(path);
  return wrapMock(null);
}
