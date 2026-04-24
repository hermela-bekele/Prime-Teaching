"use client";

import { useEffect, useMemo, useState } from "react";

import { SessionCard } from "@/components/calendar/SessionCard";
import { deriveRecentUpdate, RecentUpdateCard } from "@/components/progress/RecentUpdateCard";
import { UpdateProgressForm } from "@/components/progress/UpdateProgressForm";
import { useSessions } from "@/hooks/use-sessions";
import type { SessionDto } from "@/lib/api-types";
import { getSessionDate, isSessionCompleted, sessionBucket } from "@/lib/session-utils";

function sortSessions(sessions: SessionDto[]): SessionDto[] {
  return [...sessions].sort((a, b) => {
    const da = getSessionDate(a) || "";
    const db = getSessionDate(b) || "";
    return da.localeCompare(db);
  });
}

function hasRecentUpdate(session: SessionDto): boolean {
  const c = (session.progress?.completion_status ?? "").toLowerCase();
  if (c && c !== "not_started") return true;
  const st = session.status.toLowerCase();
  return st === "delivered" || st === "missed" || st === "rescheduled" || st === "completed";
}

export default function TeacherProgressPage() {
  const { data: sessions = [], isLoading } = useSessions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pending = useMemo(() => {
    return sortSessions(sessions.filter((s) => !isSessionCompleted(s.status)));
  }, [sessions]);

  const recentRows = useMemo(() => {
    const rows = sessions
      .filter(hasRecentUpdate)
      .map((s) => {
        const meta = deriveRecentUpdate(s);
        return meta ? { session: s, ...meta } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => (getSessionDate(b.session) || "").localeCompare(getSessionDate(a.session) || ""));
    return rows.slice(0, 10);
  }, [sessions]);

  useEffect(() => {
    if (!pending.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((id) => {
      if (id && pending.some((s) => s.id === id)) return id;
      const overdue = pending.find((s) => sessionBucket(s) === "overdue");
      const first = overdue ?? pending[0];
      return first ? first.id : null;
    });
  }, [pending]);

  const selected = useMemo(() => pending.find((s) => s.id === selectedId) ?? null, [pending, selectedId]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Progress</h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">Track delivery and update what actually happened.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] xl:items-start">
        <div className="min-w-0 space-y-10">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent updates</h2>
            {isLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
            {!isLoading && recentRows.length === 0 ? (
              <p className="text-sm text-slate-500">No recent updates yet. Save progress on a session to see it here.</p>
            ) : null}
            <div className="space-y-3">
              {recentRows.map(({ session, tone, subtitle, showDeviation }) => (
                <RecentUpdateCard
                  key={session.id}
                  session={session}
                  tone={tone}
                  subtitle={subtitle}
                  showDeviation={showDeviation}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Pending sessions</h2>
            {!isLoading && pending.length === 0 ? (
              <p className="text-sm text-slate-500">No pending sessions. Great work staying on track.</p>
            ) : null}
            <div className="space-y-3">
              {pending.map((s) => (
                <SessionCard
                  key={s.id}
                  layout="progress"
                  session={s}
                  selected={selectedId === s.id}
                  onSelect={(row) => setSelectedId(row.id)}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <UpdateProgressForm session={selected} />
        </div>
      </div>
    </div>
  );
}
