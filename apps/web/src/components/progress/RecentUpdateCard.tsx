"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SessionDto } from "@/lib/api-types";
import { getSessionDate, getSubtopicLabel, getUnitLabel } from "@/lib/session-utils";
import { format, parseISO } from "date-fns";

function formatPlanned(iso: string): string {
  if (!iso) return "";
  try {
    const d = parseISO(iso.includes("T") ? iso : `${iso}T12:00:00`);
    return format(d, "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export type RecentTone = "completed" | "missed" | "partial" | "rescheduled";

function toneBadge(tone: RecentTone) {
  switch (tone) {
    case "completed":
      return <Badge className="border-emerald-200 bg-emerald-50 font-semibold text-emerald-800 hover:bg-emerald-50">Completed</Badge>;
    case "missed":
      return <Badge className="border-rose-200 bg-rose-50 font-semibold text-rose-800 hover:bg-rose-50">Missed</Badge>;
    case "partial":
      return (
        <Badge className="border-amber-200 bg-amber-50 font-semibold text-amber-900 hover:bg-amber-50">Partially completed</Badge>
      );
    case "rescheduled":
      return <Badge className="border-teal-200 bg-teal-50 font-semibold text-teal-900 hover:bg-teal-50">Rescheduled</Badge>;
    default:
      return null;
  }
}

type RecentUpdateCardProps = {
  session: SessionDto;
  tone: RecentTone;
  subtitle: string;
  showDeviation?: boolean;
};

export function RecentUpdateCard({ session, tone, subtitle, showDeviation }: RecentUpdateCardProps) {
  const reason = session.progress?.deviation_reason?.trim();

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{session.title}</h3>
        {toneBadge(tone)}
      </div>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      {showDeviation && reason ? (
        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">{reason}</div>
      ) : null}
    </article>
  );
}

export function deriveRecentUpdate(session: SessionDto): {
  tone: RecentTone;
  subtitle: string;
  showDeviation: boolean;
} | null {
  const p = session.progress;
  const c = (p?.completion_status ?? "").toLowerCase();
  const st = session.status.toLowerCase();
  const date = getSessionDate(session);
  const unitLine = [getUnitLabel(session), getSubtopicLabel(session)].filter((x) => x && x !== "—").join(" · ");

  if (c === "completed" || st === "delivered" || st === "completed") {
    const sub = unitLine ? `${unitLine} · ${formatPlanned(date)}` : formatPlanned(date);
    return { tone: "completed", subtitle: sub || formatPlanned(date), showDeviation: false };
  }
  if (c === "missed" || st === "missed") {
    const sub = unitLine ? `${unitLine} · Not delivered` : "Not delivered";
    return { tone: "missed", subtitle: sub, showDeviation: true };
  }
  if (c === "partially_completed") {
    const sub = unitLine ? `${unitLine} · ${formatPlanned(date)}` : formatPlanned(date);
    return { tone: "partial", subtitle: sub, showDeviation: Boolean(p?.deviation_reason?.trim()) };
  }
  if (c === "rescheduled" || st === "rescheduled") {
    const sub = unitLine ? `${unitLine} · ${formatPlanned(date)}` : formatPlanned(date);
    return { tone: "rescheduled", subtitle: sub, showDeviation: false };
  }
  if (c && c !== "not_started") {
    const sub = unitLine ? `${unitLine} · ${formatPlanned(date)}` : formatPlanned(date);
    return { tone: "completed", subtitle: sub, showDeviation: false };
  }
  return null;
}
