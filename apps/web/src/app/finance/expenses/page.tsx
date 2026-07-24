"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Receipt, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/types";

const expenseSchema = z.object({
  title: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  amount: z.coerce.number().min(0),
  currency: z.string().optional(),
  expenseDate: z.string().min(1, "Required"),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
});
type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function FinanceExpensesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const expensesQuery = useApiQuery<Expense[]>(["finance", "expenses"], "/finance/expenses", {
    fallback: [],
    params: { limit: 100 },
  });

  const createExpense = useApiMutation<ExpenseFormValues>(
    async (values) => (await api.post("/finance/expenses", values)).data,
    { successMessage: "Expense recorded.", invalidateKeys: [["finance", "expenses"]] }
  );

  const approveExpense = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.patch(`/finance/expenses/${id}/approve`)).data,
    { successMessage: "Expense approved.", invalidateKeys: [["finance", "expenses"]] }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(expenseSchema) });

  async function onSubmit(values: ExpenseFormValues) {
    await createExpense.mutateAsync(values);
    reset();
    setDialogOpen(false);
  }

  const totalAmount = expensesQuery.data.reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingCount = expensesQuery.data.filter((e) => !e.isApproved).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Expenses"
        description="Track and approve business and project expenses."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Log expense
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total expenses" value={formatCurrency(totalAmount)} icon={Receipt} loading={expensesQuery.isLoading} />
        <StatCard label="Pending approval" value={pendingCount} loading={expensesQuery.isLoading} />
        <StatCard label="Records" value={expensesQuery.data.length} loading={expensesQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "title", header: "Title" },
          { key: "category", header: "Category" },
          { key: "amount", header: "Amount", render: (e) => formatCurrency(e.amount, e.currency) },
          { key: "project", header: "Project", hideOnMobile: true, render: (e) => e.project?.name ?? "—" },
          { key: "expenseDate", header: "Date", hideOnMobile: true, render: (e) => formatDate(e.expenseDate) },
          {
            key: "isApproved",
            header: "Status",
            render: (e) =>
              e.isApproved ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending</span>
              ),
          },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (e) =>
              !e.isApproved ? (
                <Button size="sm" variant="outline" onClick={() => approveExpense.mutate({ id: e.id })}>
                  Approve
                </Button>
              ) : null,
          },
        ]}
        data={expensesQuery.data}
        keyField={(e) => e.id}
        isLoading={expensesQuery.isLoading}
        isError={expensesQuery.isUnavailable}
        errorMessage={expensesQuery.errorMessage}
        onRetry={() => expensesQuery.refetch()}
        emptyTitle="No expenses recorded"
        emptyDescription="Log a business expense to keep track of spending."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log expense</DialogTitle>
            <DialogDescription>Record a new business or project expense.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Office supplies" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Operations" {...register("category")} />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" min={0} step="0.01" {...register("amount")} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expenseDate">Date</Label>
              <Input id="expenseDate" type="date" {...register("expenseDate")} />
              {errors.expenseDate && <p className="text-xs text-destructive">{errors.expenseDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Save expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
