"use client";

import { schoolLeaderDepartmentRates, schoolLeaderTrend, supportList } from "@/lib/prime-data";

export function SchoolLeaderDashboard() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {schoolLeaderDepartmentRates.map((item) => (
          <article key={item.department} className="rounded-xl border border-blue-100 bg-white p-4">
            <h3 className="font-semibold">{item.department}</h3>
            <p className="mt-2 text-2xl font-semibold text-blue-700">{item.completion}%</p>
            <p className="text-sm text-slate-500">Completion rate</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-blue-100 bg-white p-4">
        <h3 className="font-semibold">Trend Sparkline</h3>
        <div className="mt-3 flex items-end gap-2">
          {schoolLeaderTrend.map((value, index) => (
            <div key={`${value}-${index}`} className="w-8 rounded-t bg-blue-500/80" style={{ height: `${value}px` }} title={`${value}%`} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-blue-100 bg-white p-4">
          <h3 className="font-semibold">Teachers Needing Support</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {supportList.map((item) => (
              <li key={item.name} className="rounded border border-slate-200 p-2">
                <span className="font-medium">{item.name}</span> · {item.reason}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-blue-100 bg-white p-4">
          <h3 className="font-semibold">Downloadable Reports</h3>
          <div className="mt-3 flex gap-2">
            <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white">Weekly PDF</button>
            <button className="rounded border border-slate-300 px-3 py-2 text-sm">CSV Export</button>
          </div>
        </article>
      </section>
    </div>
  );
}
