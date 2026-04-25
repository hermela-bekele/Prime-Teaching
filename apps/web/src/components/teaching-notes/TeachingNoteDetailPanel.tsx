"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { TeachingNoteDto } from "@/lib/api-types";
import { sessionNoteQueryKey, useTeachingNoteBySession } from "@/hooks/use-teaching-note";
import { useGenerationJob } from "@/hooks/use-generation-job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { extractJobId, getApiErrorMessage, postGenerateTeachingNote } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Accent = "blue" | "amber" | "teal" | "violet" | "rose" | "navy";

const ACCENT: Record<Accent, string> = {
  blue: "border-l-[6px] border-l-blue-600 bg-slate-50/50",
  amber: "border-l-[6px] border-l-amber-400 bg-amber-50/40",
  teal: "border-l-[6px] border-l-teal-500 bg-teal-50/35",
  violet: "border-l-[6px] border-l-violet-500 bg-violet-50/35",
  rose: "border-l-[6px] border-l-rose-500 bg-rose-50/35",
  navy: "border-l-[6px] border-l-blue-950 bg-slate-50/60"
};

function NoteSection({ title, accent, children }: { title: string; accent: Accent; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-xl border border-slate-200/90 p-5 shadow-sm", ACCENT[accent])}>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

function NoteBody({ text }: { text: string }) {
  const t = text.trim();
  if (!t) return null;
  const lines = t.split(/\n/).map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);
  const bulletLike = nonEmpty.every((l) => /^[-•*]\s/.test(l) || /^\d+\.\s/.test(l));
  if (bulletLike && nonEmpty.length > 1 && nonEmpty.every((l) => /^[-•*]\s/.test(l))) {
    return (
      <ul className="list-inside list-disc space-y-2">
        {nonEmpty.map((l, i) => (
          <li key={i}>{l.replace(/^[-•*]\s*/, "")}</li>
        ))}
      </ul>
    );
  }
  if (bulletLike && nonEmpty.length > 1 && nonEmpty.every((l) => /^\d+\.\s/.test(l))) {
    return (
      <ol className="list-inside list-decimal space-y-2">
        {nonEmpty.map((l, i) => (
          <li key={i}>{l.replace(/^\d+\.\s*/, "")}</li>
        ))}
      </ol>
    );
  }
  return <div className="whitespace-pre-wrap">{t}</div>;
}

function renderNoteSections(note: TeachingNoteDto) {
  const blocks: { title: string; accent: Accent; text: string | null | undefined }[] = [
    { title: "Teacher introduction script", accent: "blue", text: note.teacher_intro_script },
    { title: "Step-by-step explanation", accent: "blue", text: note.stepwise_explanation },
    { title: "Worked examples", accent: "blue", text: note.worked_examples },
    { title: "Teacher questions to ask", accent: "blue", text: note.teacher_questions },
    { title: "Student activity guidance", accent: "blue", text: note.student_activity_guidance },
    { title: "Real-life application", accent: "blue", text: note.real_life_application },
    { title: "Support — struggling students", accent: "amber", text: note.struggling_student_support },
    { title: "Support — average students", accent: "teal", text: note.average_student_support },
    { title: "Extension — advanced students", accent: "violet", text: note.advanced_student_extension },
    { title: "Common mistakes to watch for", accent: "rose", text: note.common_mistakes },
    { title: "Lesson wrap-up & exit ticket", accent: "navy", text: note.lesson_wrap_up }
  ];

  return blocks
    .filter((b) => b.text?.trim())
    .map((b) => (
      <NoteSection key={b.title} title={b.title} accent={b.accent}>
        <NoteBody text={b.text ?? ""} />
      </NoteSection>
    ));
}

type TeachingNoteDetailPanelProps = {
  sessionId: string | null;
  sessionTitle?: string | null;
};

export function TeachingNoteDetailPanel({ sessionId, sessionTitle }: TeachingNoteDetailPanelProps) {
  const qc = useQueryClient();
  const { data: note, isLoading, isError, error, refetch } = useTeachingNoteBySession(sessionId);
  const [jobId, setJobId] = useState<string | null>(null);
  const jobQuery = useGenerationJob(jobId, Boolean(jobId));

  const notFound = isError && axios.isAxiosError(error) && error.response?.status === 404;

  const generate = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("No session");
      return postGenerateTeachingNote({ session_id: sessionId });
    },
    onSuccess: (res) => {
      const id = extractJobId(res);
      if (id) setJobId(id);
      else {
        toast.message("Generation started", { description: "Refreshing when ready…" });
        void qc.invalidateQueries({ queryKey: sessionNoteQueryKey(sessionId) });
      }
    },
    onError: (e) => toast.error(getApiErrorMessage(e))
  });

  useEffect(() => {
    const st = jobQuery.data?.status?.toLowerCase() ?? "";
    if (!jobId || !st) return;
    if (st === "completed" || st === "success") {
      toast.success("Teaching note ready");
      setJobId(null);
      void qc.invalidateQueries({ queryKey: sessionNoteQueryKey(sessionId) });
      void qc.invalidateQueries({ queryKey: ["calendar", "session", sessionId] });
      void qc.invalidateQueries({ queryKey: ["calendar", "my-sessions"] });
    }
    if (st === "failed" || st === "error") {
      toast.error(jobQuery.data?.message ?? "Generation failed");
      setJobId(null);
    }
  }, [jobId, jobQuery.data, qc, sessionId]);

  if (!sessionId) {
    return (
      <div className="flex min-h-[min(70vh,520px)] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="max-w-sm text-sm leading-relaxed text-slate-500">
          Select a lesson from the list to view AI teaching notes for that session.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading teaching notes…
      </div>
    );
  }

  if (isError && !notFound) {
    return (
      <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-rose-700">{getApiErrorMessage(error)}</p>
        <Button className="mt-3" size="sm" variant="outline" type="button" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const generating = generate.isPending || Boolean(jobId);
  const hasNote = Boolean(note && !notFound);
  const sections = hasNote && note ? renderNoteSections(note) : [];

  return (
    <div className="flex h-[min(70vh,560px)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:h-full">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          {sessionTitle ? <p className="truncate text-sm font-semibold text-slate-900">{sessionTitle}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            {hasNote ? (
              <Badge className="border-sky-200 bg-sky-50 font-semibold text-sky-800 hover:bg-sky-50">Generated</Badge>
            ) : (
              <Badge variant="secondary" className="font-medium">
                Not generated
              </Badge>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          type="button"
          className="border-slate-200 bg-white font-medium shadow-sm"
          disabled={generating}
          onClick={() => generate.mutate()}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {hasNote ? "Regenerating…" : "Generating…"}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {hasNote ? "Regenerate" : "Generate"}
            </>
          )}
        </Button>
      </div>

      {jobQuery.data && jobId && (
        <div className="border-b border-slate-100 bg-blue-50/50 px-5 py-2 text-xs text-blue-900">
          Job status: <strong>{jobQuery.data.status}</strong>
          {jobQuery.data.progress != null ? ` · ${Math.round(jobQuery.data.progress * 100)}%` : null}
        </div>
      )}

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-4 p-5 sm:p-6">
          {notFound || !hasNote ? (
            <p className="text-sm text-slate-600">
              No teaching note for this session yet. Use <strong>Generate</strong> to create in-class scripts, questions,
              differentiation, and wrap-up prompts.
            </p>
          ) : sections.length > 0 ? (
            sections
          ) : (
            <p className="text-sm text-slate-600">Note record exists but all sections are empty.</p>
          )}
        </div>
      </div>
    </div>
  );
}
