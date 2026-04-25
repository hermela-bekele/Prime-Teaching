"use client";

import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type WizardStep = 1 | 2 | 3 | 4;
type SequencingMode = "textbook" | "optimized";
type Stream = "Natural Science" | "Social Science" | "Core";

const STEP_LABELS: Array<{ id: WizardStep; label: string }> = [
  { id: 1, label: "Subject" },
  { id: 2, label: "Sequencing" },
  { id: 3, label: "Schedule" },
  { id: 4, label: "Review" }
];

export function CalendarWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [subject, setSubject] = useState("Mathematics - Grade 11");
  const [stream, setStream] = useState<Stream>("Natural Science");
  const [sequencing, setSequencing] = useState<SequencingMode>("optimized");
  const [sessions, setSessions] = useState("80");
  const [academicYear, setAcademicYear] = useState("2025/26");

  const canContinue = useMemo(() => {
    if (step === 1) return subject.trim().length > 0;
    if (step === 2) return sequencing === "textbook" || sequencing === "optimized";
    if (step === 3) return sessions.trim().length > 0 && academicYear.trim().length > 0;
    return true;
  }, [step, subject, sequencing, sessions, academicYear]);

  const next = () => setStep((s) => (Math.min(4, s + 1) as WizardStep));
  const prev = () => setStep((s) => (Math.max(1, s - 1) as WizardStep));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">Generate a calendar</h1>
        <p className="mt-1 text-sm text-slate-600">PRIME builds a session-by-session teaching plan from your curriculum and constraints.</p>
      </div>

      <div className="flex items-center gap-0.5">
        {STEP_LABELS.map((item, index) => {
          const complete = step > item.id;
          const current = step === item.id;
          return (
            <div key={item.label} className="flex min-w-0 flex-1 items-center">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  complete && "border-blue-600 bg-blue-600 text-white",
                  current && "border-blue-600 bg-white text-blue-700",
                  !complete && !current && "border-slate-300 bg-white text-slate-500"
                )}
              >
                {complete ? <Check className="h-3.5 w-3.5" /> : item.id}
              </div>
              <span className={cn("ml-2 text-sm", current ? "font-semibold text-slate-900" : "text-slate-600")}>{item.label}</span>
              {index < STEP_LABELS.length - 1 ? <div className="mx-3 h-px flex-1 bg-slate-300" /> : null}
            </div>
          );
        })}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        {step === 1 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Subject</p>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="">Choose a subject...</option>
                <option value="Mathematics - Grade 11">Mathematics - Grade 11</option>
                <option value="Physics - Grade 11">Physics - Grade 11</option>
                <option value="Biology - Grade 11">Biology - Grade 11</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Stream</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(["Natural Science", "Social Science", "Core"] as Stream[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStream(option)}
                    className={cn(
                      "h-11 rounded-lg border text-sm",
                      stream === option ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Sequencing mode.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSequencing("textbook")}
                className={cn(
                  "rounded-lg border p-3 text-left",
                  sequencing === "textbook" ? "border-blue-300 bg-blue-50/40" : "border-slate-200 bg-white"
                )}
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-slate-900">Textbook Order</p>
                  <span className={cn("h-4 w-4 rounded-full border", sequencing === "textbook" ? "border-blue-600 bg-blue-600" : "border-slate-300")} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Follow units exactly as they appear in the curriculum.</p>
              </button>
              <button
                type="button"
                onClick={() => setSequencing("optimized")}
                className={cn(
                  "rounded-lg border p-3 text-left",
                  sequencing === "optimized" ? "border-blue-300 bg-blue-50/40" : "border-slate-200 bg-white"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">Optimized Sequence</p>
                    <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600">AI</span>
                  </div>
                  <span className={cn("h-4 w-4 rounded-full border", sequencing === "optimized" ? "border-blue-600 bg-blue-600" : "border-slate-300")} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Re-order subtopics for better learning flow and exam prep.</p>
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">Total available sessions</p>
              <Input value={sessions} onChange={(e) => setSessions(e.target.value)} />
              <p className="mt-2 text-xs text-slate-500">Including teaching, revision, and assessment sessions.</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">Academic year</p>
              <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">Review & confirm</h2>
            <div className="rounded-lg border border-slate-200">
              {[
                ["Subject", subject],
                ["Stream", stream],
                ["Sequencing", sequencing === "optimized" ? "Optimized Sequence" : "Textbook Order"],
                ["Sessions", sessions],
                ["Academic year", academicYear]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-slate-200 px-4 py-3 last:border-b-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" className="text-slate-600" onClick={prev} disabled={step === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {step < 4 ? (
              <Button type="button" className="min-w-32 gap-2" onClick={next} disabled={!canContinue}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" className="min-w-40 gap-2" onClick={() => setStep(1)}>
                <Sparkles className="h-4 w-4" />
                Generate calendar
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
