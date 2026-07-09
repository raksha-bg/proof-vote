import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { tokenStore } from "./api";
import type { User } from "./types";

// ─── Mock user store (persisted in localStorage) ──────────────────────────────

const MOCK_USERS_KEY = "bv_mock_users";
const MOCK_ME_KEY = "bv_mock_me";

interface StoredUser {
  id: number;
  full_name: string;
  email: string;
  password: string;
  role: "admin" | "voter";
  verified: boolean;
  wallet_address: string | null;
}

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    if (raw) return JSON.parse(raw) as StoredUser[];
  } catch { /* ignore */ }
  // Seed default users
  const defaults: StoredUser[] = [
    { id: 1, full_name: "Admin User",  email: "admin@blockvote.com", password: "admin123", role: "admin",  verified: true, wallet_address: null },
    { id: 2, full_name: "Demo Voter",  email: "voter@blockvote.com", password: "voter123", role: "voter",  verified: true, wallet_address: null },
  ];
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function toPublicUser(u: StoredUser): User {
  return { id: u.id, full_name: u.full_name, email: u.email, role: u.role, verified: u.verified, wallet_address: u.wallet_address };
}

// ─── Auth context ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { full_name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  const fetchMe = useCallback(async () => {
    const raw = localStorage.getItem(MOCK_ME_KEY);
    if (!raw) { setUser(null); return; }
    try {
      setUser(JSON.parse(raw) as User);
    } catch {
      localStorage.removeItem(MOCK_ME_KEY);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw Object.assign(new Error("Invalid credentials."), { isAxiosError: true, response: { status: 401, data: { detail: "Invalid email or password." } } });
    const pub = toPublicUser(found);
    localStorage.setItem(MOCK_ME_KEY, JSON.stringify(pub));
    // Store a fake token so downstream guards don't break
    tokenStore.set(`mock.${btoa(String(found.id))}.access`, `mock.${btoa(String(found.id))}.refresh`);
    setUser(pub);
  }, []);

  const register = useCallback(async (data: { full_name: string; email: string; password: string }) => {
    const users = getUsers();
    if (users.find((u) => u.email === data.email)) {
      throw Object.assign(new Error("Email already registered."), { isAxiosError: true, response: { status: 400, data: { detail: "An account with this email already exists." } } });
    }
    const newUser: StoredUser = {
      id: users.length + 1,
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      role: "voter",
      verified: false,
      wallet_address: null,
    };
    saveUsers([...users, newUser]);
    // Auto-login after register
    const pub = toPublicUser(newUser);
    localStorage.setItem(MOCK_ME_KEY, JSON.stringify(pub));
    tokenStore.set(`mock.${btoa(String(newUser.id))}.access`, `mock.${btoa(String(newUser.id))}.refresh`);
    setUser(pub);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem(MOCK_ME_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
