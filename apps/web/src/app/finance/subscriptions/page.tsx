"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, RefreshCcw, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
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
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import type { ApiUser, Subscription } from "@/types";

const BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "YEARLY"];

const subscriptionSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  planName: z.string().min(1, "Required"),
  amount: z.coerce.number().min(0),
  currency: z.string().optional(),
  billingCycle: z.string().optional(),
  nextBillingDate: z.string().optional(),
});
type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export default function FinanceSubscriptionsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const subscriptionsQuery = useApiQuery<Subscription[]>(["finance", "subscriptions"], "/finance/subscriptions", {
    fallback: [],
    params: { limit: 100 },
  });
  const usersQuery = useApiQuery<ApiUser[]>(["finance", "clients", "for-select"], "/users", {
    fallback: [],
    params: { limit: 100 },
  });
  const clients = usersQuery.data.filter((u) => u.role === "CLIENT");

  const createSubscription = useApiMutation<SubscriptionFormValues>(
    async (values) => (await api.post("/finance/subscriptions", values)).data,
    { successMessage: "Subscription created.", invalidateKeys: [["finance", "subscriptions"]] }
  );

  const cancelSubscription = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.patch(`/finance/subscriptions/${id}/cancel`)).data,
    { successMessage: "Subscription cancelled.", invalidateKeys: [["finance", "subscriptions"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(subscriptionSchema), defaultValues: { billingCycle: "MONTHLY" } });

  async function onSubmit(values: SubscriptionFormValues) {
    await createSubscription.mutateAsync(values);
    reset({ billingCycle: "MONTHLY" });
    setDialogOpen(false);
  }

  const activeCount = subscriptionsQuery.data.filter((s) => s.status === "ACTIVE").length;
  const mrr = subscriptionsQuery.data.filter((s) => s.status === "ACTIVE").reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Subscriptions"
        description="Manage recurring billing plans for retainer clients."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New subscription
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active subscriptions" value={activeCount} icon={RefreshCcw} loading={subscriptionsQuery.isLoading} />
        <StatCard label="Monthly recurring revenue" value={formatCurrency(mrr)} loading={subscriptionsQuery.isLoading} />
        <StatCard label="Total plans" value={subscriptionsQuery.data.length} loading={subscriptionsQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          { key: "planName", header: "Plan" },
          { key: "client", header: "Client", render: (s) => (s.client ? `${s.client.firstName} ${s.client.lastName}` : "—") },
          { key: "amount", header: "Amount", render: (s) => formatCurrency(s.amount, s.currency) },
          { key: "billingCycle", header: "Cycle", hideOnMobile: true, render: (s) => titleCase(s.billingCycle) },
          { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
          { key: "nextBillingDate", header: "Next billing", hideOnMobile: true, render: (s) => (s.nextBillingDate ? formatDate(s.nextBillingDate) : "—") },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (s) =>
              s.status === "ACTIVE" ? (
                <Button size="sm" variant="outline" onClick={() => cancelSubscription.mutate({ id: s.id })}>
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              ) : null,
          },
        ]}
        data={subscriptionsQuery.data}
        keyField={(s) => s.id}
        isLoading={subscriptionsQuery.isLoading}
        isError={subscriptionsQuery.isUnavailable}
        errorMessage={subscriptionsQuery.errorMessage}
        onRetry={() => subscriptionsQuery.refetch()}
        emptyTitle="No subscriptions yet"
        emptyDescription="Set up a recurring plan for a retainer client."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New subscription</DialogTitle>
            <DialogDescription>Set up a recurring billing plan for a client.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="planName">Plan name</Label>
              <Input id="planName" placeholder="Growth retainer" {...register("planName")} />
              {errors.planName && <p className="text-xs text-destructive">{errors.planName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" min={0} step="0.01" {...register("amount")} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Billing cycle</Label>
                <Controller
                  control={control}
                  name="billingCycle"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BILLING_CYCLES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {titleCase(c)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nextBillingDate">Next billing date</Label>
              <Input id="nextBillingDate" type="date" {...register("nextBillingDate")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create subscription
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
