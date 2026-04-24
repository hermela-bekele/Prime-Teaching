import { CalendarGenerationWizard } from "@/components/calendar/CalendarGenerationWizard";

export default function NewCalendarPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Generate annual calendar</h2>
        <p className="mt-1 text-sm text-slate-600">Create sessions from curriculum structure. You can monitor AI jobs from your dashboard.</p>
      </div>
      <CalendarGenerationWizard />
    </div>
  );
}
