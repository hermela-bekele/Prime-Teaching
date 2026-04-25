import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { UserRole } from "@/lib/api-types";

type AuthStore = {
  token: string | null;
  role: UserRole | null;
  email: string | null;
  name: string | null;
  hydrated: boolean;
  login: (payload: { token: string; role: UserRole; email?: string; name?: string }) => Promise<void>;
  /** Demo-only: switch workspace role while keeping the same session token. */
  setRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const AUTH_TOKEN_KEY = "prime_mobile_token";
const AUTH_ROLE_KEY = "prime_mobile_role";
const AUTH_EMAIL_KEY = "prime_mobile_email";
const AUTH_NAME_KEY = "prime_mobile_name";

async function setStoredValue(key: string, value: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteStoredValue(key: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  role: null,
  email: null,
  name: null,
  hydrated: false,
  login: async ({ token, role, email, name }) => {
    await Promise.all([
      setStoredValue(AUTH_TOKEN_KEY, token),
      setStoredValue(AUTH_ROLE_KEY, role),
      setStoredValue(AUTH_EMAIL_KEY, email ?? ""),
      setStoredValue(AUTH_NAME_KEY, name ?? "")
    ]);
    set({ token, role, email: email ?? null, name: name ?? null });
  },
  setRole: async (role) => {
    await setStoredValue(AUTH_ROLE_KEY, role);
    set({ role });
  },
  logout: async () => {
    await Promise.all([
      deleteStoredValue(AUTH_TOKEN_KEY),
      deleteStoredValue(AUTH_ROLE_KEY),
      deleteStoredValue(AUTH_EMAIL_KEY),
      deleteStoredValue(AUTH_NAME_KEY)
    ]);
    set({ token: null, role: null, email: null, name: null });
  },
  hydrate: async () => {
    const [token, role, email, name] = await Promise.all([
      getStoredValue(AUTH_TOKEN_KEY),
      getStoredValue(AUTH_ROLE_KEY),
      getStoredValue(AUTH_EMAIL_KEY),
      getStoredValue(AUTH_NAME_KEY)
    ]);
    set({
      token,
      role: (role as UserRole | null) ?? null,
      email: email || null,
      name: name || null,
      hydrated: true
    });
  }
}));
