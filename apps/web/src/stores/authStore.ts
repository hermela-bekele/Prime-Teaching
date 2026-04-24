import { create } from "zustand";

const TOKEN_KEY = "prime-token";
const USER_KEY = "prime-user";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string | null;
};

type AuthState = {
  token: string | null;
  user: AppUser | null;
  _hydrated: boolean;
  setAuth: (token: string, user: AppUser) => void;
  setUser: (user: AppUser) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
  isTeacher: () => boolean;
  isDepartmentHead: () => boolean;
  isSchoolLeader: () => boolean;
};

function readStorage(): { token: string | null; user: AppUser | null } {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? (JSON.parse(raw) as AppUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function persist(token: string | null, user: AppUser | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function roleNorm(role: string) {
  return role.toLowerCase().replace(/-/g, "_");
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  _hydrated: false,
  setAuth: (token, user) => {
    persist(token, user);
    set({ token, user });
  },
  setUser: (user) => {
    const token = get().token;
    persist(token, user);
    set({ user });
  },
  setToken: (token) => {
    const user = get().user;
    persist(token, user);
    set({ token });
  },
  logout: () => {
    persist(null, null);
    set({ token: null, user: null });
  },
  hydrateFromStorage: () => {
    const { token, user } = readStorage();
    set({ token, user });
  },
  isTeacher: () => {
    const u = get().user;
    if (!u) return false;
    const r = roleNorm(u.role);
    return r === "teacher" || r === "instructor";
  },
  isDepartmentHead: () => {
    const u = get().user;
    if (!u) return false;
    const r = roleNorm(u.role);
    return r === "department_head" || r === "dept_head" || r === "head";
  },
  isSchoolLeader: () => {
    const u = get().user;
    if (!u) return false;
    const r = roleNorm(u.role);
    return r === "school_leader" || r === "leader" || r === "principal";
  }
}));
