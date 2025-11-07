import { create } from "zustand";

type Role = "owner";
type User = { id: string; name: string; role: Role };

type AuthState = {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  async login(email, pass) {
    // Owner provisorio
    if (email.toLowerCase() === "owner@inmovia.com" && pass === "123456") {
      set({ user: { id: "owner-1", name: "Nicolás (Owner)", role: "owner" } });
      return true;
    }
    return false;
  },
  logout() { set({ user: null }); },
}));
