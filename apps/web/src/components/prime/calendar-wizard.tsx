"use client";

import { useEffect, useState } from "react";

type WizardStep = 1 | 2 | 3 | 4;

export function CalendarWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!generating) return;
    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 20;
        if (next >= 100) {
          clearInterval(id);
          setGenerating(false);
          setReady(true);
          return 100;
        }
        return next;
      });
    }, 700);
    return () => clearInterval(id);
  }, [generating]);

  return (
    <section className="rounded-xl border border-blue-100 bg-white p-5">
      <h2 className="text-lg font-semibold">Calendar Generation Wizard</h2>
      <p className="mt-1 text-sm text-slate-600">Step {step} of 4</p>

      <div className="mt-4 space-y-3">
        {step === 1 && (
          <div className="grid gap-3 md:grid-cols-3">
            <select className="rounded border px-3 py-2 text-sm"><option>Subject</option><option>Mathematics</option></select>
            <select className="rounded border px-3 py-2 text-sm"><option>Grade</option><option>Grade 10</option></select>
            <select className="rounded border px-3 py-2 text-sm"><option>Stream Type</option><option>Core</option><option>Natural Science</option><option>Social Science</option></select>
          </div>
        )}
        {step === 2 && (
          <div className="flex gap-3 text-sm">
            <label className="rounded border p-3"><input name="sequence" type="radio" defaultChecked /> Textbook Order</label>
            <label className="rounded border p-3"><input name="sequence" type="radio" /> Optimized Sequence</label>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded border px-3 py-2 text-sm" placeholder="Total available sessions" defaultValue="34" />
            <input className="rounded border px-3 py-2 text-sm" placeholder="Academic year" defaultValue="2026" />
          </div>
        )}
        {step === 4 && (
          <div className="rounded border border-slate-200 p-3 text-sm">
            Review: Grade 10 Mathematics · Core stream · Textbook order · 34 sessions · AY 2026.
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="rounded border px-3 py-2 text-sm" type="button" disabled={step === 1 || generating} onClick={() => setStep((s) => (Math.max(1, s - 1) as WizardStep))}>
          Back
        </button>
        {step < 4 ? (
          <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white" type="button" onClick={() => setStep((s) => (Math.min(4, s + 1) as WizardStep))}>
            Next
          </button>
        ) : (
          <button className="rounded bg-blue-700 px-3 py-2 text-sm text-white" type="button" disabled={generating} onClick={() => { setReady(false); setProgress(0); setGenerating(true); }}>
            {generating ? "Generating..." : "Generate"}
          </button>
        )}
      </div>

      {(generating || ready) && (
        <div className="mt-4">
          <div className="h-2 rounded bg-slate-200">
            <div className="h-2 rounded bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {ready ? "Calendar ready." : `Processing job... ${progress}%`}
          </p>
        </div>
      )}
    </section>
  );
}
