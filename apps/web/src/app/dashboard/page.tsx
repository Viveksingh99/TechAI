"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { getRoleHome } from "@/config/navigation";

export default function DashboardRouterPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    router.replace(getRoleHome(role));
  }, [mounted, isAuthenticated, role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
