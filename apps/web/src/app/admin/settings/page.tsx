"use client";

import * as React from "react";
import { Save, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const [form, setForm] = React.useState({
    companyName: "TechAI",
    supportEmail: "tech1001ai@gmail.com",
    timezone: "UTC",
    description: "Software engineering & AI product studio.",
  });
  const [security, setSecurity] = React.useState({ twoFactor: true, sessionTimeout: "30" });
  const [notify, setNotify] = React.useState({ email: true, slack: false, weeklyDigest: true });

  const saveSettings = useApiMutation<Record<string, unknown>>(
    async (payload) => (await api.patch("/admin/settings", payload)).data,
    { successMessage: "Settings saved.", errorMessage: "Couldn't save settings right now." }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Platform settings"
        description="Configure company details, security policy and notification preferences."
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Company profile</CardTitle>
              <CardDescription>These details appear on invoices, contracts and client-facing emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Company name</Label>
                  <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Support email</Label>
                  <Input value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Default timezone</Label>
                <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Security policy</CardTitle>
              <CardDescription>Control account protection requirements for all workspaces.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow
                label="Require two-factor authentication"
                description="Enforce 2FA for admin and finance roles."
                checked={security.twoFactor}
                onChange={(v) => setSecurity({ ...security, twoFactor: v })}
              />
              <div className="space-y-1.5">
                <Label>Session timeout (minutes)</Label>
                <Input
                  type="number"
                  className="max-w-[160px]"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>Choose how the platform notifies your team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow
                label="Email notifications"
                description="Send transactional emails for key events."
                checked={notify.email}
                onChange={(v) => setNotify({ ...notify, email: v })}
              />
              <ToggleRow
                label="Slack alerts"
                description="Mirror critical alerts to a connected Slack channel."
                checked={notify.slack}
                onChange={(v) => setNotify({ ...notify, slack: v })}
              />
              <ToggleRow
                label="Weekly digest"
                description="Summarize activity across all workspaces every Monday."
                checked={notify.weeklyDigest}
                onChange={(v) => setNotify({ ...notify, weeklyDigest: v })}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={() => saveSettings.mutate({ ...form, security, notify })}
          disabled={saveSettings.isPending}
        >
          {saveSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-secondary"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}
