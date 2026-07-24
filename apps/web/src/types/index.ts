export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  clientId?: string | null;
  client?: { id: string; firstName: string; lastName: string } | null;
  managerId?: string | null;
  manager?: { id: string; firstName: string; lastName: string } | null;
  status: string;
  priority: string;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | string | null;
  progress: number;
  createdAt: string;
  membersCount?: number;
}

export interface Task {
  id: string;
  projectId: string;
  project?: { id: string; name: string };
  sprintId?: string | null;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assigneeId?: string | null;
  assignee?: { id: string; firstName: string; lastName: string } | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
  tags?: string[];
  createdAt: string;
}

export interface Bug {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  severity: string;
  status: string;
  assignee?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId?: string | null;
  task?: { id: string; title: string } | null;
  userId: string;
  user?: { firstName: string; lastName: string } | null;
  description?: string | null;
  startTime: string;
  endTime?: string | null;
  durationMinutes?: number | null;
  isBillable: boolean;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string; email?: string; avatar?: string | null };
  role?: string | null;
}

export interface ProjectActivity {
  id: string;
  action: string;
  entity?: string | null;
  description?: string | null;
  user?: { firstName: string; lastName: string } | null;
  createdAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
}

export interface Lead {
  id: string;
  title: string;
  company?: { id: string; name: string } | null;
  contact?: { id: string; firstName: string; lastName: string } | null;
  email?: string | null;
  phone?: string | null;
  source: string;
  status: string;
  assignedTo?: { id: string; firstName: string; lastName: string } | null;
  estimatedValue?: number | string | null;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  company?: { id: string; name: string } | null;
  stage?: { id: string; name: string; order: number } | null;
  stageId: string;
  value: number | string;
  currency: string;
  status: string;
  owner?: { id: string; firstName: string; lastName: string } | null;
  expectedCloseDate?: string | null;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  designation?: string | null;
  company?: { id: string; name: string } | null;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  dueDate: string;
  notes?: string | null;
  status: string;
  lead?: { id: string; title: string } | null;
  deal?: { id: string; title: string } | null;
  contact?: { id: string; firstName: string; lastName: string } | null;
  assignedTo?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  user?: { firstName: string; lastName: string; email: string; avatar?: string | null };
  employeeCode: string;
  department?: string | null;
  designation?: string | null;
  employmentType: string;
  status: string;
  dateOfJoining: string;
  ctc?: number | string | null;
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  workHours?: number | null;
}

export interface Leave {
  id: string;
  employeeId: string;
  employee?: { user?: { firstName: string; lastName: string } };
  leaveType?: { id: string; name: string };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string | null;
  status: string;
  createdAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  description?: string | null;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewer?: { user?: { firstName: string; lastName: string } };
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  rating: number;
  strengths?: string | null;
  improvements?: string | null;
  goals?: string | null;
  status: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  employmentType: string;
  status: string;
  openings: number;
  description?: string | null;
  applications?: JobApplication[] | number;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  jobPosting?: { id: string; title: string } | null;
  fullName: string;
  email: string;
  phone?: string | null;
  resumeUrl: string;
  coverLetter?: string | null;
  portfolioUrl?: string | null;
  source?: string | null;
  status: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  interviewer?: { firstName: string; lastName: string } | null;
  status: string;
  feedback?: string | null;
  rating?: number | null;
}

export interface JobOffer {
  id: string;
  applicationId: string;
  designation: string;
  ctc: number | string;
  joiningDate: string;
  status: string;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  employee?: { user?: { firstName: string; lastName: string } };
  month: number;
  year: number;
  basicSalary: number | string;
  allowances?: number | string | null;
  deductions?: number | string | null;
  bonus?: number | string | null;
  tax?: number | string | null;
  netSalary: number | string;
  status: string;
  paidOn?: string | null;
  createdAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client?: { id: string; firstName: string; lastName: string } | null;
  project?: { id: string; name: string } | null;
  subtotal: number | string;
  tax: number | string;
  discount: number | string;
  total: number | string;
  amountPaid: number | string;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  title: string;
  total: number | string;
  currency: string;
  status: string;
  validUntil?: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number | string;
  currency: string;
  project?: { id: string; name: string } | null;
  submittedBy?: { firstName: string; lastName: string } | null;
  expenseDate: string;
  isApproved: boolean;
}

export interface Subscription {
  id: string;
  planName: string;
  client?: { id: string; firstName: string; lastName: string } | null;
  amount: number | string;
  currency: string;
  billingCycle: string;
  status: string;
  nextBillingDate?: string | null;
}

export interface Contract {
  id: string;
  title: string;
  contractNumber: string;
  value: number | string;
  status: string;
  startDate: string;
  endDate?: string | null;
  signedAt?: string | null;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  raisedBy?: { firstName: string; lastName: string } | null;
  assignedTo?: { firstName: string; lastName: string } | null;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  location?: string | null;
  meetingLink?: string | null;
  status: string;
  organizer?: { firstName: string; lastName: string } | null;
}

export interface CmsCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
}

export interface CmsTag {
  id: string;
  name: string;
  slug?: string;
}

export interface SeoSettings {
  id?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  status: string;
  isFeatured: boolean;
  viewCount: number;
  author?: { firstName: string; lastName: string } | null;
  category?: CmsCategory | null;
  tags?: CmsTag[];
  publishedAt?: string | null;
  createdAt: string;
  seo?: SeoSettings | null;
}

export interface Media {
  id: string;
  fileName: string;
  url: string;
  type: string;
  mimeType?: string | null;
  size?: number | null;
  altText?: string | null;
  uploadedBy?: { firstName: string; lastName: string } | null;
  createdAt: string;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  seo?: SeoSettings | null;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  description?: string | null;
  user?: { firstName: string; lastName: string } | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: { firstName: string; lastName: string; avatar?: string | null };
  createdAt: string;
  isRead: boolean;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  isCompleted: boolean;
  order: number;
}

export interface ProjectDocument {
  id: string;
  name: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  permissionsCount?: number;
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description?: string | null;
}
