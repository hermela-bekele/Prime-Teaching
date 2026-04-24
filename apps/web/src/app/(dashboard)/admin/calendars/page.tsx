import { CalendarWizard } from "@/components/prime/calendar-wizard";

export default function AdminCalendarsPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-blue-100 bg-white p-5">
        <h2 className="text-lg font-semibold">Admin Calendar Jobs</h2>
        <p className="mt-1 text-sm text-slate-600">Monitor generation jobs and launch new calendars.</p>
      </section>
      <CalendarWizard />
    </div>
  );
}
