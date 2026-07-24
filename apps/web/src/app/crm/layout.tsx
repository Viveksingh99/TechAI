import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
