"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSubjects } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

export function useSubjects() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["curriculum", "subjects", token],
    queryFn: () => fetchSubjects(),
    enabled: Boolean(token)
  });
}
