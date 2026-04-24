"use client";

import { useQuery } from "@tanstack/react-query";

import type { LessonPlanDto, SessionDto } from "@/lib/api-types";
import { fetchSession } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

function sessionQueryKey(sessionId: string | null) {
  return ["calendar", "session", sessionId] as const;
}

export function useLessonPlan(sessionId: string | null) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: sessionQueryKey(sessionId),
    queryFn: () => fetchSession(sessionId!),
    enabled: Boolean(token && sessionId),
    select: (data: SessionDto): LessonPlanDto | null => data.lesson_plan ?? null
  });
}

/** Full session row for detail panels (shares cache with `useLessonPlan`). */
export function useSessionDetail(sessionId: string | null) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: sessionQueryKey(sessionId),
    queryFn: () => fetchSession(sessionId!),
    enabled: Boolean(token && sessionId)
  });
}
