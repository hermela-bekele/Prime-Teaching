import type { AppUser } from "@/stores/authStore";

/**
 * When NEXT_PUBLIC_BYPASS_AUTH=true, the app skips real login and uses a demo session.
 * Use only for local or preview demos — never enable on a public production deployment.
 *
 * Pair with mock API data (leave NEXT_PUBLIC_USE_MOCK_DATA unset or "true") so calls do not 401.
 */
export function isAuthBypassEnabled(): boolean {
  return typeof process !== "undefined" && process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
}

export const AUTH_BYPASS_DEMO_TOKEN = "bypass-demo-token";

export const AUTH_BYPASS_DEMO_USER: AppUser = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Demo User",
  email: "demo@example.com",
  role: "admin",
  schoolId: "00000000-0000-4000-8000-000000000002",
};
