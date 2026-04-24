"use client";

import { useQuery } from "@tanstack/react-query";

import type { GenerationJobDto } from "@/lib/api-types";
import { fetchGenerationJob } from "@/lib/api-client";

function isTerminal(job: GenerationJobDto | undefined) {
  if (!job) return false;
  const s = job.status?.toLowerCase() ?? "";
  return s === "completed" || s === "failed" || s === "success" || s === "error";
}

export function useGenerationJob(jobId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["generate", "job", jobId],
    queryFn: () => fetchGenerationJob(jobId!),
    enabled: Boolean(jobId && enabled),
    refetchInterval: (query) => (isTerminal(query.state.data) ? false : 2000)
  });
}
