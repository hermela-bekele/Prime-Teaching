"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchSessionStatus } from "@/lib/api-client";

export function useMarkSessionDelivered() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => patchSessionStatus(sessionId, { status: "delivered" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["calendar", "my-sessions"] });
      void qc.invalidateQueries({ queryKey: ["calendar", "session"] });
    }
  });
}
