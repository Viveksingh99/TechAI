"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Banknote, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatCurrency } from "@/lib/format";
import type { Employee, SalarySlip } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const salarySchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000),
  basicSalary: z.coerce.number().min(0),
  allowances: z.coerce.number().min(0).optional(),
  deductions: z.coerce.number().min(0).optional(),
  bonus: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
});
type SalaryFormValues = z.infer<typeof salarySchema>;

export default function HrPayrollPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const slipsQuery = useApiQuery<SalarySlip[]>(["hr", "salary-slips"], "/hr/salary-slips", { fallback: [], params: { limit: 100 } });
  const employeesQuery = useApiQuery<Employee[]>(["hr", "employees", "for-select"], "/hr/employees", {
    fallback: [],
    params: { limit: 100 },
  });

  const createSlip = useApiMutation<SalaryFormValues>(
    async (values) => (await api.post("/hr/salary-slips", values)).data,
    { successMessage: "Salary slip generated.", invalidateKeys: [["hr", "salary-slips"]] }
  );

  const markPaid = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.patch(`/hr/salary-slips/${id}/mark-paid`)).data,
    { successMessage: "Marked as paid.", invalidateKeys: [["hr", "salary-slips"]] }
  );

  const now = new Date();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(salarySchema),
    defaultValues: { month: now.getMonth() + 1, year: now.getFullYear() },
  });

  async function onSubmit(values: SalaryFormValues) {
    await createSlip.mutateAsync(values);
    reset({ month: now.getMonth() + 1, year: now.getFullYear() });
    setDialogOpen(false);
  }

  const totalPayout = slipsQuery.data.reduce((sum, s) => sum + Number(s.netSalary), 0);
  const pendingCount = slipsQuery.data.filter((s) => s.status !== "PAID").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Human Resources"
        title="Payroll"
        description="Generate, review and disburse monthly salary slips."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Generate slip
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total slips" value={slipsQuery.data.length} icon={Banknote} loading={slipsQuery.isLoading} />
        <StatCard label="Pending payouts" value={pendingCount} loading={slipsQuery.isLoading} />
        <StatCard label="Total net payout" value={formatCurrency(totalPayout)} loading={slipsQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "employee", header: "Employee", render: (s) => (s.employee?.user ? `${s.employee.user.firstName} ${s.employee.user.lastName}` : "—") },
          { key: "period", header: "Period", render: (s) => `${MONTHS[s.month - 1] ?? s.month} ${s.year}` },
          { key: "basicSalary", header: "Basic", hideOnMobile: true, render: (s) => formatCurrency(s.basicSalary) },
          { key: "netSalary", header: "Net pay", render: (s) => formatCurrency(s.netSalary) },
          { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (s) =>
              s.status !== "PAID" ? (
                <Button size="sm" variant="outline" onClick={() => markPaid.mutate({ id: s.id })}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark paid
                </Button>
              ) : null,
          },
        ]}
        data={slipsQuery.data}
        keyField={(s) => s.id}
        isLoading={slipsQuery.isLoading}
        isError={slipsQuery.isUnavailable}
        errorMessage={slipsQuery.errorMessage}
        onRetry={() => slipsQuery.refetch()}
        emptyTitle="No salary slips yet"
        emptyDescription="Generate the first salary slip to start running payroll."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate salary slip</DialogTitle>
            <DialogDescription>Create a monthly salary slip for an employee.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Controller
                control={control}
                name="employeeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeesQuery.data.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.user ? `${e.user.firstName} ${e.user.lastName}` : e.employeeCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="month">Month</Label>
                <Input id="month" type="number" min={1} max={12} {...register("month")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" min={2000} {...register("year")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="basicSalary">Basic salary</Label>
                <Input id="basicSalary" type="number" min={0} step="0.01" {...register("basicSalary")} />
                {errors.basicSalary && <p className="text-xs text-destructive">{errors.basicSalary.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="allowances">Allowances</Label>
                <Input id="allowances" type="number" min={0} step="0.01" {...register("allowances")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="deductions">Deductions</Label>
                <Input id="deductions" type="number" min={0} step="0.01" {...register("deductions")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bonus">Bonus</Label>
                <Input id="bonus" type="number" min={0} step="0.01" {...register("bonus")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tax">Tax</Label>
              <Input id="tax" type="number" min={0} step="0.01" {...register("tax")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Generate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
