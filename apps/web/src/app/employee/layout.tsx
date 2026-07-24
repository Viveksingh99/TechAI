import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
