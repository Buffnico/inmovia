import { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('inmovia.role') || 'guest'); // guest | owner | agent | admin
  useEffect(() => { localStorage.setItem('inmovia.role', role); }, [role]);
  const value = { role, setRole, isLogged: role !== 'guest' };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
}
