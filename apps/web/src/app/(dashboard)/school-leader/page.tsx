"use client";

import { Building2, Download, GraduationCap, TrendingUp, UserRound, Users } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchoolProgress } from "@/hooks/use-progress";
import { schoolLeaderDepartmentRates, schoolLeaderTrend, supportList } from "@/lib/prime-data";

export default function SchoolLeaderDashboardPage() {
  const { data, isLoading } = useSchoolProgress();

  const trend = useMemo(() => {
    const trend = data?.completion_trend?.length ? data.completion_trend : schoolLeaderTrend;
    return trend.slice(0, 8);
  }, [data?.completion_trend]);

  const departments = useMemo(() => {
    const fallback = [
      { department: "Mathematics", teachers: 6, sessions: 12, completion: 75, delivered: 9, pending: 3 },
      { department: "Sciences", teachers: 5, sessions: 11, completion: 64, delivered: 7, pending: 4 },
      { department: "Languages", teachers: 4, sessions: 10, completion: 50, delivered: 5, pending: 5 },
      { department: "Humanities", teachers: 3, sessions: 9, completion: 33, delivered: 3, pending: 6 }
    ];

    if (!data?.departments?.length) return fallback;
    return data.departments.map((d, i) => {
      const totalSessions = fallback[i]?.sessions ?? 10;
      const delivered = Math.round((Math.max(0, d.completion) / 100) * totalSessions);
      return {
        department: d.department,
        teachers: fallback[i]?.teachers ?? 4,
        sessions: totalSessions,
        completion: Math.round(d.completion),
        delivered,
        pending: Math.max(totalSessions - delivered, 0)
      };
    });
  }, [data?.departments]);

  const support = useMemo(() => {
    const fallback = [
      { name: "Hana Tesfaye", overdue: 1, missed: 1 },
      { name: "Bereket Alemu", overdue: 0, missed: 1 },
      { name: "Meron Girma", overdue: 0, missed: 1 },
      { name: "Yohannes Tadesse", overdue: 0, missed: 1 }
    ];
    if (!data?.teachers_needing_support?.length) return fallback;
    return data.teachers_needing_support.slice(0, 4).map((row, i) => ({
      name: row.name,
      overdue: fallback[i]?.overdue ?? 0,
      missed: fallback[i]?.missed ?? 1
    }));
  }, [data?.teachers_needing_support]);

  const completionRate =
    data?.completion_rate != null
      ? Math.round(data.completion_rate)
      : departments.length
        ? Math.round(departments.reduce((sum, d) => sum + d.completion, 0) / departments.length)
        : 0;

  const totalTeachers = data?.total_teachers ?? departments.reduce((sum, d) => sum + d.teachers, 0);
  const totalDepartments = departments.length || schoolLeaderDepartmentRates.length;
  const sessionsPerMonth = departments.reduce((sum, d) => sum + d.sessions, 0) * 6;
  const trendStart = trend[0] ?? 0;
  const trendEnd = trend[trend.length - 1] ?? trendStart;
  const trendDelta = trend.length > 1 ? trendEnd - trendStart : 0;

  const exportReports = () => {
    const blob = new Blob([JSON.stringify(data ?? { sample: true }, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prime-school-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded (JSON)");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-blue-700">School Leader</p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">Addis Prep Academy</h1>
          <p className="text-sm text-slate-600">School-wide teaching health across all departments and grades.</p>
        </div>
        <Button type="button" variant="outline" className="h-10 gap-2 self-start lg:self-auto" onClick={exportReports}>
          <Download className="h-4 w-4" />
          Download report
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Teachers</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{totalTeachers}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Departments</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{totalDepartments}</p>
            </div>
            <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-600">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg completion</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{completionRate}%</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sessions / month</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{sessionsPerMonth}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-3xl font-semibold text-slate-900">Department comparison</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {departments.map((d) => (
            <Card key={d.department} className="border-slate-200">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xl font-semibold text-slate-900">{d.department}</p>
                    <p className="text-xs text-slate-500">
                      {d.teachers} teachers · {d.sessions} sessions
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{d.completion}%</span>
                </div>

                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, d.completion))}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Delivered: <strong>{d.delivered}</strong>
                  </span>
                  <span>
                    Pending: <strong>{d.pending}</strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-3xl text-slate-900">Completion rate over time</CardTitle>
            <p className="text-sm text-slate-500">Last 8 weeks, school-wide.</p>
          </div>
          <div className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {trendDelta >= 0 ? "+" : ""}
            {trendDelta.toFixed(1)}%
          </div>
        </CardHeader>
        <CardContent className="space-y-14 pt-0">
          <div className="h-40 w-full rounded-lg border border-dashed border-slate-200 bg-slate-50/60" />
          <div className="grid grid-cols-8 text-center text-xs text-slate-500">
            {trend.map((_, i) => (
              <span key={`w-${i + 1}`}>W{i + 1}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-3xl font-semibold text-slate-900">Teachers needing support</h2>
        {isLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {support.map((row) => {
            const initials = row.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <Card key={row.name} className="border-slate-200">
                <CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {initials || <UserRound className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">
                        {row.overdue} overdue · {row.missed} missed
                      </p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    Reach out
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
