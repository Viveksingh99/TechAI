import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
