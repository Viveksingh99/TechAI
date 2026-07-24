import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function PmLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
