"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, Sparkles, Copy, Check, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useApiMutation, unwrap, getErrorMessage } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { AI_TOOLS } from "@/config/navigation";

interface ToolField {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea";
  required?: boolean;
}

interface ToolConfig {
  endpoint: string;
  fields: ToolField[];
}

const TOOL_CONFIG: Record<string, ToolConfig> = {
  proposal: {
    endpoint: "/ai/proposal",
    fields: [
      { name: "clientName", label: "Client name", required: true },
      { name: "projectSummary", label: "Project summary", type: "textarea", required: true },
      { name: "budget", label: "Budget" },
      { name: "timeline", label: "Timeline" },
      { name: "scope", label: "Scope", type: "textarea" },
    ],
  },
  contract: {
    endpoint: "/ai/contract",
    fields: [
      { name: "clientName", label: "Client name", required: true },
      { name: "projectTitle", label: "Project title", required: true },
      { name: "value", label: "Contract value", required: true },
      { name: "duration", label: "Duration" },
      { name: "terms", label: "Additional terms", type: "textarea" },
    ],
  },
  "meeting-notes": {
    endpoint: "/ai/meeting-notes",
    fields: [{ name: "transcript", label: "Meeting transcript", type: "textarea", required: true }],
  },
  "task-breakdown": {
    endpoint: "/ai/task-breakdown",
    fields: [
      { name: "title", label: "Task title", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  "code-review": {
    endpoint: "/ai/code-review",
    fields: [
      { name: "code", label: "Code", type: "textarea", required: true },
      { name: "language", label: "Language", placeholder: "typescript" },
    ],
  },
  "ticket-summary": {
    endpoint: "/ai/ticket-summary",
    fields: [
      { name: "subject", label: "Ticket subject", required: true },
      { name: "conversation", label: "Conversation", type: "textarea", required: true },
    ],
  },
  "email-writer": {
    endpoint: "/ai/email",
    fields: [
      { name: "purpose", label: "Purpose", required: true },
      { name: "recipientName", label: "Recipient name" },
      { name: "tone", label: "Tone", placeholder: "professional, friendly, formal…" },
      { name: "context", label: "Context", type: "textarea" },
    ],
  },
  estimation: {
    endpoint: "/ai/project-estimate",
    fields: [
      { name: "description", label: "Project description", type: "textarea", required: true },
      { name: "techStack", label: "Tech stack", placeholder: "Next.js, NestJS, PostgreSQL…" },
    ],
  },
};

interface AiResult {
  content: string;
  mock: boolean;
  model: string;
}

export default function AiToolPage() {
  const params = useParams<{ tool: string }>();
  const slug = params.tool;
  const meta = AI_TOOLS.find((t) => t.slug === slug);
  const config = TOOL_CONFIG[slug];
  const [result, setResult] = React.useState<AiResult | null>(null);
  const [copied, setCopied] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>();

  const runTool = useApiMutation<Record<string, string>, AiResult>(
    async (values) => {
      const cleaned = Object.fromEntries(Object.entries(values).filter(([, v]) => v && v.trim().length > 0));
      const { data } = await api.post(config.endpoint, cleaned);
      return unwrap<AiResult>(data, { content: "", mock: true, model: "mock" });
    },
    {
      onSuccess: (data) => setResult(data),
    }
  );

  React.useEffect(() => {
    setResult(null);
    reset();
  }, [slug, reset]);

  if (!meta || !config) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="AI Studio" title="Tool not found" description="This AI tool doesn't exist." />
        <EmptyState icon={AlertTriangle} title="Unknown tool" description="Choose a tool from the AI hub." />
      </div>
    );
  }

  const Icon = meta.icon;

  async function onSubmit(values: Record<string, string>) {
    await runTool.mutateAsync(values);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Studio"
        title={meta.title}
        description={meta.description}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {config.fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      rows={5}
                      placeholder={field.placeholder}
                      {...register(field.name, { required: field.required ? "Required" : false })}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      placeholder={field.placeholder}
                      {...register(field.name, { required: field.required ? "Required" : false })}
                    />
                  )}
                  {errors[field.name] && <p className="text-xs text-destructive">{errors[field.name]?.message as string}</p>}
                </div>
              ))}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                Generate
              </Button>
              {runTool.isError && (
                <p className="text-xs text-destructive">{getErrorMessage(runTool.error)}</p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="flex flex-1 flex-col pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Result
              </h3>
              {result && (
                <Button size="sm" variant="outline" onClick={copyResult}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
            {runTool.isPending ? (
              <div className="flex flex-1 items-center justify-center py-14">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !result ? (
              <EmptyState
                className="flex-1"
                icon={Sparkles}
                title="No output yet"
                description="Fill in the form and generate to see AI output here."
              />
            ) : (
              <div className="flex-1 space-y-3">
                {result.mock && (
                  <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                    Showing a templated mock response — connect an OpenAI API key for live generation.
                  </p>
                )}
                <div className="max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-secondary/20 p-4 text-sm leading-relaxed text-foreground">
                  {result.content}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
