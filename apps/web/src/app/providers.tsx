"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";

import {
  AUTH_BYPASS_DEMO_TOKEN,
  AUTH_BYPASS_DEMO_USER,
  isAuthBypassEnabled,
} from "@/lib/auth-bypass";
import { QueryProvider } from "@/providers/QueryProvider";
import { useAuthStore } from "@/stores/authStore";

function AuthHydration() {
  useEffect(() => {
    if (isAuthBypassEnabled()) {
      useAuthStore.getState().setAuth(AUTH_BYPASS_DEMO_TOKEN, AUTH_BYPASS_DEMO_USER);
    } else {
      useAuthStore.getState().hydrateFromStorage();
    }
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
