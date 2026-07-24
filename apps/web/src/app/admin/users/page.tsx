"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Trash2, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate, initialsFromName } from "@/lib/format";
import type { ApiUser } from "@/types";
import type { UserRole } from "@/lib/auth-store";

const ROLE_OPTIONS: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "HR",
  "PROJECT_MANAGER",
  "DEVELOPER",
  "DESIGNER",
  "QA",
  "CLIENT",
];

const inviteSchema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^a-zA-Z0-9]/),
  role: z.enum(ROLE_OPTIONS as [UserRole, ...UserRole[]]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function AdminUsersPage() {
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const usersQuery = useApiQuery<ApiUser[]>(["admin", "users"], "/users", {
    fallback: [],
    params: { limit: 100 },
  });

  const createUser = useApiMutation<InviteFormValues, ApiUser>(
    async (values) => (await api.post("/users", values)).data,
    { successMessage: "User invited successfully.", invalidateKeys: [["admin", "users"]] }
  );

  const toggleActive = useApiMutation<{ id: string; isActive: boolean }>(
    async ({ id, isActive }) => (await api.patch(`/users/${id}`, { isActive })).data,
    { successMessage: "User updated.", invalidateKeys: [["admin", "users"]] }
  );

  const deleteUser = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.delete(`/users/${id}`)).data,
    { successMessage: "User removed.", invalidateKeys: [["admin", "users"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "CLIENT" },
  });

  async function onSubmit(values: InviteFormValues) {
    await createUser.mutateAsync(values);
    reset();
    setDialogOpen(false);
  }

  const filtered = usersQuery.data.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="User management"
        description="Invite teammates, assign roles and manage account access."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Invite user
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "User",
            render: (u) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={u.avatar ?? undefined} alt={u.firstName} />
                  <AvatarFallback>{initialsFromName(`${u.firstName} ${u.lastName}`)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium leading-tight text-foreground">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-xs leading-tight text-muted-foreground">{u.email}</p>
                </div>
              </div>
            ),
          },
          { key: "role", header: "Role", render: (u) => <StatusBadge status={u.role} toneOverride="info" /> },
          {
            key: "status",
            header: "Status",
            render: (u) => <StatusBadge status={u.isActive ? "ACTIVE" : "SUSPENDED"} />,
          },
          {
            key: "lastLoginAt",
            header: "Last login",
            hideOnMobile: true,
            render: (u) => (u.lastLoginAt ? formatDate(u.lastLoginAt, "MMM d, yyyy h:mm a") : "Never"),
          },
          { key: "createdAt", header: "Joined", hideOnMobile: true, render: (u) => formatDate(u.createdAt) },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (u) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  title={u.isActive ? "Suspend user" : "Activate user"}
                  onClick={() => toggleActive.mutate({ id: u.id, isActive: !u.isActive })}
                >
                  {u.isActive ? (
                    <ShieldOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Remove user"
                  onClick={() => deleteUser.mutate({ id: u.id })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        keyField={(u) => u.id}
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isUnavailable}
        errorMessage={usersQuery.errorMessage}
        onRetry={() => usersQuery.refetch()}
        emptyTitle="No users found"
        emptyDescription="Invite your first teammate to get started."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a new user</DialogTitle>
            <DialogDescription>They&apos;ll receive access credentials for the platform.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Temporary password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-xs text-destructive">Use 8+ chars with upper, lower, number & symbol.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Send invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
