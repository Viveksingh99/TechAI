"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Bell, Menu, Search, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuthStore, getUserDisplayName, getUserInitials, ROLE_LABELS } from "@/lib/auth-store";
import { getRoleHome } from "@/config/navigation";
import { useApiQuery } from "@/hooks/use-api";
import { formatRelativeTime } from "@/lib/format";
import { EmptyState } from "@/components/dashboard/empty-state";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string | null;
}

export function AppTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data: notifications, isLoading } = useApiQuery<NotificationItem[]>(
    ["notifications", "recent"],
    "/notifications",
    { fallback: [], params: { limit: 8 } }
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function handleLogout() {
    clearAuth();
    Cookies.remove("access_token");
    router.push("/login");
  }

  const profileHref = user ? getRoleHome(user.role) : "/login";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-lg sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMenu} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search projects, tasks, people..."
          className="h-10 w-full rounded-full border border-input bg-secondary/40 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-secondary"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-0" align="end">
            <div className="border-b border-border px-4 py-3">
              <p className="font-display text-sm font-semibold text-foreground">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5">
              {isLoading ? (
                <div className="space-y-2 p-3">
                  <div className="h-12 animate-pulse rounded-lg bg-muted" />
                  <div className="h-12 animate-pulse rounded-lg bg-muted" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-3 py-6">
                  <EmptyState
                    title="You're all caught up"
                    description="New notifications will show up here."
                    className="border-none bg-transparent py-4"
                  />
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-sm hover:bg-secondary"
                  >
                    <span className="font-medium text-foreground">{n.title}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
                    <span className="text-[11px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-secondary">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar ?? undefined} alt={getUserDisplayName(user)} />
                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left text-sm sm:block">
                <span className="block max-w-[9rem] truncate font-medium leading-tight text-foreground">
                  {getUserDisplayName(user) || "Account"}
                </span>
                <span className="block text-xs leading-tight text-muted-foreground">
                  {user ? ROLE_LABELS[user.role] : ""}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push(profileHref)}>
              <UserIcon className="h-4 w-4" />
              Dashboard home
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/employee/profile")}>
              <Settings className="h-4 w-4" />
              Account settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
