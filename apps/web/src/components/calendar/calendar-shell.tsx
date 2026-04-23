type CalendarShellProps = {
  title?: string;
  children?: React.ReactNode;
};

export function CalendarShell({ title = "Calendar", children }: CalendarShellProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="mt-4 min-h-[200px] text-sm text-slate-500">{children ?? "Calendar UI placeholder."}</div>
    </section>
  );
}
