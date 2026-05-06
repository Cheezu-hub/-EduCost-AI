import { create } from 'zustand';
import { authApi, userApi, tokenStore, type AuthUser } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  init: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  init: async () => {
    if (typeof window === 'undefined') return;
    const token = tokenStore.getAccess();
    if (!token) return;

    try {
      const user = await userApi.me();
      set({ user });
    } catch {
      tokenStore.clear();
      set({ user: null });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register({ name, email, password });
      tokenStore.set(data.accessToken, data.refreshToken);
      set({ user: data.user, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login({ email, password });
      tokenStore.set(data.accessToken, data.refreshToken);
      set({ user: data.user, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    tokenStore.clear();
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
