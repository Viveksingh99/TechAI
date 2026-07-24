"use client";

import * as React from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApiMutation, useApiQuery } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface FeedbackItem {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  project?: { name: string };
}

export default function ClientFeedbackPage() {
  const [rating, setRating] = React.useState(5);
  const [content, setContent] = React.useState("");

  const feedbackQuery = useApiQuery<FeedbackItem[]>(["client", "feedback"], "/client/feedback", { fallback: [] });

  const submitFeedback = useApiMutation<{ rating: number; content: string }>(
    async (payload) => (await api.post("/client/feedback", payload)).data,
    {
      successMessage: "Thanks for the feedback!",
      invalidateKeys: [["client", "feedback"]],
      onSuccess: () => setContent(""),
    }
  );

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Client Portal" title="Feedback" description="Tell us how we're doing — your input shapes how we deliver." />

      <Card>
        <CardHeader>
          <CardTitle>Share your experience</CardTitle>
          <CardDescription>Rate your overall satisfaction with TechAI so far.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} star`}>
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="What's working well? What could be better?"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => submitFeedback.mutate({ rating, content })}
              disabled={!content.trim() || submitFeedback.isPending}
            >
              {submitFeedback.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Your feedback history</h2>
        {feedbackQuery.isLoading ? (
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        ) : feedbackQuery.isUnavailable ? (
          <EmptyState
            variant="error"
            title="Couldn't load feedback history"
            description={feedbackQuery.errorMessage ?? undefined}
            action={{ label: "Retry", onClick: () => feedbackQuery.refetch() }}
          />
        ) : feedbackQuery.data.length === 0 ? (
          <EmptyState title="No feedback submitted yet" description="Your submitted feedback will be listed here." />
        ) : (
          <div className="space-y-3">
            {feedbackQuery.data.map((f) => (
              <div key={f.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < f.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(f.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-foreground">{f.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
