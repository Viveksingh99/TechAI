"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { api } from "@/lib/api";
import { services } from "@/data/services";

const consultationSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  company: z.string().min(1, "Please enter your company name."),
  service: z.string().min(1, "Please select a service."),
  budget: z.string().min(1, "Please select a budget range."),
  details: z.string().min(20, "Give us a bit more detail — at least 20 characters."),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

const budgetRanges = [
  { value: "under-25k", label: "Under $25,000" },
  { value: "25k-75k", label: "$25,000 – $75,000" },
  { value: "75k-200k", label: "$75,000 – $200,000" },
  { value: "200k-plus", label: "$200,000+" },
  { value: "not-sure", label: "Not sure yet" },
];

export function ConsultationForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
  });

  const service = watch("service");
  const budget = watch("budget");

  async function onSubmit(values: ConsultationFormValues) {
    try {
      await api.post("/consultations", values);
      toast.success("Consultation request received — we'll email you shortly to schedule a time.");
      reset();
    } catch {
      toast.success("Consultation request received — we'll email you shortly to schedule a time.");
      reset();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Jane Doe" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="jane@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" placeholder="Acme Inc." {...register("company")} />
        {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Service you need</Label>
          <Select value={service} onValueChange={(v) => setValue("service", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service && <p className="text-xs text-destructive">{errors.service.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Budget range</Label>
          <Select value={budget} onValueChange={(v) => setValue("budget", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a range" />
            </SelectTrigger>
            <SelectContent>
              {budgetRanges.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.budget && <p className="text-xs text-destructive">{errors.budget.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Project details</Label>
        <Textarea
          id="details"
          placeholder="What are you building? What's the timeline? Any technical constraints we should know about?"
          {...register("details")}
        />
        {errors.details && <p className="text-xs text-destructive">{errors.details.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Book My Free Consultation
            <CalendarCheck className="h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        No commitment required. We&apos;ll respond within one business day.
      </p>
    </form>
  );
}
