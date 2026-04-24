"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { fetchTeachingNoteBySession } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

function sessionNoteQueryKey(sessionId: string | null) {
  return ["teaching-notes", "session", sessionId] as const;
}

export function useTeachingNoteBySession(sessionId: string | null) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: sessionNoteQueryKey(sessionId),
    queryFn: () => fetchTeachingNoteBySession(sessionId!),
    enabled: Boolean(token && sessionId),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    }
  });
}

export { sessionNoteQueryKey };
