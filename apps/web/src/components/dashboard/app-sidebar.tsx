"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import { useAuthStore, ROLE_LABELS } from "@/lib/auth-store";
import {
  getPanelForPath,
  getWorkspacesForRole,
  PANEL_NAV,
  type PanelKey,
} from "@/config/navigation";

function SidebarBody({ activePanel, onNavigate }: { activePanel: PanelKey; onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const workspaces = getWorkspacesForRole(user?.role);
  const panel = PANEL_NAV[activePanel];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] shrink-0 items-center gap-2 border-b border-border px-5">
        <BrandLogo href="/dashboard" size="md" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2.5 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {panel.label}
        </p>
        <nav className="flex flex-col gap-0.5">
          {panel.items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {workspaces.length > 1 && (
          <div className="mt-6">
            <p className="flex items-center gap-1.5 px-2.5 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <LayoutGrid className="h-3.5 w-3.5" />
              Workspaces
            </p>
            <nav className="flex flex-col gap-0.5">
              {workspaces.map((ws) => (
                <Link
                  key={ws.key}
                  href={ws.basePath}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-2.5 py-2 text-sm font-medium transition-colors",
                    activePanel === ws.key
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {ws.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="rounded-xl bg-secondary/50 px-3 py-2.5 text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user ? ROLE_LABELS[user.role] : ""}</span>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const workspaces = getWorkspacesForRole(user?.role);
  const activePanel = getPanelForPath(pathname)?.key ?? workspaces[0]?.key ?? "client";

  return (
    <>
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card/60">
        <SidebarBody activePanel={activePanel} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in-0"
            onClick={onClose}
            aria-hidden
          />
          <div className="relative z-10 flex h-full w-72 flex-col bg-card shadow-xl animate-in fade-in-0">
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarBody activePanel={activePanel} onNavigate={onClose} />
          </div>
        </div>
      )}
    </>
  );
}
