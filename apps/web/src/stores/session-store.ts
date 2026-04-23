import { create } from "zustand";

type SessionState = {
  token: string | null;
  setToken: (token: string | null) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  setToken: (token) => set({ token })
}));
