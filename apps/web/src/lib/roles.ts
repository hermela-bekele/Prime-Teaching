import type { AppUser } from "@/stores/authStore";

/** Map API role strings to dashboard home paths. */
export function dashboardPathForRole(role: string): string {
  const r = role.toLowerCase().replace(/-/g, "_");
  if (r === "department_head" || r === "dept_head" || r === "head") return "/department-head";
  if (r === "school_leader" || r === "leader" || r === "principal") return "/school-leader";
  if (r === "admin" || r === "administrator") return "/admin/calendars";
  return "/teacher";
}

export function navRoleKey(user: AppUser | null): "teacher" | "department-head" | "school-leader" | "admin" {
  if (!user) return "teacher";
  const r = user.role.toLowerCase().replace(/-/g, "_");
  if (r === "department_head" || r === "dept_head" || r === "head") return "department-head";
  if (r === "school_leader" || r === "leader" || r === "principal") return "school-leader";
  if (r === "admin" || r === "administrator") return "admin";
  return "teacher";
}
