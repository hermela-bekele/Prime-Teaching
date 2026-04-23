"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useSessionStore } from "@/stores/session-store";

export function useLessonPlans() {
  const token = useSessionStore((s) => s.token);

  return useQuery({
    queryKey: ["lesson-plans", token],
    queryFn: () => apiClient<unknown[]>("/curriculum/subjects", { token }),
    enabled: Boolean(token)
  });
}
