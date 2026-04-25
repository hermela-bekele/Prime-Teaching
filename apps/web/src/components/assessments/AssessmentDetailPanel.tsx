"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Clock, Download, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { AssessmentDto } from "@/lib/api-types";
import { assessmentsSessionQueryKey, pickPrimaryAssessment, useAssessmentsBySession } from "@/hooks/use-assessments";
import { useGenerationJob } from "@/hooks/use-generation-job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { extractJobId, getApiErrorMessage, postGenerateAssessment } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function formatAssessmentType(t?: string): string {
  return (t ?? "quiz").replace(/_/g, " ").toUpperCase();
}

function formatDifficulty(d?: string): string {
  if (!d) return "mixed";
  return d.toLowerCase().replace(/_/g, " ");
}

function DetailBlock({
  title,
  accent,
  children
}: {
  title: string;
  accent: "blue" | "emerald" | "sky";
  children: React.ReactNode;
}) {
  const bar =
    accent === "blue"
      ? "border-l-[6px] border-l-blue-600"
      : accent === "emerald"
        ? "border-l-[6px] border-l-emerald-600"
        : "border-l-[6px] border-l-sky-500";
  const titleColor =
    accent === "blue" ? "text-blue-600" : accent === "emerald" ? "text-emerald-700" : "text-sky-700";

  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", bar)}>
      <h3 className={cn("text-xs font-bold uppercase tracking-[0.14em]", titleColor)}>{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-slate-800">{children}</div>
    </section>
  );
}

function renderTextBlock(text: string | null | undefined) {
  const t = (text ?? "").trim();
  if (!t) return <p className="text-slate-500">No content.</p>;
  return <div className="whitespace-pre-wrap">{t}</div>;
}

type AssessmentDetailPanelProps = {
  sessionId: string | null;
  sessionTitle?: string | null;
  sessionNumber?: number | null;
};

export function AssessmentDetailPanel({ sessionId, sessionTitle, sessionNumber }: AssessmentDetailPanelProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const { data: assessments = [], isLoading, isError, error, refetch } = useAssessmentsBySession(sessionId);
  const primary = pickPrimaryAssessment(assessments);
  const [showAnswers, setShowAnswers] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const jobQuery = useGenerationJob(jobId, Boolean(jobId));

  useEffect(() => {
    setShowAnswers(false);
  }, [sessionId]);

  const generate = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("No session");
      return postGenerateAssessment({ session_id: sessionId, assessment_type: "quiz" });
    },
    onSuccess: (res) => {
      const id = extractJobId(res);
      if (id) setJobId(id);
      else {
        toast.message("Generation started");
        void qc.invalidateQueries({ queryKey: assessmentsSessionQueryKey(sessionId) });
      }
    },
    onError: (e) => toast.error(getApiErrorMessage(e))
  });

  useEffect(() => {
    const st = jobQuery.data?.status?.toLowerCase() ?? "";
    if (!jobId || !st) return;
    if (st === "completed" || st === "success") {
      toast.success("Assessment ready");
      setJobId(null);
      void qc.invalidateQueries({ queryKey: assessmentsSessionQueryKey(sessionId) });
      void qc.invalidateQueries({ queryKey: ["calendar", "session", sessionId] });
      void qc.invalidateQueries({ queryKey: ["calendar", "my-sessions"] });
    }
    if (st === "failed" || st === "error") {
      toast.error(jobQuery.data?.message ?? "Generation failed");
      setJobId(null);
    }
  }, [jobId, jobQuery.data, qc, sessionId]);

  const handleDownload = () => {
    if (typeof window === "undefined" || !printRef.current) return;
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) {
      toast.error("Pop-up blocked — allow pop-ups to print or download.");
      return;
    }
    w.document.write(
      `<!DOCTYPE html><html><head><title>Assessment</title></head><body>${printRef.current.innerHTML}</body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  if (!sessionId) {
    return (
      <div className="flex min-h-[min(70vh,520px)] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="max-w-sm text-sm leading-relaxed text-slate-500">
          Select an assessment from the list to preview questions, answers, and marking guidance.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading assessment…
      </div>
    );
  }

  if (isError) {
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
  const num = sessionNumber && sessionNumber > 0 ? sessionNumber : 0;
  const code = num > 0 ? `Q-se${num}` : "Assessment";

  if (!primary) {
    return (
      <div className="flex h-[min(70vh,560px)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:h-full">
        <div className="border-b border-slate-100 p-5">
          {sessionTitle ? <p className="truncate text-sm font-semibold text-slate-900">{sessionTitle}</p> : null}
          <p className="mt-2 text-sm text-slate-600">
            No quiz or assessment has been generated for this session yet. Use <strong>Generate</strong> to create one.
          </p>
          <Button
            className="mt-4"
            type="button"
            disabled={generating}
            onClick={() => generate.mutate()}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate assessment"
            )}
          </Button>
        </div>
        {jobQuery.data && jobId && (
          <div className="border-b border-slate-100 bg-blue-50/50 px-5 py-2 text-xs text-blue-900">
            Job status: <strong>{jobQuery.data.status}</strong>
            {jobQuery.data.progress != null ? ` · ${Math.round(jobQuery.data.progress * 100)}%` : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[min(70vh,560px)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:h-full">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Badge className="border-blue-200 bg-blue-50 font-bold uppercase text-blue-800 hover:bg-blue-50">
            {formatAssessmentType(primary.assessment_type)}
          </Badge>
          <Badge variant="secondary" className="border-sky-100 bg-sky-50 font-medium capitalize text-sky-900">
            {formatDifficulty(primary.difficulty_level)}
          </Badge>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            <Clock className="h-3.5 w-3.5" />
            {primary.estimated_duration_minutes != null ? `${primary.estimated_duration_minutes} min` : "20 min"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            <BarChart3 className="h-3.5 w-3.5" />
            {code}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="border-slate-200 bg-white font-medium shadow-sm"
            onClick={() => setShowAnswers((v) => !v)}
          >
            {showAnswers ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide answers
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show answers
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            className="border-slate-200 bg-white font-medium shadow-sm"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
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
                Regenerating…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </div>

      {jobQuery.data && jobId && (
        <div className="border-b border-slate-100 bg-blue-50/50 px-5 py-2 text-xs text-blue-900">
          Job status: <strong>{jobQuery.data.status}</strong>
          {jobQuery.data.progress != null ? ` · ${Math.round(jobQuery.data.progress * 100)}%` : null}
        </div>
      )}

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
        <div ref={printRef} className="space-y-4 p-5 sm:p-6">
          {sessionTitle ? (
            <p className="text-sm font-semibold text-slate-900 sm:hidden">{sessionTitle}</p>
          ) : null}
          <DetailBlock title="Questions" accent="blue">
            {renderTextBlock(primary.question_set)}
          </DetailBlock>
          {showAnswers ? (
            <>
              <DetailBlock title="Answer key" accent="emerald">
                {renderTextBlock(primary.answer_key)}
              </DetailBlock>
              <DetailBlock title="Marking guide" accent="sky">
                {renderTextBlock(primary.marking_guide)}
              </DetailBlock>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
