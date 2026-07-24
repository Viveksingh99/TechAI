"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiMutation } from "@/hooks/use-api";
import { api } from "@/lib/api";

const ticketSchema = z.object({
  subject: z.string().min(4, "Give it a short, clear subject."),
  description: z.string().min(10, "Add a few more details so we can help faster."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function NewTicketPage() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { priority: "MEDIUM" },
  });

  const createTicket = useApiMutation<TicketFormValues>(
    async (values) => (await api.post("/client/tickets", values)).data,
    {
      successMessage: "Ticket submitted. Our team will respond shortly.",
      invalidateKeys: [["client", "tickets"]],
      onSuccess: () => router.push("/client/tickets"),
    }
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/client/tickets")} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </Button>

      <PageHeader eyebrow="Client Portal" title="Raise a support ticket" description="Tell us what's going on and we'll route it to the right team." />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((v) => createTicket.mutate(v))} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="e.g. Staging environment is down" {...register("subject")} />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Describe the issue, steps to reproduce, and any relevant links or screenshots."
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/client/tickets")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || createTicket.isPending}>
                {isSubmitting || createTicket.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit ticket
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
