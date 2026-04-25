"use client";

import { AlertCircle, CheckCheck, Clock3, TrendingUp, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDepartmentProgress } from "@/hooks/use-progress";

export default function DepartmentHeadDashboardPage() {
  const { data, isLoading } = useDepartmentProgress();
  const [teacherFilter, setTeacherFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"teachers" | "overdue" | "pending">("teachers");

  const teacherCards = useMemo(() => {
    const list = data?.teachers ?? [];
    const overdueByTeacher = (data?.overdue_sessions ?? []).reduce<Record<string, number>>((acc, item) => {
      acc[item.teacher] = (acc[item.teacher] ?? 0) + 1;
      return acc;
    }, {});

    const cards = list.map((t) => {
      const planned = Math.max(t.planned ?? 0, 0);
      const delivered = Math.max(t.delivered ?? 0, 0);
      const missed = overdueByTeacher[t.name] ?? 0;
      const pending = Math.max(planned - delivered - missed, 0);
      const assigned = Math.max(planned, delivered + missed + pending);
      const completion =
        t.completion_rate != null ? Math.round(t.completion_rate) : assigned > 0 ? Math.round((delivered / assigned) * 100) : 0;

      const initials = t.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return {
        id: t.id,
        name: t.name,
        initials,
        assigned,
        delivered,
        missed,
        pending,
        completion
      };
    });

    if (!teacherFilter.trim()) return cards;
    const q = teacherFilter.toLowerCase();
    return cards.filter((t) => t.name.toLowerCase().includes(q));
  }, [data?.teachers, data?.overdue_sessions, teacherFilter]);

  const visibleTeachers = useMemo(() => {
    if (activeTab === "overdue") return teacherCards.filter((t) => t.missed > 0);
    if (activeTab === "pending") return teacherCards.filter((t) => t.pending > 0);
    return teacherCards;
  }, [activeTab, teacherCards]);

  const avgCompletion =
    data?.completion_rate != null
      ? Math.round(data.completion_rate)
      : teacherCards.length > 0
        ? Math.round(teacherCards.reduce((sum, t) => sum + t.completion, 0) / teacherCards.length)
        : 0;

  const teacherCount = teacherCards.length;
  const overdueCount = data?.overdue_sessions?.length ?? 0;
  const pendingReviewsCount = data?.pending_reviews ?? 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-blue-700">Department Head</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Mathematics Department</h1>
        <p className="text-sm text-slate-600">Monitor teacher progress, review AI-generated lesson plans, and support your team.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Teachers</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{teacherCount}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg completion</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{avgCompletion}%</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue sessions</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{overdueCount}</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending reviews</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{pendingReviewsCount}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={activeTab === "teachers" ? "default" : "outline"}
          className={activeTab === "teachers" ? "h-8 rounded-md px-3 text-xs" : "h-8 rounded-md px-3 text-xs"}
          onClick={() => setActiveTab("teachers")}
        >
          Teachers
        </Button>
        <Button
          type="button"
          variant={activeTab === "overdue" ? "default" : "outline"}
          className={activeTab === "overdue" ? "h-8 rounded-md px-3 text-xs" : "h-8 rounded-md px-3 text-xs"}
          onClick={() => setActiveTab("overdue")}
        >
          Overdue
        </Button>
        <Button
          type="button"
          variant={activeTab === "pending" ? "default" : "outline"}
          className={activeTab === "pending" ? "h-8 rounded-md px-3 text-xs" : "h-8 rounded-md px-3 text-xs"}
          onClick={() => setActiveTab("pending")}
        >
          Pending Reviews
        </Button>
      </div>

      <div className="max-w-md">
        <Input placeholder="Filter by teacher name..." value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)} />
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Loading department progress...</p> : null}
      {!isLoading && visibleTeachers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">No teacher records found for the selected filter.</CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleTeachers.map((t) => (
          <Card key={t.id} className="border-slate-200">
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {t.initials || <UserRound className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base font-semibold text-slate-900">{t.name}</CardTitle>
                    <p className="text-xs text-slate-500">
                      {t.assigned} session{t.assigned === 1 ? "" : "s"} assigned
                    </p>
                  </div>
                </div>
                {t.missed > 0 ? <Badge variant="danger">{t.missed} overdue</Badge> : null}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Completion</span>
                  <span className="font-semibold text-slate-800">{t.completion}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, t.completion))}%` }} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-emerald-50 py-2">
                  <p className="font-semibold text-emerald-700">{t.delivered}</p>
                  <p className="text-xs text-emerald-600">Delivered</p>
                </div>
                <div className="rounded-lg bg-rose-50 py-2">
                  <p className="font-semibold text-rose-700">{t.missed}</p>
                  <p className="text-xs text-rose-600">Missed</p>
                </div>
                <div className="rounded-lg bg-slate-100 py-2">
                  <p className="font-semibold text-slate-700">{t.pending}</p>
                  <p className="text-xs text-slate-600">Pending</p>
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2" type="button">
                <CheckCheck className="h-4 w-4" />
                Add comment
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
