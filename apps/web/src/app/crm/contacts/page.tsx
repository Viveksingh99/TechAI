"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Contact2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { Contact, Company } from "@/types";

const contactSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  companyId: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function CrmContactsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const contactsQuery = useApiQuery<Contact[]>(["crm", "contacts"], "/crm/contacts", { fallback: [], params: { limit: 100 } });
  const companiesQuery = useApiQuery<Company[]>(["crm", "companies", "for-select"], "/crm/companies", {
    fallback: [],
    params: { limit: 100 },
  });

  const createContact = useApiMutation<ContactFormValues>(
    async (values) =>
      (
        await api.post("/crm/contacts", {
          ...values,
          lastName: values.lastName || undefined,
          email: values.email || undefined,
          phone: values.phone || undefined,
          designation: values.designation || undefined,
          companyId: values.companyId || undefined,
        })
      ).data,
    { successMessage: "Contact created.", invalidateKeys: [["crm", "contacts"]] }
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactFormValues) {
    await createContact.mutateAsync(values);
    reset();
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales CRM"
        title="Contacts"
        description="Every person associated with your prospects and clients."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New contact
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total contacts" value={contactsQuery.data.length} icon={Contact2} loading={contactsQuery.isLoading} />
        <StatCard label="Linked companies" value={companiesQuery.data.length} loading={companiesQuery.isLoading} />
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Contact",
            render: (c) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initialsFromName(`${c.firstName} ${c.lastName ?? ""}`)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium leading-tight text-foreground">{c.firstName} {c.lastName}</p>
                  <p className="text-xs leading-tight text-muted-foreground">{c.email ?? c.phone ?? "—"}</p>
                </div>
              </div>
            ),
          },
          { key: "designation", header: "Designation", hideOnMobile: true, render: (c) => c.designation ?? "—" },
          { key: "company", header: "Company", render: (c) => c.company?.name ?? "—" },
          { key: "createdAt", header: "Added", hideOnMobile: true, render: (c) => formatDate(c.createdAt) },
        ]}
        data={contactsQuery.data}
        keyField={(c) => c.id}
        isLoading={contactsQuery.isLoading}
        isError={contactsQuery.isUnavailable}
        errorMessage={contactsQuery.errorMessage}
        onRetry={() => contactsQuery.refetch()}
        emptyTitle="No contacts yet"
        emptyDescription="Add your first contact to start building relationships."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New contact</DialogTitle>
            <DialogDescription>Add a person to your CRM.</DialogDescription>
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
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" placeholder="e.g. VP of Engineering" {...register("designation")} />
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Controller
                control={control}
                name="companyId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {companiesQuery.data.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
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
                Create contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
