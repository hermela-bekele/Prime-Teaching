"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { asAppRoute } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useSubjects } from "@/hooks/use-subjects";
import { useGenerationJob } from "@/hooks/use-generation-job";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { extractJobId, getApiErrorMessage, postGenerateCalendar } from "@/lib/api-client";

const schema = z.object({
  subject_id: z.string().min(1, "Select a subject"),
  sequencing_mode: z.enum(["textbook_order", "optimized"]),
  total_sessions: z.coerce.number().min(1).max(400),
  academic_year_start: z.string().min(4, "Start year required"),
  academic_year_end: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

const steps = ["Subject", "Sequencing", "Schedule & submit"] as const;

export function CalendarGenerationWizard() {
  const router = useRouter();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const [step, setStep] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject_id: "",
      sequencing_mode: "textbook_order",
      total_sessions: 36,
      academic_year_start: "2026-09-01",
      academic_year_end: "2027-06-30"
    }
  });

  const jobQuery = useGenerationJob(jobId, Boolean(jobId));

  useEffect(() => {
    const st = jobQuery.data?.status?.toLowerCase() ?? "";
    if (!jobId || !st) return;
    if (st === "completed" || st === "success") {
      toast.success("Calendar generated");
      setJobId(null);
      router.push(asAppRoute("/teacher/calendar"));
    }
    if (st === "failed" || st === "error") {
      toast.error(jobQuery.data?.message ?? "Calendar job failed");
      setJobId(null);
    }
  }, [jobId, jobQuery.data, router]);

  const next = async () => {
    if (step === 0) {
      const ok = await form.trigger("subject_id");
      if (!ok) return;
    }
    if (step === 1) {
      const ok = await form.trigger("sequencing_mode");
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await postGenerateCalendar({
        subject_id: values.subject_id,
        sequencing_mode: values.sequencing_mode,
        total_sessions: values.total_sessions,
        academic_year_start: values.academic_year_start,
        academic_year_end: values.academic_year_end || undefined
      });
      const id = extractJobId(res);
      if (id) setJobId(id);
      else {
        toast.message("Job queued", { description: "No job id returned; open your calendar to verify." });
        router.push(asAppRoute("/teacher/calendar"));
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  });

  return (
    <Card className="mx-auto max-w-xl border-slate-200">
      <CardHeader>
        <CardTitle>Annual calendar wizard</CardTitle>
        <CardDescription>
          Step {step + 1} of {steps.length}: {steps[step]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {jobId && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="font-medium">Generating calendar…</p>
            <p className="mt-1 text-xs">
              Status: {jobQuery.data?.status ?? "pending"}
              {jobQuery.data?.progress != null ? ` · ${Math.round(jobQuery.data.progress * 100)}%` : ""}
            </p>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-2">
            <Label>Subject</Label>
            {subjectsLoading ? (
              <p className="text-sm text-slate-500">Loading subjects…</p>
            ) : (
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                {...form.register("subject_id")}
              >
                <option value="">Choose a subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.code ? ` (${s.code})` : ""}
                  </option>
                ))}
              </select>
            )}
            {form.formState.errors.subject_id && (
              <p className="text-xs text-rose-600">{form.formState.errors.subject_id.message}</p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <Label>Sequencing mode</Label>
            <div className="grid gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50">
                <input type="radio" value="textbook_order" {...form.register("sequencing_mode")} />
                <span>
                  <span className="font-medium">Textbook order</span>
                  <span className="block text-xs text-slate-500">Follow curriculum unit ordering.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50">
                <input type="radio" value="optimized" {...form.register("sequencing_mode")} />
                <span>
                  <span className="font-medium">Optimized</span>
                  <span className="block text-xs text-slate-500">AI-assisted pacing and prerequisites.</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="total_sessions">Total sessions</Label>
              <Input id="total_sessions" type="number" min={1} {...form.register("total_sessions")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year_start">Academic year start</Label>
              <Input id="academic_year_start" type="date" {...form.register("academic_year_start")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year_end">Academic year end (optional)</Label>
              <Input id="academic_year_end" type="date" {...form.register("academic_year_end")} />
            </div>
          </form>
        )}

        <Separator />

        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" onClick={prev} disabled={step === 0 || Boolean(jobId)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={() => void next()} disabled={Boolean(jobId)}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" disabled={Boolean(jobId) || form.formState.isSubmitting} onClick={() => void onSubmit()}>
              {form.formState.isSubmitting || jobId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Generate calendar"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
