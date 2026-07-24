import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
