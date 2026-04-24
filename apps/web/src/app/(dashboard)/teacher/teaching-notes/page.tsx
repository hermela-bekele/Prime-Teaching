"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";

import { LessonPlanListCard } from "@/components/lesson-plans/LessonPlanListCard";
import { TeachingNoteDetailPanel } from "@/components/teaching-notes/TeachingNoteDetailPanel";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/hooks/use-sessions";
import type { SessionDto } from "@/lib/api-types";
import { getSessionDate, getSessionNumber, sessionCalendarDatePhrase } from "@/lib/session-utils";

function sortSessions(sessions: SessionDto[]): SessionDto[] {
  return [...sessions].sort((a, b) => {
    const da = getSessionDate(a) || "";
    const db = getSessionDate(b) || "";
    if (da !== db) return da.localeCompare(db);
    return getSessionNumber(a) - getSessionNumber(b);
  });
}

function groupSessionsByPlannedDay(sessions: SessionDto[]): { key: string; label: string; sessions: SessionDto[] }[] {
  const sorted = sortSessions(sessions);
  const groups: { key: string; label: string; sessions: SessionDto[] }[] = [];
  for (const s of sorted) {
    const raw = getSessionDate(s);
    const key = raw ? raw.slice(0, 10) : "unknown";
    const label = raw ? sessionCalendarDatePhrase(raw) : "Date not set";
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.sessions.push(s);
    } else {
      groups.push({ key, label, sessions: [s] });
    }
  }
  return groups;
}

export default function TeacherTeachingNotesPage() {
  const { data: sessions = [], isLoading } = useSessions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const groups = useMemo(() => groupSessionsByPlannedDay(sessions), [sessions]);

  useEffect(() => {
    if (sessions.length === 0) {
      setSelectedId(null);
      return;
    }
    const sorted = sortSessions(sessions);
    setSelectedId((id) => {
      if (id && sorted.some((s) => s.id === id)) return id;
      const withNote = sorted.find((s) => s.teaching_note);
      const fallback = sorted[0];
      if (!fallback) return null;
      return (withNote ?? fallback).id;
    });
  }, [sessions]);

  const selected = useMemo(() => sessions.find((s) => s.id === selectedId) ?? null, [sessions, selectedId]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Teaching Notes</h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          In-class scripts and explanations to help you teach with confidence.
        </p>
      </div>

      <div className="grid min-h-0 gap-6 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] lg:items-start">
        <div className="rounded-xl bg-slate-100/70 p-3 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-1">
          {isLoading ? <p className="px-2 text-sm text-slate-500">Loading sessions…</p> : null}
          {!isLoading && sessions.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
              No sessions yet. Teaching notes appear here once your calendar includes sessions.
            </p>
          ) : null}
          {!isLoading &&
            groups.map((group) => (
              <div key={group.key} className="mb-6 last:mb-0">
                <div className="mb-2 flex items-center justify-between gap-2 px-1 pt-1">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
                    <Calendar className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    <span className="truncate">{group.label}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                      aria-label="Open first lesson in group"
                      onClick={() => {
                        const first = group.sessions[0];
                        if (first) setSelectedId(first.id);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                      aria-label="Edit"
                      onClick={() => toast.message("Editing from the calendar workflow is coming soon.")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {group.sessions.map((s) => (
                    <LessonPlanListCard
                      key={s.id}
                      session={s}
                      selected={selectedId === s.id}
                      onSelect={(row) => setSelectedId(row.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <TeachingNoteDetailPanel sessionId={selected?.id ?? null} sessionTitle={selected?.title ?? null} />
        </div>
      </div>
    </div>
  );
}
