"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Sparkles } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import type { LessonPlanDto } from "@/lib/api-types";
import { useSessionDetail } from "@/hooks/use-lesson-plan";
import { useGenerationJob } from "@/hooks/use-generation-job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { extractJobId, getApiErrorMessage, postGenerateLessonPlan } from "@/lib/api-client";
import { getSessionNumber } from "@/lib/session-utils";
import { cn } from "@/lib/utils";

function asLines(value: string[] | string | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function SectionBlock({ title, body }: { title: string; body: string[] }) {
  if (!body.length) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
        {body.map((line, i) => (
          <li key={`${title}-${i}`}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function ParagraphBlock({ title, text }: { title: string; text?: string }) {
  if (!text?.trim()) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <p className="whitespace-pre-wrap text-sm text-slate-700">{text}</p>
    </div>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4 shadow-sm">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">{title}</h3>
      <div className="mt-3 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function renderPlanCard(plan: LessonPlanDto) {
  const objectives = asLines(plan.objectives);
  const prior = asLines(plan.prior_knowledge);
  const delivery = asLines(plan.delivery_steps);
  const materials = asLines(
    Array.isArray(plan.materials) ? plan.materials : plan.materials ? String(plan.materials).split(",") : []
  );

  return (
    <div className="space-y-6">
      <SectionBlock title="Learning objectives" body={objectives} />
      <SectionBlock title="Prior knowledge" body={prior} />
      <ParagraphBlock title="Opening" text={plan.opening} />
      <SectionBlock title="Delivery steps" body={delivery} />
      <ParagraphBlock title="Guided practice" text={plan.guided_practice} />
      <ParagraphBlock title="Independent practice" text={plan.independent_practice} />
      <ParagraphBlock title="Classwork" text={plan.classwork} />
      <ParagraphBlock title="Homework" text={plan.homework} />
      <SectionBlock title="Materials" body={materials} />
    </div>
  );
}

function renderPlanPanel(plan: LessonPlanDto) {
  const objectives = asLines(plan.objectives);
  const prior = asLines(plan.prior_knowledge);
  const delivery = asLines(plan.delivery_steps);
  const materials = asLines(
    Array.isArray(plan.materials) ? plan.materials : plan.materials ? String(plan.materials).split(",") : []
  );

  return (
    <div className="space-y-4">
      {objectives.length > 0 ? (
        <PanelSection title="Lesson objectives">
          <ul className="list-inside list-disc space-y-2 leading-relaxed">
            {objectives.map((line, i) => (
              <li key={`obj-${i}`}>{line}</li>
            ))}
          </ul>
        </PanelSection>
      ) : null}
      {prior.length > 0 ? (
        <PanelSection title="Required prior knowledge">
          <ul className="list-inside list-disc space-y-2 leading-relaxed">
            {prior.map((line, i) => (
              <li key={`prior-${i}`}>{line}</li>
            ))}
          </ul>
        </PanelSection>
      ) : null}
      {plan.opening?.trim() ? (
        <PanelSection title="Lesson opening">
          <p className="whitespace-pre-wrap leading-relaxed">{plan.opening}</p>
        </PanelSection>
      ) : null}
      {delivery.length > 0 ? (
        <PanelSection title="Concept delivery">
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {delivery.map((line, i) => (
              <li key={`del-${i}`}>{line}</li>
            ))}
          </ol>
        </PanelSection>
      ) : null}
      {plan.guided_practice?.trim() ? (
        <PanelSection title="Guided practice">
          <p className="whitespace-pre-wrap leading-relaxed">{plan.guided_practice}</p>
        </PanelSection>
      ) : null}
      {plan.independent_practice?.trim() ? (
        <PanelSection title="Independent practice">
          <p className="whitespace-pre-wrap leading-relaxed">{plan.independent_practice}</p>
        </PanelSection>
      ) : null}
      {plan.classwork?.trim() ? (
        <PanelSection title="Classwork">
          <p className="whitespace-pre-wrap leading-relaxed">{plan.classwork}</p>
        </PanelSection>
      ) : null}
      {plan.homework?.trim() ? (
        <PanelSection title="Homework">
          <p className="whitespace-pre-wrap leading-relaxed">{plan.homework}</p>
        </PanelSection>
      ) : null}
      {materials.length > 0 ? (
        <PanelSection title="Materials">
          <ul className="list-inside list-disc space-y-2 leading-relaxed">
            {materials.map((line, i) => (
              <li key={`mat-${i}`}>{line}</li>
            ))}
          </ul>
        </PanelSection>
      ) : null}
    </div>
  );
}

type LessonPlanViewerProps = {
  sessionId: string | null;
  /** `panel`: lesson plans page — bordered sections, Download / Regenerate header. */
  variant?: "card" | "panel";
};

export function LessonPlanViewer({ sessionId, variant = "card" }: LessonPlanViewerProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const panelId = useId();
  const { data: session, isLoading, isError, error, refetch } = useSessionDetail(sessionId);
  const plan = session?.lesson_plan ?? null;
  const [jobId, setJobId] = useState<string | null>(null);
  const jobQuery = useGenerationJob(jobId, Boolean(jobId));
  const isPanel = variant === "panel";

  const generate = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("No session");
      return postGenerateLessonPlan({ session_id: sessionId });
    },
    onSuccess: (res) => {
      const id = extractJobId(res);
      if (id) setJobId(id);
      else toast.message("Generation started", { description: "No job id returned; refreshing session." });
    },
    onError: (e) => toast.error(getApiErrorMessage(e))
  });

  useEffect(() => {
    const st = jobQuery.data?.status?.toLowerCase() ?? "";
    if (!jobId || !st) return;
    if (st === "completed" || st === "success") {
      toast.success("Lesson plan ready");
      setJobId(null);
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
      toast.error("Pop-up blocked — allow pop-ups to download or print.");
      return;
    }
    w.document.write(`<!DOCTYPE html><html><head><title>Lesson plan</title></head><body>${printRef.current.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const sessionNum = session ? getSessionNumber(session) : null;
  const metaLabel =
    sessionNum != null && sessionNum > 0 ? `~45 min · LP-${sessionNum}` : "~45 min · Lesson plan";

  if (!sessionId) {
    if (isPanel) {
      return (
        <div className="flex min-h-[min(70vh,560px)] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">
            Select a session from the list to browse or generate its AI lesson plan.
          </p>
        </div>
      );
    }
    return (
      <Card className="h-full border-dashed border-slate-300 bg-white/60">
        <CardHeader>
          <CardTitle className="text-base">Lesson plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Select a session from the list to view or generate its lesson plan.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 border border-slate-200 bg-white p-8 text-sm text-slate-600",
          isPanel && "min-h-[320px] rounded-xl shadow-sm"
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading lesson plan…
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("border border-rose-200 bg-white p-6", isPanel && "rounded-xl shadow-sm")}>
        <p className="text-sm text-rose-700">{getApiErrorMessage(error)}</p>
        <Button className="mt-3" size="sm" variant="outline" type="button" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const generating = generate.isPending || Boolean(jobId);

  if (isPanel) {
    return (
      <div
        className="flex h-[min(70vh,560px)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:h-full"
        aria-labelledby={panelId}
      >
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {plan ? (
              <Badge className="border-sky-200 bg-sky-50 font-semibold text-sky-800 hover:bg-sky-50">Generated</Badge>
            ) : (
              <Badge variant="secondary" className="font-medium">
                Not generated
              </Badge>
            )}
            <span id={panelId} className="text-sm text-slate-500">
              {metaLabel}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              type="button"
              className="border-slate-200 bg-white font-medium shadow-sm"
              disabled={!plan}
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
            {plan ? (
              renderPlanPanel(plan)
            ) : (
              <p className="text-sm text-slate-600">
                No lesson plan yet. Use <strong>Regenerate</strong> to create objectives, delivery, practice, and homework.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex h-full min-h-[320px] flex-col border-slate-200 bg-white" aria-labelledby={panelId}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle id={panelId} className="text-base">
          Lesson plan
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {!plan && (
            <Button size="sm" type="button" disabled={generating} onClick={() => generate.mutate()}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          )}
          {plan && (
            <Button size="sm" variant="outline" type="button" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Print / Save as PDF
            </Button>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {jobQuery.data && jobId && (
          <div className="border-b border-slate-100 bg-blue-50/50 px-4 py-2 text-xs text-blue-900">
            Job status: <strong>{jobQuery.data.status}</strong>
            {jobQuery.data.progress != null ? ` · ${Math.round(jobQuery.data.progress * 100)}%` : null}
          </div>
        )}
        <div className="scrollbar-hidden h-[min(70vh,560px)] flex-1 overflow-y-auto p-4">
          <div ref={printRef} className="space-y-6 pr-3">
            {plan ? (
              renderPlanCard(plan)
            ) : (
              <p className="text-sm text-slate-600">No lesson plan yet. Generate one to populate objectives, delivery, practice, and homework.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
