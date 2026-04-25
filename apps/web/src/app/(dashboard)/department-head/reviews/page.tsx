import { HardHat } from "lucide-react";

export default function DepartmentHeadReviewsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Reviews</h1>
        <p className="mt-1 text-sm text-slate-500">Approve and comment on AI-generated lesson plans.</p>
      </div>

      <section className="flex min-h-[190px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <HardHat className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-semibold text-slate-900">Coming next</h2>
          <p className="mt-2 text-sm text-slate-500">
            This section is part of the v1 spec. The data model and dashboard surfaces are wired - full views land in the next
            iteration.
          </p>
        </div>
      </section>
    </div>
  );
}
