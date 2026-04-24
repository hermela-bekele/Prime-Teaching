"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDepartmentProgress } from "@/hooks/use-progress";
import { pendingPlanReviews } from "@/lib/prime-data";

export default function DepartmentHeadDashboardPage() {
  const { data, isLoading } = useDepartmentProgress();
  const [teacherFilter, setTeacherFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<{ id: string; teacher: string; lesson: string } | null>(null);

  const teachers = useMemo(() => {
    const list = data?.teachers ?? [];
    if (!teacherFilter.trim()) return list;
    const q = teacherFilter.toLowerCase();
    return list.filter((t) => t.name.toLowerCase().includes(q) || (t.email ?? "").toLowerCase().includes(q));
  }, [data?.teachers, teacherFilter]);

  const overdue = data?.overdue_sessions ?? [];
  const pendingReviewsCount = data?.pending_reviews ?? pendingPlanReviews.length;
  const fallbackReviews = pendingPlanReviews.map((r) => ({ id: r.id, teacher: r.teacher, lesson: r.lesson }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Department overview</h2>
          <p className="text-sm text-slate-600">Track delivery, overdue work, and lesson plan reviews.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Teacher</Label>
            <Input placeholder="Filter by name" value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)} className="h-9 w-44" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Date</Label>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-9 w-44" />
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Department completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data?.completion_rate != null ? `${Math.round(data.completion_rate)}%` : "—"}</p>
            <p className="mt-1 text-xs text-slate-500">From latest progress sync</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{pendingReviewsCount}</p>
            <p className="mt-1 text-xs text-slate-500">Lesson plans awaiting sign-off</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{overdue.length}</p>
            <p className="mt-1 text-xs text-slate-500">Across filtered teachers</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Teachers</CardTitle>
            <CardDescription>Planned vs delivered where the API provides counts.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
            {!isLoading && teachers.length === 0 ? (
              <p className="text-sm text-slate-600">No teacher rows returned yet. When `/progress/department` is populated, this table fills automatically.</p>
            ) : null}
            <div className="space-y-3">
              {teachers.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    {t.email && <p className="text-xs text-slate-500">{t.email}</p>}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {t.completion_rate != null ? (
                      <Badge variant="info">{Math.round(t.completion_rate)}%</Badge>
                    ) : (
                      <Badge variant="secondary">—</Badge>
                    )}
                    <span className="text-xs text-slate-500">
                      {t.delivered ?? 0}/{t.planned ?? 0} delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue sessions</CardTitle>
            <CardDescription>Escalations from department progress feed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdue.length === 0 ? (
              <p className="text-sm text-slate-600">No overdue rows from the API. Great work.</p>
            ) : (
              overdue.map((row, i) => (
                <div key={`${row.teacher}-${i}`} className="rounded-lg border border-rose-100 bg-rose-50/40 px-3 py-2 text-sm">
                  <p className="font-medium text-rose-900">{row.teacher}</p>
                  <p className="text-rose-800">{row.session}</p>
                  {row.overdue_days != null && <p className="text-xs text-rose-700">{row.overdue_days} days overdue</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Lesson plan reviews</CardTitle>
            <CardDescription>Open a submission, then approve or request changes (UI only until wired to API).</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setReviewOpen(true)}>
            Open queue
          </Button>
        </CardHeader>
      </Card>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review queue</DialogTitle>
            <DialogDescription>Select a lesson plan to preview metadata and actions.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-3">
            <div className="space-y-2">
              {fallbackReviews.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="flex w-full flex-col rounded-lg border border-slate-200 bg-white p-3 text-left text-sm hover:bg-slate-50"
                  onClick={() => {
                    setActiveReview(r);
                    setReviewOpen(false);
                  }}
                >
                  <span className="font-medium">{r.teacher}</span>
                  <span className="text-slate-600">{r.lesson}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activeReview)} onOpenChange={(o) => !o && setActiveReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review lesson plan</DialogTitle>
            <DialogDescription>{activeReview?.lesson}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-slate-700">
            Teacher: <strong>{activeReview?.teacher}</strong>
          </p>
          <Separator />
          <p className="text-sm text-slate-600">
            When your backend exposes review payloads, render objectives, pacing, and differentiation here. For now this modal confirms the review workflow shell.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" type="button" onClick={() => setActiveReview(null)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                toast.success("Marked as reviewed (demo)");
                setActiveReview(null);
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
