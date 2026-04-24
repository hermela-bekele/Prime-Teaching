"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchoolProgress } from "@/hooks/use-progress";
import { schoolLeaderDepartmentRates, schoolLeaderTrend, supportList } from "@/lib/prime-data";

export default function SchoolLeaderDashboardPage() {
  const { data, isLoading } = useSchoolProgress();

  const chartData = useMemo(() => {
    const trend = data?.completion_trend?.length ? data.completion_trend : schoolLeaderTrend;
    return trend.map((value, i) => ({ week: `W${i + 1}`, value }));
  }, [data?.completion_trend]);

  const departments = data?.departments?.length
    ? data.departments.map((d) => ({ department: d.department, completion: d.completion }))
    : schoolLeaderDepartmentRates;

  const support = data?.teachers_needing_support?.length ? data.teachers_needing_support : supportList;

  const exportReports = () => {
    const blob = new Blob([JSON.stringify(data ?? { sample: true }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prime-school-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded (JSON)");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">School overview</h2>
          <p className="text-sm text-slate-600">Cross-department completion and support signals.</p>
        </div>
        <Button type="button" variant="outline" onClick={exportReports}>
          Export reports
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data?.total_teachers ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completion rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data?.completion_rate != null ? `${Math.round(data.completion_rate)}%` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Avg confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {data?.avg_confidence != null ? `${data.avg_confidence.toFixed(1)} / 5` : "—"}
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Relative completion — API overrides demo when available.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
            {departments.map((d) => (
              <div key={d.department} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <span className="font-medium">{d.department}</span>
                <span className="text-sm text-blue-800">{Math.round(d.completion)}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Completion over time</CardTitle>
            <CardDescription>Trend of whole-school delivery health.</CardDescription>
          </CardHeader>
          <CardContent className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#1d4ed8" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teachers needing support</CardTitle>
          <CardDescription>Prioritize check-ins using delivery and confidence signals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {support.map((row) => (
            <div key={row.name} className="flex flex-col rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-amber-950">{row.name}</span>
              <span className="text-sm text-amber-900">{row.reason}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
