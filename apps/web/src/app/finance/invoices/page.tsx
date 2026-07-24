"use client";

import * as React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Receipt, Trash2, CheckCircle2 } from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/format";
import type { ApiUser, Invoice } from "@/types";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  dueDate: z.string().min(1, "Required"),
  tax: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
  currency: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Required"),
        quantity: z.coerce.number().min(0.01),
        unitPrice: z.coerce.number().min(0),
      })
    )
    .min(1, "Add at least one item"),
});
type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function FinanceInvoicesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const invoicesQuery = useApiQuery<Invoice[]>(["finance", "invoices"], "/finance/invoices", { fallback: [], params: { limit: 100 } });
  const usersQuery = useApiQuery<ApiUser[]>(["finance", "clients", "for-select"], "/users", {
    fallback: [],
    params: { limit: 100 },
  });
  const clients = usersQuery.data.filter((u) => u.role === "CLIENT");

  const createInvoice = useApiMutation<InvoiceFormValues>(
    async (values) => (await api.post("/finance/invoices", { ...values, currency: values.currency || undefined })).data,
    { successMessage: "Invoice created.", invalidateKeys: [["finance", "invoices"]] }
  );

  const markPaid = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.patch(`/finance/invoices/${id}/mark-paid`)).data,
    { successMessage: "Invoice marked as paid.", invalidateKeys: [["finance", "invoices"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { currency: "USD", items: [{ description: "", quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(values: InvoiceFormValues) {
    await createInvoice.mutateAsync(values);
    reset({ currency: "USD", items: [{ description: "", quantity: 1, unitPrice: 0 }] });
    setDialogOpen(false);
  }

  const outstanding = invoicesQuery.data
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + (Number(i.total) - Number(i.amountPaid ?? 0)), 0);
  const overdue = invoicesQuery.data.filter((i) => i.status === "OVERDUE").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Invoices"
        description="Bill clients and track payment status."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total invoices" value={invoicesQuery.data.length} icon={Receipt} loading={invoicesQuery.isLoading} />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} loading={invoicesQuery.isLoading} />
        <StatCard label="Overdue" value={overdue} loading={invoicesQuery.isLoading} hint={overdue > 0 ? "Needs attention" : "All clear"} />
      </div>

      <DataTable
        columns={[
          { key: "invoiceNumber", header: "Invoice #" },
          { key: "client", header: "Client", render: (i) => (i.client ? `${i.client.firstName} ${i.client.lastName}` : "—") },
          { key: "project", header: "Project", hideOnMobile: true, render: (i) => i.project?.name ?? "—" },
          { key: "total", header: "Amount", render: (i) => formatCurrency(i.total, i.currency) },
          { key: "status", header: "Status", render: (i) => <StatusBadge status={i.status} /> },
          { key: "dueDate", header: "Due", hideOnMobile: true, render: (i) => formatDate(i.dueDate) },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (i) =>
              i.status !== "PAID" && i.status !== "CANCELLED" ? (
                <Button size="sm" variant="outline" onClick={() => markPaid.mutate({ id: i.id })}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark paid
                </Button>
              ) : null,
          },
        ]}
        data={invoicesQuery.data}
        keyField={(i) => i.id}
        isLoading={invoicesQuery.isLoading}
        isError={invoicesQuery.isUnavailable}
        errorMessage={invoicesQuery.errorMessage}
        onRetry={() => invoicesQuery.refetch()}
        emptyTitle="No invoices yet"
        emptyDescription="Create your first invoice to start billing clients."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New invoice</DialogTitle>
            <DialogDescription>Bill a client for delivered work.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client</Label>
                <Controller
                  control={control}
                  name="clientId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.firstName} {c.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dueDate">Due date</Label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
                {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Line items</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
                  <Plus className="h-3.5 w-3.5" />
                  Add item
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_70px_90px_32px] gap-2">
                  <Input placeholder="Description" {...register(`items.${index}.description`)} />
                  <Input type="number" min={0} step="0.01" placeholder="Qty" {...register(`items.${index}.quantity`)} />
                  <Input type="number" min={0} step="0.01" placeholder="Price" {...register(`items.${index}.unitPrice`)} />
                  <Button type="button" size="icon" variant="ghost" onClick={() => fields.length > 1 && remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {errors.items && typeof errors.items.message === "string" && (
                <p className="text-xs text-destructive">{errors.items.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tax">Tax</Label>
                <Input id="tax" type="number" min={0} step="0.01" {...register("tax")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount">Discount</Label>
                <Input id="discount" type="number" min={0} step="0.01" {...register("discount")} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
