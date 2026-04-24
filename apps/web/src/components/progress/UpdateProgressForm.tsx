"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SessionDto } from "@/lib/api-types";
import { getApiErrorMessage, postProgressUpdate } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const COMPLETION_OPTIONS = [
  { value: "completed", label: "Completed", dot: "bg-emerald-500", border: "border-emerald-200" },
  { value: "partially_completed", label: "Partially completed", dot: "bg-amber-400", border: "border-amber-200" },
  { value: "missed", label: "Missed", dot: "bg-rose-500", border: "border-rose-200" },
  { value: "rescheduled", label: "Rescheduled", dot: "bg-teal-500", border: "border-teal-200" }
] as const;

const CONFIDENCE_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
] as const;

type UpdateProgressFormProps = {
  session: SessionDto | null;
};

export function UpdateProgressForm({ session }: UpdateProgressFormProps) {
  const qc = useQueryClient();
  const [completion, setCompletion] = useState<string>("completed");
  const [confidence, setConfidence] = useState<string>("medium");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState(false);

  useEffect(() => {
    if (!session) {
      setCompletion("completed");
      setConfidence("medium");
      setNotes("");
      setFollowUp(false);
      return;
    }
    const p = session.progress;
    const c = (p?.completion_status ?? "").toLowerCase();
    const st = session.status.toLowerCase();
    if (c === "partially_completed" || c === "missed" || c === "rescheduled" || c === "completed") {
      setCompletion(c);
    } else if (st === "missed") {
      setCompletion("missed");
    } else if (st === "rescheduled") {
      setCompletion("rescheduled");
    } else if (st === "delivered" || st === "completed") {
      setCompletion("completed");
    } else {
      setCompletion("completed");
    }
    setConfidence((p?.delivery_confidence ?? "medium").toLowerCase());
    setNotes(p?.deviation_reason ?? "");
    setFollowUp(Boolean(p?.follow_up_required));
  }, [session]);

  const save = useMutation({
    mutationFn: () => {
      if (!session) throw new Error("No session");
      return postProgressUpdate({
        session_id: session.id,
        completion_status: completion,
        delivery_confidence: confidence,
        deviation_reason: notes.trim() || undefined,
        notes: notes.trim() || undefined,
        follow_up_required: followUp
      });
    },
    onSuccess: () => {
      toast.success("Progress saved");
      void qc.invalidateQueries({ queryKey: ["calendar", "my-sessions"] });
      void qc.invalidateQueries({ queryKey: ["progress", "teacher"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e))
  });

  if (!session) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Update progress</h2>
        <p className="mt-1 text-sm text-slate-600">
          Record what happened in this session — used by your department head and school leader.
        </p>
        <p className="mt-6 text-sm text-slate-500">Select a session under Pending sessions to update its progress.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Update progress</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        Record what happened in this session — used by your department head and school leader.
      </p>

      <div className="mt-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-900">Completion status</Label>
          <div className="grid grid-cols-2 gap-3">
            {COMPLETION_OPTIONS.map((opt) => {
              const active = completion === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCompletion(opt.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left text-sm font-medium transition-colors",
                    active ? "border-blue-600 bg-blue-50/60 text-blue-900" : "border-slate-200 text-slate-800 hover:border-slate-300"
                  )}
                >
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", opt.dot)} aria-hidden />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-900">Delivery confidence</Label>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {CONFIDENCE_OPTIONS.map((opt) => {
              const active = confidence === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfidence(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "border border-blue-600 bg-blue-50 text-blue-900 shadow-sm" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="progress-notes" className="text-sm font-semibold text-slate-900">
            Notes / deviation reason
          </Label>
          <Textarea
            id="progress-notes"
            rows={5}
            placeholder="What went well or didn't go to plan?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none border-slate-200 bg-white text-sm"
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Follow-up required</p>
            <p className="mt-0.5 text-xs text-slate-500">Flag for your department head to review.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={followUp}
            onClick={() => setFollowUp((v) => !v)}
            className={cn(
              "relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              followUp ? "bg-blue-600" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
                followUp ? "right-1" : "left-1"
              )}
            />
          </button>
        </div>

        <Button
          type="button"
          className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold hover:bg-blue-700"
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save progress
        </Button>
      </div>
    </div>
  );
}
