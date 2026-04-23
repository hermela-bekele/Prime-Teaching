"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useSessionStore } from "@/stores/session-store";

export function useProgress() {
  const token = useSessionStore((s) => s.token);

  return useQuery({
    queryKey: ["progress", token],
    queryFn: () => apiClient<unknown[]>("/progress", { token }),
    enabled: Boolean(token)
  });
}
