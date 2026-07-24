import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
