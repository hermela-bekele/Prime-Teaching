"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  School,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { asAppRoute } from "@/lib/navigation";
import {
  canAccessPathForRole,
  dashboardPathForRole,
  navRoleKey,
} from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

type NavItem = { href: string; label: string; icon: React.ReactNode };

/** Only the most specific nav link matches the current path (avoids /department-head highlighting on every subpage). */
function activeNavHref(pathname: string, items: NavItem[]): string | null {
  const matches = items.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (b.href.length > a.href.length ? b : a)).href;
}

function navForRole(roleKey: ReturnType<typeof navRoleKey>): NavItem[] {
  switch (roleKey) {
    case "teacher":
      return [
        {
          href: "/teacher",
          label: "Dashboard",
          icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/teacher/calendar",
          label: "My Calendar",
          icon: <CalendarDays className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/teacher/lesson-plans",
          label: "Lesson Plans",
          icon: <BookOpen className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/teacher/teaching-notes",
          label: "Teaching Notes",
          icon: <FileText className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/teacher/assessments",
          label: "Assessments",
          icon: <ClipboardList className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/teacher/progress",
          label: "Progress",
          icon: <BarChart3 className="h-4 w-4 shrink-0" />,
        },
      ];
    case "department-head":
      return [
        {
          href: "/department-head",
          label: "Overview",
          icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/department-head/teacher-progress",
          label: "Teacher Progress",
          icon: <Users className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/department-head/reviews",
          label: "Reviews",
          icon: <FileText className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/department-head/reports",
          label: "Reports",
          icon: <BarChart3 className="h-4 w-4 shrink-0" />,
        },
      ];
    case "school-leader":
      return [
        {
          href: "/school-leader",
          label: "Dashboard",
          icon: <School className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/school-leader/reports",
          label: "Department Reports",
          icon: <BarChart3 className="h-4 w-4 shrink-0" />,
        },
        {
          href: "/school-leader/analytics",
          label: "Analytics",
          icon: <BarChart3 className="h-4 w-4 shrink-0" />,
        },
      ];
    case "admin":
      return [
        {
          href: "/admin/calendars",
          label: "Calendars",
          icon: <CalendarDays className="h-4 w-4 shrink-0" />,
        },
      ];
    default:
      return [];
  }
}

function roleMenuLabel(roleKey: ReturnType<typeof navRoleKey>): string {
  switch (roleKey) {
    case "department-head":
      return "Department Head";
    case "school-leader":
      return "School Leader";
    case "admin":
      return "Admin";
    default:
      return "Teacher";
  }
}

function roleKeyToUserRole(roleKey: ReturnType<typeof navRoleKey>): string {
  switch (roleKey) {
    case "department-head":
      return "department_head";
    case "school-leader":
      return "school_leader";
    case "admin":
      return "admin";
    default:
      return "teacher";
  }
}

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s._hydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace(asAppRoute("/login"));
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!hydrated || !token || !user) return;
    if (!canAccessPathForRole(user.role, pathname)) {
      router.replace(asAppRoute(dashboardPathForRole(user.role)));
    }
  }, [hydrated, token, user, pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const roleKey = useMemo(() => navRoleKey(user), [user]);
  const brandContext = useMemo(() => {
    if (roleKey === "admin") return { school: "PRIME HQ", department: "" };
    if (roleKey === "school-leader")
      return { school: "Addis Prep Academy", department: "" };
    return { school: "Addis Prep Academy", department: "Mathematics Dept." };
  }, [roleKey]);
  const navItems = useMemo(() => navForRole(roleKey), [roleKey]);
  const currentNavHref = useMemo(
    () => activeNavHref(pathname, navItems),
    [pathname, navItems],
  );
  const roleLabel = roleMenuLabel(roleKey);

  const initials = useMemo(() => {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking session…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Redirecting to sign in…
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0B1120] text-slate-300">
      <div
        className={cn(
          "flex items-start gap-3 border-b border-white/10 p-4",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
          <Sparkles className="h-5 w-5 text-white" aria-hidden />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold tracking-tight text-white">
              PRIME Teaching
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              AI for educators
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className={cn(
            "-mr-1 hidden h-8 w-8 shrink-0 p-0 text-slate-400 hover:bg-white/10 hover:text-white lg:inline-flex",
            collapsed && "mx-auto",
          )}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className={cn("px-3 pt-4", collapsed && "px-2")}>
        {!collapsed && (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>
        )}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const active = item.href === currentNavHref;
            return (
              <Link
                key={item.href}
                href={asAppRoute(item.href)}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    active
                      ? "text-white"
                      : "text-slate-500 group-hover:text-white",
                  )}
                >
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        {!collapsed ? (
          <div className="space-y-0.5 px-1">
            <p className="text-xs font-medium text-slate-400">
              {brandContext.school}
            </p>
            {brandContext.department ? (
              <p className="text-xs text-slate-500">
                {brandContext.department}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex justify-center">
            <Building2 className="h-4 w-4 text-slate-600" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden lg:block",
          collapsed ? "w-[72px]" : "w-60",
        )}
      >
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[88vw] shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          collapsed ? "lg:pl-[72px]" : "lg:pl-60",
        )}
      >
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 shrink-0 border-slate-200 bg-white p-0 lg:hidden"
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Open menu"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden h-9 w-9 shrink-0 border-slate-200 bg-white p-0 lg:inline-flex"
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4 text-slate-600" />
            </Button>
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2
                className="hidden h-4 w-4 shrink-0 text-slate-400 sm:inline"
                aria-hidden
              />
              <span className="truncate">{brandContext.school}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden h-9 gap-1.5 border-slate-200 bg-white px-3 font-medium text-slate-800 sm:inline-flex"
                >
                  {roleLabel}
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-normal text-slate-500">
                  Switch role (demo)
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={roleKey === "teacher"}
                  onClick={() => {
                    if (user)
                      setUser({ ...user, role: roleKeyToUserRole("teacher") });
                    router.push(asAppRoute("/teacher"));
                  }}
                >
                  Teacher
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={roleKey === "department-head"}
                  onClick={() => {
                    if (user)
                      setUser({
                        ...user,
                        role: roleKeyToUserRole("department-head"),
                      });
                    router.push(asAppRoute("/department-head"));
                  }}
                >
                  Department Head
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={roleKey === "school-leader"}
                  onClick={() => {
                    if (user)
                      setUser({
                        ...user,
                        role: roleKeyToUserRole("school-leader"),
                      });
                    router.push(asAppRoute("/school-leader"));
                  }}
                >
                  School Leader
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={roleKey === "admin"}
                  onClick={() => {
                    if (user)
                      setUser({ ...user, role: roleKeyToUserRole("admin") });
                    router.push(asAppRoute("/admin/calendars"));
                  }}
                >
                  Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="relative h-9 w-9 p-0 text-slate-600 hover:text-slate-900"
              type="button"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
                >
                  <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
                    <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[140px] flex-col items-start text-left sm:flex">
                    <span className="w-full truncate text-sm font-semibold leading-tight text-slate-900">
                      {user?.name}
                    </span>
                    <span className="text-xs font-medium capitalize text-slate-500">
                      {roleLabel}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-slate-500">
                      {user?.email}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {user?.role?.replaceAll("_", " ")}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    const home = user
                      ? dashboardPathForRole(user.role)
                      : "/teacher";
                    router.push(asAppRoute(home));
                  }}
                >
                  My dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-600"
                  onClick={() => {
                    logout();
                    router.replace(asAppRoute("/login"));
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="animate-[fadeIn_.25s_ease] flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
