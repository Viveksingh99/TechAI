import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SALES"
  | "HR"
  | "PROJECT_MANAGER"
  | "DEVELOPER"
  | "DESIGNER"
  | "QA"
  | "CLIENT";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: {
    user: AuthUser;
    accessToken: string;
    refreshToken?: string;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          accessToken,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "techai-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export function getUserDisplayName(user: AuthUser | null | undefined): string {
  if (!user) return "";
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
}

export function getUserInitials(user: AuthUser | null | undefined): string {
  if (!user) return "?";
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES: "Sales",
  HR: "HR",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer",
  DESIGNER: "Designer",
  QA: "QA Engineer",
  CLIENT: "Client",
};
