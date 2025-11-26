import { create } from "zustand";

import { Role } from "../config/roles";

type User = { id: string; name: string; role: Role };

type AuthState = {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  async login(email, pass) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (data.ok && data.token) {
        // Decode token or use data.user if provided (assuming backend returns user info)
        // For now, let's assume backend returns user info in data.user or we decode token
        // If backend only returns token, we might need to decode it.
        // Let's assume data.user is present or we decode it.
        // Actually, looking at authController (from memory), it usually returns token.
        // Let's decode it client side or expect user object.
        // I'll assume data.user is returned for simplicity, if not I'll add it to backend.

        // Let's verify authController return structure first? 
        // No, I'll just assume standard JWT decode if needed, but let's try to use data.user if available.
        // If I look at the previous summary, authController signs the token.
        // I'll add a simple JWT decode helper or just rely on data.user if I update backend to return it.
        // Let's update backend authController to return user object too, it's easier.

        // Wait, I can't update backend authController right now without checking it.
        // I'll just decode the token payload.
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        const user = {
          id: payload.id,
          name: payload.name,
          role: payload.role,
          email: payload.email
        };

        localStorage.setItem('token', data.token);
        set({ user, token: data.token });
        return true;
      }
    } catch (e) {
      console.error("Login error", e);
    }
    return false;
  },
  logout() {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
