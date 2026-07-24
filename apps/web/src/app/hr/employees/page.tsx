"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Users, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
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
import { formatCurrency, formatDate, initialsFromName } from "@/lib/format";
import type { Employee } from "@/types";

const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"];

const employeeSchema = z.object({
  userId: z.string().min(1, "Required"),
  employeeCode: z.string().min(1, "Required"),
  department: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  employmentType: z.string().optional(),
  dateOfJoining: z.string().min(1, "Required"),
  ctc: z.coerce.number().min(0).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export default function HrEmployeesPage() {
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const employeesQuery = useApiQuery<Employee[]>(["hr", "employees"], "/hr/employees", { fallback: [], params: { limit: 100 } });

  const createEmployee = useApiMutation<EmployeeFormValues>(
    async (values) =>
      (
        await api.post("/hr/employees", {
          ...values,
          department: values.department || undefined,
          designation: values.designation || undefined,
        })
      ).data,
    { successMessage: "Employee record created.", invalidateKeys: [["hr", "employees"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(employeeSchema), defaultValues: { employmentType: "FULL_TIME" } });

  async function onSubmit(values: EmployeeFormValues) {
    await createEmployee.mutateAsync(values);
    reset({ employmentType: "FULL_TIME" });
    setDialogOpen(false);
  }

  const filtered = employeesQuery.data.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${e.user?.firstName ?? ""} ${e.user?.lastName ?? ""} ${e.employeeCode} ${e.department ?? ""}`.toLowerCase().includes(q);
  });

  const active = employeesQuery.data.filter((e) => e.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Human Resources"
        title="Employees"
        description="Manage employee records across the organization."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New employee record
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total employees" value={employeesQuery.data.length} icon={Users} loading={employeesQuery.isLoading} />
        <StatCard label="Active" value={active} loading={employeesQuery.isLoading} />
        <StatCard
          label="Avg. CTC"
          value={
            employeesQuery.data.length
              ? formatCurrency(employeesQuery.data.reduce((sum, e) => sum + Number(e.ctc ?? 0), 0) / employeesQuery.data.length)
              : "—"
          }
          loading={employeesQuery.isLoading}
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search employees..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Employee",
            render: (e) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={e.user?.avatar ?? undefined} />
                  <AvatarFallback>{initialsFromName(`${e.user?.firstName ?? "?"} ${e.user?.lastName ?? ""}`)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium leading-tight text-foreground">{e.user ? `${e.user.firstName} ${e.user.lastName}` : "—"}</p>
                  <p className="text-xs leading-tight text-muted-foreground">{e.employeeCode}</p>
                </div>
              </div>
            ),
          },
          { key: "department", header: "Department", hideOnMobile: true, render: (e) => e.department ?? "—" },
          { key: "designation", header: "Designation", hideOnMobile: true, render: (e) => e.designation ?? "—" },
          { key: "employmentType", header: "Type", hideOnMobile: true, render: (e) => <StatusBadge status={e.employmentType} toneOverride="neutral" /> },
          { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
          { key: "dateOfJoining", header: "Joined", hideOnMobile: true, render: (e) => formatDate(e.dateOfJoining) },
        ]}
        data={filtered}
        keyField={(e) => e.id}
        isLoading={employeesQuery.isLoading}
        isError={employeesQuery.isUnavailable}
        errorMessage={employeesQuery.errorMessage}
        onRetry={() => employeesQuery.refetch()}
        emptyTitle="No employee records yet"
        emptyDescription="Create an employee record to start tracking HR data."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New employee record</DialogTitle>
            <DialogDescription>Link an existing user account to a new employee profile.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="userId">User ID</Label>
                <Input id="userId" placeholder="Existing user ID" {...register("userId")} />
                {errors.userId && <p className="text-xs text-destructive">{errors.userId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="employeeCode">Employee code</Label>
                <Input id="employeeCode" placeholder="e.g. EMP-1024" {...register("employeeCode")} />
                {errors.employeeCode && <p className="text-xs text-destructive">{errors.employeeCode.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...register("department")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" {...register("designation")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Employment type</Label>
                <Controller
                  control={control}
                  name="employmentType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ctc">CTC (annual)</Label>
                <Input id="ctc" type="number" min={0} step="0.01" {...register("ctc")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateOfJoining">Date of joining</Label>
              <Input id="dateOfJoining" type="date" {...register("dateOfJoining")} />
              {errors.dateOfJoining && <p className="text-xs text-destructive">{errors.dateOfJoining.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
