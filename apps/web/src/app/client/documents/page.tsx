"use client";

import * as React from "react";
import { FileText, Upload, Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ProjectDocument } from "@/types";

export default function ClientDocumentsPage() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const documentsQuery = useApiQuery<ProjectDocument[]>(["client", "documents"], "/client/documents", { fallback: [] });

  const uploadDocument = useApiMutation<FormData>(
    async (formData) => (await api.post("/client/documents", formData)).data,
    { successMessage: "Document uploaded.", invalidateKeys: [["client", "documents"]] }
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    uploadDocument.mutate(formData);
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client Portal"
        title="Documents"
        description="Contracts, briefs, deliverables and shared files across your projects."
        actions={
          <>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploadDocument.isPending}>
              {uploadDocument.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload document
            </Button>
          </>
        }
      />

      <DataTable
        columns={[
          {
            key: "name",
            header: "File",
            render: (d) => (
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="font-medium text-foreground">{d.name}</span>
              </div>
            ),
          },
          { key: "fileType", header: "Type", hideOnMobile: true, render: (d) => d.fileType ?? "—" },
          { key: "fileSize", header: "Size", hideOnMobile: true, render: (d) => (d.fileSize ? `${Math.round(d.fileSize / 1024)} KB` : "—") },
          { key: "createdAt", header: "Uploaded", render: (d) => formatDate(d.createdAt) },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (d) => (
              <a href={d.fileUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </a>
            ),
          },
        ]}
        data={documentsQuery.data}
        keyField={(d) => d.id}
        isLoading={documentsQuery.isLoading}
        isError={documentsQuery.isUnavailable}
        errorMessage={documentsQuery.errorMessage}
        onRetry={() => documentsQuery.refetch()}
        emptyTitle="No documents yet"
        emptyDescription="Files shared by your project team will appear here."
      />
    </div>
  );
}
