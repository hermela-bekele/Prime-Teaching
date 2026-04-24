"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { asAppRoute } from "@/lib/navigation";
import { dashboardPathForRole } from "@/lib/roles";
import { useAuthStore } from "@/stores/authStore";

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s._hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (token && user) {
      router.replace(asAppRoute(dashboardPathForRole(user.role)));
    } else {
      router.replace(asAppRoute("/login"));
    }
  }, [hydrated, token, user, router]);

  return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Redirecting…</main>;
}
