"use client";

import * as React from "react";
import { Plus, Copy, Trash2, KeyRound, Loader2, Check } from "lucide-react";
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
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ApiKey } from "@/types";
import { toast } from "sonner";

export default function AdminApiKeysPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const keysQuery = useApiQuery<ApiKey[]>(["admin", "api-keys"], "/admin/api-keys", { fallback: [] });

  const createKey = useApiMutation<{ name: string }, ApiKey>(
    async ({ name }) => (await api.post("/admin/api-keys", { name })).data,
    { successMessage: "API key generated.", invalidateKeys: [["admin", "api-keys"]] }
  );

  const revokeKey = useApiMutation<{ id: string }>(
    async ({ id }) => (await api.delete(`/admin/api-keys/${id}`)).data,
    { successMessage: "API key revoked.", invalidateKeys: [["admin", "api-keys"]] }
  );

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    const result = await createKey.mutateAsync({ name: newKeyName.trim() });
    setNewKeyName("");
    setDialogOpen(false);
    if (result?.key) {
      navigator.clipboard?.writeText(result.key).catch(() => {});
      toast.info("Key copied to clipboard. Store it securely — it won't be shown again.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="API keys"
        description="Manage programmatic access to the TechAI platform API."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Generate key
          </Button>
        }
      />

      <DataTable
        columns={[
          {
            key: "name",
            header: "Name",
            render: (k) => (
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <KeyRound className="h-4 w-4" />
                </span>
                <span className="font-medium text-foreground">{k.name}</span>
              </div>
            ),
          },
          {
            key: "key",
            header: "Key",
            render: (k) => (
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                {`${k.key?.slice(0, 8) ?? "sk_live"}••••••••••••`}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(k.key).catch(() => {});
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ),
          },
          { key: "scopes", header: "Scopes", hideOnMobile: true, render: (k) => k.scopes?.join(", ") || "full access" },
          { key: "status", header: "Status", render: (k) => <StatusBadge status={k.isActive ? "ACTIVE" : "SUSPENDED"} /> },
          { key: "lastUsedAt", header: "Last used", hideOnMobile: true, render: (k) => (k.lastUsedAt ? formatDate(k.lastUsedAt) : "Never") },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (k) => (
              <Button size="icon" variant="ghost" onClick={() => revokeKey.mutate({ id: k.id })} title="Revoke key">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            ),
          },
        ]}
        data={keysQuery.data}
        keyField={(k) => k.id}
        isLoading={keysQuery.isLoading}
        isError={keysQuery.isUnavailable}
        errorMessage={keysQuery.errorMessage}
        onRetry={() => keysQuery.refetch()}
        emptyTitle="No API keys yet"
        emptyDescription="Generate a key to authenticate server-to-server requests."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API key</DialogTitle>
            <DialogDescription>Give it a descriptive name so you can identify it later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="keyName">Key name</Label>
            <Input id="keyName" placeholder="e.g. CI/CD pipeline" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createKey.isPending || !newKeyName.trim()}>
              {createKey.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
