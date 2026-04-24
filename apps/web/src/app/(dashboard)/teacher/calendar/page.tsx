"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

import { SessionCard } from "@/components/calendar/SessionCard";
import { LessonPlanViewer } from "@/components/lesson-plans/LessonPlanViewer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLessonPlan } from "@/hooks/use-lesson-plan";
import { useSessions } from "@/hooks/use-sessions";
import type { SessionDto } from "@/lib/api-types";
import { asAppRoute } from "@/lib/navigation";
import {
  type CalendarSessionFilter,
  getSessionDate,
  getSessionNumber,
  sessionMatchesCalendarFilter
} from "@/lib/session-utils";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: { value: CalendarSessionFilter; label: string }[] = [
  { value: "all", label: "All sessions" },
  { value: "planned", label: "Planned" },
  { value: "generated", label: "Generated" },
  { value: "delivered", label: "Delivered" },
  { value: "missed", label: "Missed" },
  { value: "rescheduled", label: "Rescheduled" }
];

function sortSessionsForCalendar(sessions: SessionDto[]): SessionDto[] {
  return [...sessions].sort((a, b) => {
    const na = getSessionNumber(a);
    const nb = getSessionNumber(b);
    if (na !== nb) return na - nb;
    const da = getSessionDate(a) || "";
    const db = getSessionDate(b) || "";
    return da.localeCompare(db);
  });
}

export default function TeacherCalendarPage() {
  const { data: sessions = [], isLoading } = useSessions();
  const [filter, setFilter] = useState<CalendarSessionFilter>("all");
  const [selected, setSelected] = useState<SessionDto | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const lessonPlanPreview = useLessonPlan(selected?.id ?? null);

  const filtered = useMemo(() => {
    const list = sessions.filter((s) => sessionMatchesCalendarFilter(s, filter));
    return sortSessionsForCalendar(list);
  }, [sessions, filter]);

  const filterLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "All sessions";

  const openLessonPlan = (s: SessionDto) => {
    setSelected(s);
    setPlanOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Calendar</h1>
          <p className="max-w-xl text-sm text-slate-600 sm:text-base">All your upcoming and past sessions in one place.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 min-w-[200px] justify-between gap-2 rounded-lg border-slate-200 bg-white px-4 font-medium text-slate-900 shadow-sm hover:bg-slate-50"
            >
              {filterLabel}
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px] rounded-xl border-slate-200 p-1 shadow-lg">
            {FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={cn(
                    "cursor-pointer gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-violet-600 text-white focus:bg-violet-600 focus:text-white"
                      : "text-slate-900 focus:bg-slate-100"
                  )}
                >
                  {active ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> : <span className="w-4 shrink-0" />}
                  {opt.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        {isLoading ? <p className="text-sm text-slate-500">Loading sessions…</p> : null}
        {!isLoading && sessions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-600">
              No sessions yet.{" "}
              <Link className="font-semibold text-blue-700 underline" href={asAppRoute("/calendar/new")}>
                Generate a calendar
              </Link>{" "}
              to see your plan here.
            </p>
          </div>
        ) : null}
        {!isLoading && sessions.length > 0 && filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No sessions match this filter.</p>
        ) : null}
        {filtered.map((s) => (
          <SessionCard
            key={s.id}
            layout="calendar"
            session={s}
            selected={selected?.id === s.id}
            onSelect={setSelected}
            onLessonPlan={openLessonPlan}
          />
        ))}
      </div>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-h-[min(90vh,880px)] max-w-3xl overflow-y-auto p-0 sm:rounded-xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-4 text-left">
            <DialogTitle className="text-lg font-semibold">Lesson plan</DialogTitle>
            {selected ? (
              <p className="text-sm font-normal text-slate-500">
                {selected.title}
                {lessonPlanPreview.data ? (
                  <span className="ml-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Ready
                  </span>
                ) : lessonPlanPreview.isLoading ? (
                  <span className="ml-2 text-xs text-slate-400">Loading…</span>
                ) : (
                  <span className="ml-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
                    Not generated
                  </span>
                )}
              </p>
            ) : null}
          </DialogHeader>
          <div className="px-4 pb-6 pt-2 sm:px-6">
            <LessonPlanViewer sessionId={selected?.id ?? null} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
