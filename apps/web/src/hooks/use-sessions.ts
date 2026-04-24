"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMySessions } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

export function useSessions(filters?: { status?: string; date?: string }) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["calendar", "my-sessions", filters, token],
    queryFn: () => fetchMySessions(filters),
    enabled: Boolean(token)
  });
}
