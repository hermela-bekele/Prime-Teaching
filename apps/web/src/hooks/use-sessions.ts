"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useSessionStore } from "@/stores/session-store";

export function useSessions() {
  const token = useSessionStore((s) => s.token);

  return useQuery({
    queryKey: ["sessions", token],
    queryFn: () => apiClient<unknown[]>("/calendar", { token }),
    enabled: Boolean(token)
  });
}
