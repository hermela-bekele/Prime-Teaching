"use client";

import { useMemo, useState } from "react";
import { teacherSessions, teacherStats, type SessionItem, type SessionStatus } from "@/lib/prime-data";

const tabs: SessionStatus[] = ["upcoming", "today", "overdue"];

const statusTone: Record<SessionStatus, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  today: "bg-emerald-100 text-emerald-700",
  overdue: "bg-rose-100 text-rose-700",
  completed: "bg-slate-200 text-slate-700"
};

function relativeDate(isoDate: string) {
  const target = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((target.getTime() - today.getTime()) / msDay);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return isoDate;
}

export function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<SessionStatus>("upcoming");
  const [selected, setSelected] = useState<SessionItem | null>(null);
  const [generated, setGenerated] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [answerKey, setAnswerKey] = useState(false);

  const sessions = useMemo(
    () => teacherSessions.filter((item) => item.status === activeTab),
    [activeTab]
  );

  const generateMaterial = (material: "lesson" | "note" | "quiz") => {
    if (!selected) return;
    const key = `${selected.id}-${material}`;
    if (generated[key]) return;
    setLoading((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setLoading((prev) => ({ ...prev, [key]: false }));
      setGenerated((prev) => ({ ...prev, [key]: true }));
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {teacherStats.map((card) => (
          <article key={card.label} className="rounded-xl border border-blue-100 bg-white p-4">
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-blue-800">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-blue-100 bg-white p-4">
        <div className="mb-4 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`rounded-full px-3 py-1 text-sm ${activeTab === tab ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {sessions.map((session) => (
            <article key={session.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500">Session {session.sessionNumber}</p>
                  <h3 className="font-semibold">{session.title}</h3>
                  <p className="text-sm text-slate-600">
                    {session.unit} · {session.subtopic}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Planned: {session.plannedDate} ({relativeDate(session.plannedDate)})
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[session.status]}`}>
                  {session.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600">
                  Materials: {session.materials.join(" / ")}
                </p>
                <div className="flex gap-2">
                  <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" type="button" onClick={() => setSelected(session)}>
                    Open session
                  </button>
                  <button className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white" type="button">
                    Mark delivered
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected && (
        <section className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Session Details: {selected.title}</h2>
            <button className="text-sm text-slate-500" type="button" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-lg border p-3">
              <h3 className="font-semibold">Lesson Plan</h3>
              {generated[`${selected.id}-lesson`] ? (
                <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
                  <li>Objectives and prior knowledge checks</li>
                  <li>Opening, guided delivery, and independent practice</li>
                  <li>Homework and required materials</li>
                </ul>
              ) : (
                <button
                  className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white"
                  type="button"
                  onClick={() => generateMaterial("lesson")}
                >
                  {loading[`${selected.id}-lesson`] ? "Generating..." : "Generate"}
                </button>
              )}
            </article>
            <article className="rounded-lg border p-3">
              <h3 className="font-semibold">Teaching Note</h3>
              {generated[`${selected.id}-note`] ? (
                <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
                  <li>Intro script and worked examples</li>
                  <li>Differentiated support for all ability levels</li>
                  <li>Common mistakes and wrap-up prompts</li>
                </ul>
              ) : (
                <button
                  className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white"
                  type="button"
                  onClick={() => generateMaterial("note")}
                >
                  {loading[`${selected.id}-note`] ? "Generating..." : "Generate"}
                </button>
              )}
            </article>
            <article className="rounded-lg border p-3">
              <h3 className="font-semibold">Quiz</h3>
              {generated[`${selected.id}-quiz`] ? (
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  <p>5 questions · 20 min · medium difficulty</p>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={answerKey} onChange={(e) => setAnswerKey(e.target.checked)} />
                    Show answer key
                  </label>
                  {answerKey && <p>Answer key + marking guide visible.</p>}
                </div>
              ) : (
                <button
                  className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white"
                  type="button"
                  onClick={() => generateMaterial("quiz")}
                >
                  {loading[`${selected.id}-quiz`] ? "Generating..." : "Generate"}
                </button>
              )}
            </article>
          </div>

          <form className="mt-4 grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
            <h4 className="md:col-span-2 font-semibold">Progress Form</h4>
            <select className="rounded border px-3 py-2 text-sm">
              <option>Completion status</option>
              <option>Delivered as planned</option>
              <option>Partially delivered</option>
              <option>Not delivered</option>
            </select>
            <select className="rounded border px-3 py-2 text-sm">
              <option>Delivery confidence</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <input className="rounded border px-3 py-2 text-sm md:col-span-2" placeholder="Deviation reason (if any)" />
            <button className="w-fit rounded bg-blue-700 px-4 py-2 text-sm text-white" type="button">
              Submit
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
