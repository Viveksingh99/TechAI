import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
