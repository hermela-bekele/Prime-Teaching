"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDepartmentProgress, fetchSchoolProgress, fetchTeacherProgress } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

export function useTeacherProgress() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["progress", "teacher", token],
    queryFn: () => fetchTeacherProgress(),
    enabled: Boolean(token)
  });
}

export function useDepartmentProgress() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["progress", "department", token],
    queryFn: () => fetchDepartmentProgress(),
    enabled: Boolean(token)
  });
}

export function useSchoolProgress() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["progress", "school", token],
    queryFn: () => fetchSchoolProgress(),
    enabled: Boolean(token)
  });
}
