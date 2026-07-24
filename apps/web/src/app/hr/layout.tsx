import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
