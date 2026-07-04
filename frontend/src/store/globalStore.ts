import { create } from "zustand";

interface ActiveDateFilter {
  month: number;
  year: number;
}

interface GlobalState {
  themeMode: "light" | "dark";
  token: string | null;
  user: {
    user_id: string;
    email: string;
    name: string;
    icon?: string;
  } | null;
  activeDateFilter: ActiveDateFilter;
  setThemeMode: (mode: "light" | "dark") => void;
  toggleThemeMode: () => void;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  setDateFilter: (filter: ActiveDateFilter) => void;
  logout: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  themeMode: (localStorage.getItem("themeMode") as "light" | "dark") || "light",
  token: localStorage.getItem("token") || null,
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,
  activeDateFilter: {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  setThemeMode: (mode) => {
    localStorage.setItem("themeMode", mode);
    set({ themeMode: mode });
  },
  toggleThemeMode: () => {
    set((state) => {
      const newMode = state.themeMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return { themeMode: newMode };
    });
  },
  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token });
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },
  setDateFilter: (filter) => {
    set({ activeDateFilter: filter });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
