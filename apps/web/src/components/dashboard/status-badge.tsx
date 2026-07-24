import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/format";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const SUCCESS = new Set([
  "DONE", "COMPLETED", "PAID", "ACTIVE", "APPROVED", "RESOLVED", "ACCEPTED",
  "PRESENT", "WON", "PUBLISHED", "HIRED", "CONFIRMED", "SIGNED", "WORK_FROM_HOME", "SUCCESS",
]);

const DANGER = new Set([
  "CANCELLED", "REJECTED", "FAILED", "TERMINATED", "OVERDUE", "LOST", "SUSPENDED",
  "EXPIRED", "CRITICAL", "URGENT", "REOPENED", "WITHDRAWN", "SPAM", "ABSENT", "ERROR",
]);

const WARNING = new Set([
  "PENDING", "ON_HOLD", "IN_REVIEW", "HALF_DAY", "LATE", "DRAFT", "SCREENING",
  "INTERVIEW", "TENTATIVE", "PARTIALLY_PAID", "MEDIUM", "OFFERED", "APPLIED", "WARNING", "RESIGNED",
]);

const INFO = new Set([
  "NEW", "OPEN", "SCHEDULED", "SENT", "TODO", "BACKLOG", "ONGOING", "TRIAL",
  "PLANNING", "IN_PROGRESS", "QUALIFIED", "CONTACTED", "INFO", "LOW",
]);

function toneFor(status: string): Tone {
  const key = status?.toUpperCase?.() ?? "";
  if (SUCCESS.has(key)) return "success";
  if (DANGER.has(key)) return "danger";
  if (WARNING.has(key)) return "warning";
  if (INFO.has(key)) return "info";
  return "neutral";
}

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  neutral: "bg-secondary text-secondary-foreground border-transparent",
};

export function StatusBadge({
  status,
  className,
  toneOverride,
}: {
  status: string;
  className?: string;
  toneOverride?: Tone;
}) {
  const tone = toneOverride ?? toneFor(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {titleCase(status)}
    </span>
  );
}
