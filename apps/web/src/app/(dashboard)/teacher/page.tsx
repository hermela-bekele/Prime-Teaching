"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, CheckCircle2, Calendar as CalendarIcon } from "lucide-react";

import { SessionCard } from "@/components/calendar/SessionCard";
import { LessonPlanViewer } from "@/components/lesson-plans/LessonPlanViewer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLessonPlan } from "@/hooks/use-lesson-plan";
import { useMarkSessionDelivered } from "@/hooks/use-session-mutations";
import { useSessions } from "@/hooks/use-sessions";
import { useTeacherProgress } from "@/hooks/use-progress";
import type { SessionDto } from "@/lib/api-types";
import { asAppRoute } from "@/lib/navigation";
import { sessionBucket } from "@/lib/session-utils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

function StatTile({
  label,
  value,
  sub,
  icon,
  iconClass
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  iconClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {sub ? (
            <p className={cn("mt-1 text-xs font-medium", sub.includes("Action") ? "text-rose-600" : "text-slate-500")}>{sub}</p>
          ) : null}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconClass)}>{icon}</div>
      </div>
    </div>
  );
}

function tabBadge(count: number, tone: "blue" | "rose") {
  return (
    <span
      className={cn(
        "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
        tone === "blue" ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"
      )}
    >
      {count}
    </span>
  );
}

export default function TeacherDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: sessions = [], isLoading } = useSessions();
  const { data: teacherMeta } = useTeacherProgress();
  const [selected, setSelected] = useState<SessionDto | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [tab, setTab] = useState<"today" | "upcoming" | "overdue">("today");
  const markDelivered = useMarkSessionDelivered();
  const lessonPlanPreview = useLessonPlan(selected?.id ?? null);

  const firstName = useMemo(() => {
    const n = user?.name?.trim();
    if (!n) return "there";
    return n.split(/\s+/)[0] ?? "there";
  }, [user]);

  const stats = useMemo(() => {
    const today = sessions.filter((s) => sessionBucket(s) === "today").length;
    const upcoming = sessions.filter((s) => sessionBucket(s) === "upcoming").length;
    const completed = sessions.filter((s) => sessionBucket(s) === "completed").length;
    const overdue = sessions.filter((s) => sessionBucket(s) === "overdue").length;
    return {
      today: teacherMeta?.today_count ?? today,
      upcoming: teacherMeta?.upcoming_count ?? upcoming,
      completed: teacherMeta?.completed_count ?? completed,
      overdue: teacherMeta?.pending_count ?? overdue
    };
  }, [sessions, teacherMeta]);

  const byTab = useMemo(
    () => ({
      today: sessions.filter((s) => sessionBucket(s) === "today"),
      upcoming: sessions.filter((s) => sessionBucket(s) === "upcoming"),
      overdue: sessions.filter((s) => sessionBucket(s) === "overdue")
    }),
    [sessions]
  );

  const openLessonPlan = (s: SessionDto) => {
    setSelected(s);
    setPlanOpen(true);
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-600">Welcome back</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Good day, {firstName}.</h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            You have <span className="font-semibold text-slate-900">{stats.today}</span> sessions today and{" "}
            <span className="font-semibold text-rose-600">{stats.overdue}</span> overdue. Stay on track with AI-generated lesson
            plans.
          </p>
        </div>
        <Button asChild className="h-11 shrink-0 rounded-lg bg-blue-600 px-5 text-sm font-semibold shadow-sm hover:bg-blue-700">
          <Link href={asAppRoute("/teacher/calendar")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            View calendar
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Today's Sessions"
          value={stats.today}
          icon={<CalendarDays className="h-5 w-5 text-blue-600" />}
          iconClass="bg-sky-50"
        />
        <StatTile
          label="Upcoming"
          value={stats.upcoming}
          sub="Next 14 days"
          icon={<CalendarDays className="h-5 w-5 text-cyan-600" />}
          iconClass="bg-cyan-50"
        />
        <StatTile
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          iconClass="bg-emerald-50"
        />
        <StatTile
          label="Overdue"
          value={stats.overdue}
          sub="Action needed"
          icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
          iconClass="bg-rose-50"
        />
      </section>

      <section className="space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
          <TabsList className="h-auto w-full justify-start gap-1 rounded-xl bg-slate-200/70 p-1 sm:w-auto">
            <TabsTrigger value="today" className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm">
              <span className="inline-flex items-center">
                Today
                {tabBadge(byTab.today.length, "blue")}
              </span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="overdue" className="rounded-lg px-4 py-2 data-[state=active]:shadow-sm">
              <span className="inline-flex items-center">
                Overdue
                {byTab.overdue.length > 0 ? tabBadge(byTab.overdue.length, "rose") : null}
              </span>
            </TabsTrigger>
          </TabsList>

          {(["today", "upcoming", "overdue"] as const).map((key) => (
            <TabsContent key={key} value={key} className="mt-6 space-y-4 focus-visible:outline-none">
              {isLoading ? <p className="text-sm text-slate-500">Loading sessions…</p> : null}
              {!isLoading && sessions.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
                  No sessions yet. Use{" "}
                  <Link className="font-semibold text-blue-700 underline" href={asAppRoute("/calendar/new")}>
                    New calendar
                  </Link>{" "}
                  to generate your annual plan.
                </div>
              ) : null}
              {!isLoading && sessions.length > 0 && byTab[key].length === 0 ? (
                <p className="text-sm text-slate-500">Nothing in this tab.</p>
              ) : null}
              {byTab[key].map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  selected={selected?.id === s.id}
                  onSelect={setSelected}
                  onLessonPlan={openLessonPlan}
                  marking={markDelivered.isPending}
                  onMarkDelivered={(row) => markDelivered.mutate(row.id)}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </section>

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
