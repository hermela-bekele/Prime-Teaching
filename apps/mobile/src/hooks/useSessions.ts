import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

export function useSessions() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["sessions", token],
    queryFn: () => apiFetch<unknown[]>("/calendar", { token }),
    enabled: Boolean(token)
  });
}
