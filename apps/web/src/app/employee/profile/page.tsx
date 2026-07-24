"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { useAuthStore, getUserDisplayName, getUserInitials, ROLE_LABELS } from "@/lib/auth-store";
import { formatDate } from "@/lib/format";

const profileSchema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  phone: z.string().optional().or(z.literal("")),
  avatar: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number")
      .regex(/[^a-zA-Z0-9]/, "Add a symbol"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function EmployeeProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      avatar: user?.avatar ?? "",
    },
  });

  const updateProfile = useApiMutation<ProfileFormValues>(
    async (values) => (await api.patch("/users/profile/me", values)).data,
    {
      successMessage: "Profile updated successfully.",
      onSuccess: (data) => {
        const updated = data as unknown as typeof user;
        if (updated && user) {
          setAuth({
            user: { ...user, ...updated },
            accessToken: useAuthStore.getState().accessToken ?? "",
            refreshToken: useAuthStore.getState().refreshToken ?? undefined,
          });
        }
      },
    }
  );

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const changePassword = useApiMutation<{ currentPassword: string; newPassword: string }>(
    async (values) => (await api.patch("/users/profile/change-password", values)).data,
    { successMessage: "Password changed successfully." }
  );

  async function onProfileSubmit(values: ProfileFormValues) {
    await updateProfile.mutateAsync(values);
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    await changePassword.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword });
    resetPassword();
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="My Workspace" title="Profile" description="Manage your personal information and account security." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatar ?? undefined} alt={getUserDisplayName(user)} />
              <AvatarFallback className="text-lg">{getUserInitials(user)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">{getUserDisplayName(user) || "—"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-secondary/40 px-2.5 py-1">
                {user?.role ? ROLE_LABELS[user.role] : "—"}
              </span>
              {user?.createdAt && (
                <span className="rounded-full border border-border bg-secondary/40 px-2.5 py-1">
                  Joined {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>Update your name, contact number and avatar.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" {...register("firstName")} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" {...register("lastName")} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email ?? ""} disabled />
                  <p className="text-xs text-muted-foreground">Your email address can&apos;t be changed.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" placeholder="+1 555 000 0000" {...register("phone")} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input id="avatar" placeholder="https://..." {...register("avatar")} />
                  {errors.avatar && <p className="text-xs text-destructive">{errors.avatar.message}</p>}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Use a strong, unique password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input id="confirmPassword" type="password" {...registerPassword("confirmPassword")} />
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline" disabled={isChangingPassword}>
                    {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Update password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
