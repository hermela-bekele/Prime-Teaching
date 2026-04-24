export default function DepartmentHeadReportsPage() {
  return (
    <section className="rounded-xl border border-blue-100 bg-white p-5">
      <h2 className="text-lg font-semibold">Reports</h2>
      <p className="mt-1 text-sm text-slate-600">Downloadable department reports placeholder.</p>
      <div className="mt-4 flex gap-2">
        <button className="rounded bg-blue-700 px-3 py-2 text-sm text-white">Download PDF</button>
        <button className="rounded border border-slate-300 px-3 py-2 text-sm">Download CSV</button>
      </div>
    </section>
  );
}
