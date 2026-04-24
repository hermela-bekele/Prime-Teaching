"use client";

import { useQuery } from "@tanstack/react-query";

import type { AssessmentDto } from "@/lib/api-types";
import { fetchAssessmentsBySession } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

export function assessmentsSessionQueryKey(sessionId: string | null) {
  return ["assessments", "session", sessionId] as const;
}

export function useAssessmentsBySession(sessionId: string | null) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: assessmentsSessionQueryKey(sessionId),
    queryFn: () => fetchAssessmentsBySession(sessionId!),
    enabled: Boolean(token && sessionId)
  });
}

export function pickPrimaryAssessment(rows: AssessmentDto[]): AssessmentDto | null {
  if (!rows.length) return null;
  const quiz = rows.find((a) => (a.assessment_type ?? "").toLowerCase() === "quiz");
  return quiz ?? rows[0] ?? null;
}
