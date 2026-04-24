"use client";

import { toast } from "sonner";
import { Calendar, Check, Copy, FileText, ListChecks, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionDto } from "@/lib/api-types";
import {
  getMaterials,
  getSessionDate,
  getSessionNumber,
  getSubtopicLabel,
  getUnitLabel,
  isSessionCompleted,
  primaryMaterialTag,
  sessionBucket,
  sessionCalendarDatePhrase,
  sessionSchedulePhrase,
  sessionWorkflowLabel
} from "@/lib/session-utils";

type SessionCardProps = {
  session: SessionDto;
  selected?: boolean;
  onSelect: (s: SessionDto) => void;
  onLessonPlan?: (s: SessionDto) => void;
  onMarkDelivered?: (s: SessionDto) => void;
  marking?: boolean;
  /** Calendar list: no lesson-plan row, checklist icon, sky selection ring, date line from planned date. */
  layout?: "dashboard" | "calendar" | "progress";
};

export function SessionCard({
  session,
  selected,
  onSelect,
  onLessonPlan,
  onMarkDelivered,
  marking,
  layout = "dashboard"
}: SessionCardProps) {
  const date = getSessionDate(session);
  const bucket = sessionBucket(session);
  const mats = getMaterials(session);
  const materialTag = primaryMaterialTag(mats);
  const workflow = sessionWorkflowLabel(session, bucket);
  const schedule =
    layout === "calendar" || layout === "progress"
      ? sessionCalendarDatePhrase(date)
      : sessionSchedulePhrase(date, bucket);
  const completed = isSessionCompleted(session.status);
  const isCalendar = layout === "calendar" || layout === "progress";
  const isProgress = layout === "progress";

  const workflowPillClass =
    workflow.variant === "missed"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : workflow.variant === "generated"
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : workflow.variant === "delivered"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-100 text-slate-600";

  const materialPillClass =
    materialTag.tone === "quiz"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-sky-200 bg-sky-50 text-sky-800";

  const showOverdueCue = bucket === "overdue" && !completed;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-shadow",
        (isCalendar || isProgress) && selected && "ring-2 ring-sky-400 ring-offset-0",
        !isCalendar && selected && "ring-2 ring-blue-500 ring-offset-2",
        showOverdueCue && "border-l-[6px] border-l-rose-500"
      )}
    >
      <div className="p-5">
        <div className="flex cursor-pointer flex-wrap items-start gap-3" onClick={() => onSelect(session)}>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sm font-semibold text-sky-800"
            aria-hidden
          >
            #{getSessionNumber(session)}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h3 className="text-base font-semibold leading-snug text-slate-900">{session.title}</h3>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  materialPillClass
                )}
              >
                {materialTag.label}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {getUnitLabel(session)} · {getSubtopicLabel(session)}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
              workflowPillClass
            )}
          >
            {workflow.label}
          </span>
        </div>

        <div
          className="mt-4 flex cursor-pointer flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"
          onClick={() => onSelect(session)}
        >
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-slate-400" aria-hidden />
            <span
              className={cn(
                "font-medium",
                showOverdueCue ? "text-rose-600" : "text-slate-600"
              )}
            >
              {schedule}
            </span>
            {showOverdueCue ? (
              <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                Overdue
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1 text-slate-400" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
              aria-label="View document"
              onClick={() => onLessonPlan?.(session)}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            {isProgress ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                aria-label="Remove from list"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.message("Remove from list is not available yet.");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : isCalendar ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                aria-label="Session checklist"
              >
                <ListChecks className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800" aria-label="Copy">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!isCalendar ? (
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 underline-offset-4 hover:text-blue-700 hover:underline"
              onClick={() => onLessonPlan?.(session)}
            >
              <FileText className="h-4 w-4 text-slate-400" />
              Lesson plan
            </button>
            {onMarkDelivered && bucket !== "completed" && !completed ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={marking}
                className="border-emerald-500 bg-white font-medium text-emerald-600 shadow-none hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => onMarkDelivered(session)}
              >
                <Check className="mr-1.5 h-4 w-4" />
                Mark delivered
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
