import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const TOKEN_KEY = 'wa_token';
const USER_KEY = 'wa_user';

export const authStore = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  getUser: (): AuthUser | null => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setAuth: (token: string, user: AuthUser): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth to localStorage', e);
    }
    window.dispatchEvent(new Event('auth-change'));
  },
  clearAuth: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear auth from localStorage', e);
    }
    window.dispatchEvent(new Event('auth-change'));
  },
};

export function useAuthStore(): AuthState;
export function useAuthStore<T>(selector: (state: AuthState) => T): T;
export function useAuthStore<T>(selector?: (state: AuthState) => T): AuthState | T {
  const [token, setToken] = useState<string | null>(authStore.getToken);
  const [user, setUser] = useState<AuthUser | null>(authStore.getUser);

  useEffect(() => {
    const handler = () => {
      setToken(authStore.getToken());
      setUser(authStore.getUser());
    };
    window.addEventListener('auth-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('auth-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const state: AuthState = {
    token,
    user,
    login: authStore.setAuth,
    logout: authStore.clearAuth,
  };

  if (selector) {
    return selector(state);
  }

  return state;
}
