import { differenceInCalendarDays, format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO, startOfDay } from "date-fns";

import type { SessionDto } from "@/lib/api-types";

export function getSessionDate(s: SessionDto): string {
  return s.planned_date ?? s.plannedDate ?? "";
}

export function getSessionNumber(s: SessionDto): number {
  return s.session_number ?? s.sessionNumber ?? 0;
}

export function getUnitLabel(s: SessionDto): string {
  if (s.unit_name?.trim()) return s.unit_name;
  const u = s.unit;
  if (typeof u === "string" && u.trim()) return u;
  if (u && typeof u === "object" && "title" in u && (u as { title?: string }).title) {
    return String((u as { title: string }).title);
  }
  return "—";
}

export function getSubtopicLabel(s: SessionDto): string {
  if (s.subtopic_name?.trim()) return s.subtopic_name;
  const st = s.subtopic;
  if (typeof st === "string" && st.trim()) return st;
  if (st && typeof st === "object" && "name" in st && (st as { name?: string }).name) {
    return String((st as { name: string }).name);
  }
  const goal = s.learning_goal_summary?.trim();
  if (goal) return goal.length > 48 ? `${goal.slice(0, 45)}…` : goal;
  return "—";
}

export function getMaterials(s: SessionDto): string[] {
  return s.materials_required ?? s.materials ?? [];
}

const DONE = new Set(["completed", "delivered", "done"]);

export function isSessionCompleted(status: string): boolean {
  return DONE.has(status.toLowerCase());
}

export function sessionBucket(
  s: SessionDto
): "today" | "upcoming" | "overdue" | "completed" {
  const status = s.status.toLowerCase();
  if (isSessionCompleted(status)) return "completed";
  const iso = getSessionDate(s);
  if (!iso) return "upcoming";
  const d = startOfDay(parseISO(iso.includes("T") ? iso : `${iso}T12:00:00`));
  if (isToday(d)) return "today";
  if (isPast(d) && !isToday(d)) return "overdue";
  return "upcoming";
}

export function relativeSessionLabel(iso: string): string {
  if (!iso) return "";
  const d = parseISO(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d, yyyy");
}

/** Short phrase for dashboard cards (e.g. "Tomorrow", "In 3 days", "2 days ago"). */
export function sessionSchedulePhrase(
  iso: string,
  bucket: "today" | "upcoming" | "overdue" | "completed"
): string {
  if (!iso) return "";
  const d = startOfDay(parseISO(iso.includes("T") ? iso : `${iso}T12:00:00`));
  const today = startOfDay(new Date());
  if (bucket === "today" || isToday(d)) return "Today";
  if (bucket === "overdue" || (isPast(d) && !isToday(d))) {
    return formatDistanceToNow(d, { addSuffix: true });
  }
  const diff = differenceInCalendarDays(d, today);
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff <= 14) return `In ${diff} days`;
  return format(d, "MMM d, yyyy");
}

export function primaryMaterialTag(materials: string[]): { label: string; tone: "teaching" | "quiz" } {
  const joined = materials.join(" ").toLowerCase();
  if (joined.includes("quiz") || joined.includes("assessment")) return { label: "Quiz", tone: "quiz" };
  return { label: "Teaching", tone: "teaching" };
}

export type SessionWorkflowVariant = "generated" | "planned" | "missed" | "delivered";

export function sessionWorkflowLabel(
  session: SessionDto,
  bucket: "today" | "upcoming" | "overdue" | "completed"
): { label: string; variant: SessionWorkflowVariant } {
  if (isSessionCompleted(session.status)) return { label: "Delivered", variant: "delivered" };
  if (bucket === "overdue") return { label: "Missed", variant: "missed" };
  if (session.lesson_plan) return { label: "Generated", variant: "generated" };
  return { label: "Planned", variant: "planned" };
}

/** Relative date for calendar list (e.g. "4 days ago", "Today") regardless of completion. */
export function sessionCalendarDatePhrase(iso: string): string {
  if (!iso) return "—";
  const d = startOfDay(parseISO(iso.includes("T") ? iso : `${iso}T12:00:00`));
  const today = startOfDay(new Date());
  if (isToday(d)) return "Today";
  if (isPast(d) && !isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
  const diff = differenceInCalendarDays(d, today);
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff <= 30) return `In ${diff} days`;
  return format(d, "MMM d, yyyy");
}

export type CalendarSessionFilter = "all" | "planned" | "generated" | "delivered" | "missed" | "rescheduled";

export function sessionMatchesCalendarFilter(session: SessionDto, filter: CalendarSessionFilter): boolean {
  if (filter === "all") return true;
  const bucket = sessionBucket(session);
  const status = session.status.toLowerCase();
  const wf = sessionWorkflowLabel(session, bucket);
  if (filter === "delivered") return wf.variant === "delivered";
  if (filter === "missed") return wf.variant === "missed";
  if (filter === "planned") return wf.variant === "planned";
  if (filter === "generated") return wf.variant === "generated";
  if (filter === "rescheduled") return status.includes("reschedule");
  return false;
}

export function statusBadgeVariant(
  status: string
): "success" | "info" | "warning" | "danger" | "secondary" {
  const x = status.toLowerCase();
  if (DONE.has(x)) return "secondary";
  if (x === "today" || x === "scheduled") return "info";
  if (x === "overdue" || x === "late") return "danger";
  if (x === "pending" || x === "draft") return "warning";
  return "info";
}
