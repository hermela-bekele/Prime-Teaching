import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const role = useAuthStore((s) => s.role);
  const setRole = useAuthStore((s) => s.setRole);

  return {
    token,
    setToken,
    role,
    setRole,
    isSignedIn: Boolean(token)
  };
}
