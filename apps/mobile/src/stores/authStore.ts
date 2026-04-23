import { create } from "zustand";

type Role = "teacher" | "dept_head" | "leader" | null;

type AuthStore = {
  token: string | null;
  role: Role;
  setToken: (token: string | null) => void;
  setRole: (role: Role) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  role: null,
  setToken: (token) => set({ token }),
  setRole: (role) => set({ role })
}));
