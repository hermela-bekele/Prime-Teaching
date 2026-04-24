"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";

import { QueryProvider } from "@/providers/QueryProvider";
import { useAuthStore } from "@/stores/authStore";

function AuthHydration() {
  useEffect(() => {
    useAuthStore.getState().hydrateFromStorage();
    useAuthStore.setState({ _hydrated: true });
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthHydration />
      {children}
      <Toaster richColors position="top-center" />
    </QueryProvider>
  );
}
