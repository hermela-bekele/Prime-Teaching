"use client";

import { Calendar, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionDto } from "@/lib/api-types";
import {
  getSessionDate,
  getSessionNumber,
  getSubtopicLabel,
  getUnitLabel,
  isSessionCompleted,
  sessionBucket,
  sessionCalendarDatePhrase,
  sessionWorkflowLabel
} from "@/lib/session-utils";

function sessionKindBadge(session: SessionDto): { label: string; tone: "quiz" | "teaching" } {
  const st = (session.session_type ?? "").toLowerCase();
  if (st.includes("quiz") || st.includes("unit_test") || st.includes("test_prep") || st.includes("term")) {
    return { label: "Quiz", tone: "quiz" };
  }
  return { label: "Teaching", tone: "teaching" };
}

type AssessmentListCardProps = {
  session: SessionDto;
  selected: boolean;
  onSelect: (s: SessionDto) => void;
};

export function AssessmentListCard({ session, selected, onSelect }: AssessmentListCardProps) {
  const date = getSessionDate(session);
  const bucket = sessionBucket(session);
  const completed = isSessionCompleted(session.status);
  const workflow = sessionWorkflowLabel(session, bucket);
  const kind = sessionKindBadge(session);
  const schedule = sessionCalendarDatePhrase(date);
  const showOverdueCue = bucket === "overdue" && !completed;
  const quizLike = kind.tone === "quiz";

  const workflowPillClass =
    workflow.variant === "missed"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : workflow.variant === "generated"
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : workflow.variant === "delivered"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-100 text-slate-600";

  const kindPillClass =
    kind.tone === "quiz"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-sky-200 bg-sky-50 text-sky-800";

  return (
    <article
      className={cn(
        "cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        showOverdueCue && "border-l-[6px] border-l-rose-500",
        selected && !showOverdueCue && "border-l-4 border-l-blue-600",
        selected && showOverdueCue && "ring-2 ring-sky-400 ring-offset-0"
      )}
      onClick={() => onSelect(session)}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-800"
          aria-hidden
        >
          #{getSessionNumber(session)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold leading-snug text-slate-900">{session.title}</h3>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                workflowPillClass
              )}
            >
              {workflow.label}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium", kindPillClass)}>
              {kind.label}
            </span>
            <p className="truncate text-xs text-slate-500">
              {getUnitLabel(session)} · {getSubtopicLabel(session)}
            </p>
          </div>
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Calendar className={cn("h-4 w-4 shrink-0", showOverdueCue ? "text-rose-500" : "text-slate-400")} aria-hidden />
          <span className={cn("truncate font-medium", showOverdueCue ? "text-rose-600" : "text-slate-600")}>{schedule}</span>
          {showOverdueCue ? (
            <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
              Overdue
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {quizLike ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-rose-700"
              aria-label="Delete"
              onClick={() => toast.message("Delete is not available yet.")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                aria-label="View assessment"
                onClick={() => onSelect(session)}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                aria-label="Edit"
                onClick={() => toast.message("Editing opens from the calendar workflow soon.")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {workflow.variant === "missed" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-rose-700"
                  aria-label="Delete"
                  onClick={() => toast.message("Delete is not available yet.")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
