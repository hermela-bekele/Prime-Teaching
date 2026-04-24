"use client";

import { departmentTeacherProgress, overdueTeacherSessions, pendingPlanReviews } from "@/lib/prime-data";

export function DepartmentOverview() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {departmentTeacherProgress.map((item) => (
          <article key={item.teacher} className="rounded-xl border border-blue-100 bg-white p-4">
            <h3 className="font-semibold">{item.teacher}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {item.delivered}/{item.planned} delivered
            </p>
            <div className="mt-3 h-2 rounded bg-slate-100">
              <div className="h-2 rounded bg-blue-600" style={{ width: `${item.completion}%` }} />
            </div>
            <p className="mt-2 text-sm text-blue-700">{item.completion}% completion</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-blue-100 bg-white p-4">
          <h3 className="font-semibold">Overdue Sessions</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {overdueTeacherSessions.map((item) => (
              <li key={item.session} className="rounded border border-slate-200 p-2">
                <span className="font-medium">{item.teacher}</span> · {item.session} · {item.overdueDays} day(s) overdue
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-blue-100 bg-white p-4">
          <h3 className="font-semibold">Pending Lesson Plan Reviews</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {pendingPlanReviews.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded border border-slate-200 p-2">
                <span>
                  {item.teacher} · {item.lesson}
                </span>
                <div className="flex gap-2">
                  <button className="rounded border px-2 py-1">Comment</button>
                  <button className="rounded bg-blue-600 px-2 py-1 text-white">Approve</button>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
