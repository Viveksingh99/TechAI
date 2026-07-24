"use client";

import * as React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
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
import type { ApiUser, Quotation } from "@/types";

const quotationSchema = z.object({
  title: z.string().min(1, "Required"),
  clientId: z.string().optional(),
  validUntil: z.string().optional(),
  tax: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
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
type QuotationFormValues = z.infer<typeof quotationSchema>;

export default function FinanceQuotationsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const quotationsQuery = useApiQuery<Quotation[]>(["finance", "quotations"], "/finance/quotations", {
    fallback: [],
    params: { limit: 100 },
  });
  const usersQuery = useApiQuery<ApiUser[]>(["finance", "clients", "for-select"], "/users", {
    fallback: [],
    params: { limit: 100 },
  });
  const clients = usersQuery.data.filter((u) => u.role === "CLIENT");

  const createQuotation = useApiMutation<QuotationFormValues>(
    async (values) => (await api.post("/finance/quotations", values)).data,
    { successMessage: "Quotation created.", invalidateKeys: [["finance", "quotations"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: { items: [{ description: "", quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(values: QuotationFormValues) {
    await createQuotation.mutateAsync(values);
    reset({ items: [{ description: "", quantity: 1, unitPrice: 0 }] });
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Quotations"
        description="Draft and send price quotes to prospective clients."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New quotation
          </Button>
        }
      />

      <DataTable
        columns={[
          { key: "quotationNumber", header: "Quote #" },
          { key: "title", header: "Title" },
          { key: "total", header: "Amount", render: (q) => formatCurrency(q.total, q.currency) },
          { key: "status", header: "Status", render: (q) => <StatusBadge status={q.status} /> },
          { key: "validUntil", header: "Valid until", hideOnMobile: true, render: (q) => (q.validUntil ? formatDate(q.validUntil) : "—") },
          { key: "createdAt", header: "Created", hideOnMobile: true, render: (q) => formatDate(q.createdAt) },
        ]}
        data={quotationsQuery.data}
        keyField={(q) => q.id}
        isLoading={quotationsQuery.isLoading}
        isError={quotationsQuery.isUnavailable}
        errorMessage={quotationsQuery.errorMessage}
        onRetry={() => quotationsQuery.refetch()}
        emptyTitle="No quotations yet"
        emptyDescription="Create a quotation to send pricing to a prospect."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New quotation</DialogTitle>
            <DialogDescription>Draft a price quote for a client or prospect.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Website redesign" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client (optional)</Label>
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
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="validUntil">Valid until</Label>
                <Input id="validUntil" type="date" {...register("validUntil")} />
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
                Create quotation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
