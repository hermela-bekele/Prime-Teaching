"use client";

import { useEffect, useMemo, useState } from "react";

import { AssessmentDetailPanel } from "@/components/assessments/AssessmentDetailPanel";
import { AssessmentListCard } from "@/components/assessments/AssessmentListCard";
import { useSessions } from "@/hooks/use-sessions";
import type { SessionDto } from "@/lib/api-types";
import { getSessionDate, getSessionNumber } from "@/lib/session-utils";

function sortSessions(sessions: SessionDto[]): SessionDto[] {
  return [...sessions].sort((a, b) => {
    const da = getSessionDate(a) || "";
    const db = getSessionDate(b) || "";
    if (da !== db) return da.localeCompare(db);
    return getSessionNumber(a) - getSessionNumber(b);
  });
}

export default function TeacherAssessmentsPage() {
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
      const fallback = sorted[0];
      return fallback ? fallback.id : null;
    });
  }, [sorted]);

  const selected = useMemo(() => sorted.find((s) => s.id === selectedId) ?? null, [sorted, selectedId]);
  const selectedNum = selected ? getSessionNumber(selected) : null;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Assessments</h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          Quizzes, unit tests, and practice sets ready to use.
        </p>
      </div>

      <div className="grid min-h-0 gap-6 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-xl bg-slate-100/70 p-3 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-1">
          {isLoading ? <p className="px-2 text-sm text-slate-500">Loading sessions…</p> : null}
          {!isLoading && sorted.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
              No sessions yet. Assessments appear here once your calendar includes sessions.
            </p>
          ) : null}
          <div className="space-y-3">
            {sorted.map((s) => (
              <AssessmentListCard
                key={s.id}
                session={s}
                selected={selectedId === s.id}
                onSelect={(row) => setSelectedId(row.id)}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <AssessmentDetailPanel
            sessionId={selected?.id ?? null}
            sessionTitle={selected?.title ?? null}
            sessionNumber={selectedNum}
          />
        </div>
      </div>
    </div>
  );
}
