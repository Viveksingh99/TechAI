"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Building2, Globe } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
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
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Company } from "@/types";

const companySchema = z.object({
  name: z.string().min(1, "Required"),
  website: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  size: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CrmCompaniesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const companiesQuery = useApiQuery<Company[]>(["crm", "companies"], "/crm/companies", { fallback: [], params: { limit: 100 } });

  const createCompany = useApiMutation<CompanyFormValues>(
    async (values) =>
      (
        await api.post("/crm/companies", {
          ...values,
          website: values.website || undefined,
          industry: values.industry || undefined,
          size: values.size || undefined,
          city: values.city || undefined,
          country: values.country || undefined,
        })
      ).data,
    { successMessage: "Company created.", invalidateKeys: [["crm", "companies"]] }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({ resolver: zodResolver(companySchema) });

  async function onSubmit(values: CompanyFormValues) {
    await createCompany.mutateAsync(values);
    reset();
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales CRM"
        title="Companies"
        description="Organizations you're prospecting or already work with."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New company
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total companies" value={companiesQuery.data.length} icon={Building2} loading={companiesQuery.isLoading} />
        <StatCard
          label="With website on file"
          value={companiesQuery.data.filter((c) => c.website).length}
          icon={Globe}
          loading={companiesQuery.isLoading}
        />
      </div>

      <DataTable
        columns={[
          { key: "name", header: "Company" },
          {
            key: "website",
            header: "Website",
            hideOnMobile: true,
            render: (c) =>
              c.website ? (
                <a href={c.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {c.website.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                "—"
              ),
          },
          { key: "industry", header: "Industry", hideOnMobile: true, render: (c) => c.industry ?? "—" },
          { key: "location", header: "Location", render: (c) => [c.city, c.country].filter(Boolean).join(", ") || "—" },
          { key: "createdAt", header: "Added", hideOnMobile: true, render: (c) => formatDate(c.createdAt) },
        ]}
        data={companiesQuery.data}
        keyField={(c) => c.id}
        isLoading={companiesQuery.isLoading}
        isError={companiesQuery.isUnavailable}
        errorMessage={companiesQuery.errorMessage}
        onRetry={() => companiesQuery.refetch()}
        emptyTitle="No companies yet"
        emptyDescription="Add companies to organize contacts and deals."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New company</DialogTitle>
            <DialogDescription>Add an organization to your CRM.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Company name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://" {...register("website")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" {...register("industry")} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="size">Size</Label>
                <Input id="size" placeholder="e.g. 51-200" {...register("size")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create company
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
