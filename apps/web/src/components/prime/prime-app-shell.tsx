"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { asAppRoute } from "@/lib/navigation";
import { useEffect, useMemo, useState } from "react";
import { roleHome, roleLabel, type UserRole } from "@/lib/prime-data";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: string };

const navByRole: Record<UserRole, NavItem[]> = {
  teacher: [
    { href: "/teacher", label: "Dashboard", icon: "D" },
    { href: "/teacher/calendar", label: "My Calendar", icon: "C" },
    { href: "/teacher/lesson-plans", label: "Lesson Plans", icon: "L" },
    { href: "/teacher/teaching-notes", label: "Teaching Notes", icon: "N" },
    { href: "/teacher/assessments", label: "Assessments", icon: "A" },
    { href: "/teacher/progress", label: "Progress", icon: "P" }
  ],
  "department-head": [
    { href: "/department-head", label: "Overview", icon: "O" },
    { href: "/department-head/teacher-progress", label: "Teacher Progress", icon: "T" },
    { href: "/department-head/reviews", label: "Reviews", icon: "R" },
    { href: "/department-head/reports", label: "Reports", icon: "P" }
  ],
  "school-leader": [
    { href: "/school-leader", label: "Dashboard", icon: "D" },
    { href: "/school-leader/reports", label: "Department Reports", icon: "R" },
    { href: "/school-leader/analytics", label: "Analytics", icon: "A" }
  ],
  admin: [
    { href: "/admin/calendars", label: "Calendar Jobs", icon: "J" },
    { href: "/calendar/new", label: "New Calendar", icon: "N" }
  ]
};

function pageTitle(pathname: string) {
  if (pathname === "/teacher") return "Teacher Dashboard";
  if (pathname === "/department-head") return "Department Overview";
  if (pathname === "/school-leader") return "School Leader Dashboard";
  if (pathname === "/admin/calendars") return "Calendar Generation";
  return pathname.split("/").filter(Boolean).slice(-1)[0]?.replaceAll("-", " ") ?? "Dashboard";
}

export function PrimeAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("teacher");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("prime-role") as UserRole | null;
    const isAuthed = localStorage.getItem("prime-auth") === "true";
    if (!isAuthed) {
      router.replace(asAppRoute("/login"));
      return;
    }
    if (storedRole) {
      setRole(storedRole);
    }
  }, [router]);

  const navItems = useMemo(() => navByRole[role], [role]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white text-slate-900">
      <aside className={cn("border-r border-blue-100 bg-white/80 px-3 py-4 backdrop-blur", collapsed ? "w-16" : "w-64")}>
        <div className="mb-6 flex items-center justify-between">
          {!collapsed && (
            <div className="font-semibold tracking-tight text-blue-700">
              PRIME ✦
            </div>
          )}
          <button
            className="rounded-md border border-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
            onClick={() => setCollapsed((prev) => !prev)}
            type="button"
          >
            {collapsed ? ">" : "<"}
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={asAppRoute(item.href)}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50"
                )}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white/60 text-xs font-semibold text-blue-700">
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-blue-100 bg-white/70 px-6 py-4 backdrop-blur">
          <h1 className="text-lg font-semibold capitalize">{pageTitle(pathname)}</h1>
          <div className="flex items-center gap-3">
            <select
              value={role}
              onChange={(event) => {
                const newRole = event.target.value as UserRole;
                localStorage.setItem("prime-role", newRole);
                setRole(newRole);
                router.push(asAppRoute(roleHome[newRole]));
              }}
              className="rounded-lg border border-blue-100 px-3 py-2 text-sm"
            >
              {Object.entries(roleLabel).map(([key, value]) => (
                <option key={key} value={key}>
                  {value} (demo)
                </option>
              ))}
            </select>
            <button className="rounded-full bg-blue-700 px-3 py-2 text-xs font-semibold text-white" type="button">
              NG
            </button>
          </div>
        </header>
        <main className="animate-[fadeIn_.25s_ease] p-6">{children}</main>
      </div>
    </div>
  );
}
