import Link from "next/link";

const nav = [
  { href: "/teacher", label: "Teacher" },
  { href: "/teacher/calendar", label: "Calendar" },
  { href: "/teacher/lesson-plans", label: "Lesson plans" },
  { href: "/teacher/teaching-notes", label: "Teaching notes" },
  { href: "/teacher/progress", label: "Progress" },
  { href: "/department-head", label: "Dept head" },
  { href: "/school-leader", label: "School leader" }
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Dashboard</p>
        <nav className="flex flex-col gap-1 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              className="rounded px-2 py-1 text-slate-700 hover:bg-slate-100"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
