"use client";

import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Video, ListTodo, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApiQuery } from "@/hooks/use-api";
import { formatDate } from "@/lib/format";
import type { Leave, Meeting, Task } from "@/types";

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: "meeting" | "task" | "leave";
}

export default function EmployeeCalendarPage() {
  const [month, setMonth] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState(new Date());

  const meetings = useApiQuery<Meeting[]>(["employee", "meetings", "calendar"], "/employee/meetings", { fallback: [] });
  const tasks = useApiQuery<Task[]>(["employee", "tasks", "calendar"], "/employee/tasks", { fallback: [] });
  const leaves = useApiQuery<Leave[]>(["employee", "leave", "calendar"], "/employee/leave", { fallback: [] });

  const events: CalendarEvent[] = React.useMemo(() => {
    const list: CalendarEvent[] = [];
    meetings.data.forEach((m) => list.push({ id: `m-${m.id}`, date: new Date(m.startTime), title: m.title, type: "meeting" }));
    tasks.data
      .filter((t) => t.dueDate)
      .forEach((t) => list.push({ id: `t-${t.id}`, date: new Date(t.dueDate!), title: t.title, type: "task" }));
    leaves.data
      .filter((l) => l.status === "APPROVED")
      .forEach((l) => list.push({ id: `l-${l.id}`, date: new Date(l.startDate), title: "Leave", type: "leave" }));
    return list;
  }, [meetings.data, tasks.data, leaves.data]);

  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const isLoading = meetings.isLoading || tasks.isLoading || leaves.isLoading;
  const selectedEvents = events.filter((e) => isSameDay(e.date, selectedDay));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="My Workspace" title="Calendar" description="Meetings, task due dates and approved leave in one view." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">{format(month, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => setMonth((m) => subMonths(m, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setMonth(new Date())}>
                Today
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setMonth((m) => addMonths(m, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = events.filter((e) => isSameDay(e.date, day));
              const inMonth = isSameMonth(day, month);
              const isSelected = isSameDay(day, selectedDay);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex h-20 flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition-colors sm:h-24",
                    inMonth ? "border-border bg-background" : "border-transparent bg-secondary/20 text-muted-foreground",
                    isSelected && "border-primary ring-1 ring-primary"
                  )}
                >
                  <span className={cn("text-xs font-medium", isSameDay(day, new Date()) && "text-primary")}>
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((e) => (
                      <span
                        key={e.id}
                        className={cn(
                          "truncate rounded px-1 text-[10px] font-medium",
                          e.type === "meeting" && "bg-sky-500/15 text-sky-600 dark:text-sky-400",
                          e.type === "task" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                          e.type === "leave" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {e.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-display text-base font-semibold text-foreground">{format(selectedDay, "EEEE, MMM d")}</h3>
          {isLoading ? (
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          ) : selectedEvents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Nothing scheduled for this day.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    {e.type === "meeting" && <Video className="h-4 w-4" />}
                    {e.type === "task" && <ListTodo className="h-4 w-4" />}
                    {e.type === "leave" && <CalendarCheck className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(e.date, "h:mm a")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
