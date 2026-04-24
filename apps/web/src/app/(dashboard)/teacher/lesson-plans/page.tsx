"use client";

import { useEffect, useMemo, useState } from "react";

import { LessonPlanListCard } from "@/components/lesson-plans/LessonPlanListCard";
import { LessonPlanViewer } from "@/components/lesson-plans/LessonPlanViewer";
import { useSessions } from "@/hooks/use-sessions";
import type { SessionDto } from "@/lib/api-types";
import { getSessionDate, getSessionNumber } from "@/lib/session-utils";

function sortSessions(sessions: SessionDto[]): SessionDto[] {
  return [...sessions].sort((a, b) => {
    const na = getSessionNumber(a);
    const nb = getSessionNumber(b);
    if (na !== nb) return na - nb;
    const da = getSessionDate(a) || "";
    const db = getSessionDate(b) || "";
    return da.localeCompare(db);
  });
}

export default function TeacherLessonPlansPage() {
  const { data: sessions = [], isLoading } = useSessions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(() => sortSessions(sessions), [sessions]);

  useEffect(() => {
    if (sorted.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((id) => {
      if (id && sorted.some((s) => s.id === id)) return id;
      const preferred = sorted.find((s) => s.lesson_plan);
      const fallback = sorted[0];
      if (!fallback) return null;
      return (preferred ?? fallback).id;
    });
  }, [sorted]);

  const selected = useMemo(() => sorted.find((s) => s.id === selectedId) ?? null, [sorted, selectedId]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Lesson Plans</h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          Browse and review all your AI-generated lesson plans.
        </p>
      </div>

      <div className="grid min-h-0 gap-6 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-1">
          {isLoading ? <p className="text-sm text-slate-500">Loading sessions…</p> : null}
          {!isLoading && sorted.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              No sessions yet. Lesson plans appear here once your calendar includes sessions.
            </p>
          ) : null}
          {sorted.map((s) => (
            <LessonPlanListCard key={s.id} session={s} selected={selectedId === s.id} onSelect={() => setSelectedId(s.id)} />
          ))}
        </div>

        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <LessonPlanViewer sessionId={selected?.id ?? null} variant="panel" />
        </div>
      </div>
    </div>
  );
}
