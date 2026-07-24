"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApiQuery, useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { useAuthStore, getUserDisplayName, getUserInitials } from "@/lib/auth-store";
import { formatDateTime, initialsFromName } from "@/lib/format";
import type { Message } from "@/types";

export default function ClientMessagesPage() {
  const user = useAuthStore((s) => s.user);
  const [draft, setDraft] = React.useState("");
  const messagesQuery = useApiQuery<Message[]>(["client", "messages"], "/client/messages", { fallback: [] });

  const sendMessage = useApiMutation<{ content: string }>(
    async (payload) => (await api.post("/client/messages", payload)).data,
    { invalidateKeys: [["client", "messages"]] }
  );

  function handleSend() {
    if (!draft.trim()) return;
    sendMessage.mutate({ content: draft.trim() });
    setDraft("");
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
      <PageHeader eyebrow="Client Portal" title="Messages" description="Chat directly with your dedicated TechAI delivery team." />

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messagesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 w-2/3 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : messagesQuery.isUnavailable ? (
            <EmptyState
              variant="error"
              title="Couldn't load messages"
              description={messagesQuery.errorMessage ?? undefined}
              action={{ label: "Retry", onClick: () => messagesQuery.refetch() }}
              className="h-full"
            />
          ) : messagesQuery.data.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Send a message to start the conversation with your team."
              className="h-full"
            />
          ) : (
            messagesQuery.data.map((m) => {
              const isMine = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex items-end gap-2.5 ${isMine ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>
                      {isMine ? getUserInitials(user) : initialsFromName(`${m.sender?.firstName ?? "T"} ${m.sender?.lastName ?? ""}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${isMine ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    <p>{m.content}</p>
                    <p className={`mt-1 text-[11px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {formatDateTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-end gap-3 border-t border-border p-4">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
          </Avatar>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message as ${getUserDisplayName(user) || "you"}...`}
            rows={1}
            className="min-h-[44px] flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button size="icon" onClick={handleSend} disabled={!draft.trim() || sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
