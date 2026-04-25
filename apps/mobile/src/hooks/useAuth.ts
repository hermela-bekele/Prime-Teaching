import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { token, role, email, name, hydrated, login, logout, hydrate, setRole } = useAuthStore();

  return {
    token,
    role,
    email,
    name,
    hydrated,
    login,
    logout,
    hydrate,
    setRole,
    isSignedIn: Boolean(token)
  };
}
