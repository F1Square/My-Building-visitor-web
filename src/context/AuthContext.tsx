import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User, Subscription } from '../types';
import api from '../lib/apiClient';

function isSubActive(sub: Subscription | null): boolean {
  if (!sub || sub.status !== 'active') return false;
  if (sub.plan === 'lifetime') return true;
  return !sub.expires_at || new Date(sub.expires_at) > new Date();
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User, subscription?: Subscription | null) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setSubscription: (sub: Subscription | null) => void;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [subscription, setSubscriptionState] = useState<Subscription | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      const sub = await api.get<Subscription | null>('/subscriptions/me');
      if (sub) {
        localStorage.setItem('mb_subscription', JSON.stringify(sub));
        setSubscriptionState(sub);
      } else {
        localStorage.removeItem('mb_subscription');
        setSubscriptionState(null);
      }
    } catch {
      // keep cached subscription on network errors
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('mb_token');
    const storedUser = localStorage.getItem('mb_user');
    const storedSub = localStorage.getItem('mb_subscription');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedSub) setSubscriptionState(JSON.parse(storedSub));
        void fetchSubscription();
      } catch {
        localStorage.removeItem('mb_token');
        localStorage.removeItem('mb_user');
        localStorage.removeItem('mb_subscription');
      }
    }
  }, [fetchSubscription]);

  const login = (t: string, u: User, sub?: Subscription | null) => {
    localStorage.setItem('mb_token', t);
    localStorage.setItem('mb_user', JSON.stringify(u));
    if (sub !== undefined && sub !== null) {
      localStorage.setItem('mb_subscription', JSON.stringify(sub));
      setSubscriptionState(sub);
    } else if (sub === null) {
      localStorage.removeItem('mb_subscription');
      setSubscriptionState(null);
    }
    setToken(t);
    setUser(u);
    if (sub === undefined) void fetchSubscription();
  };

  const logout = () => {
    localStorage.removeItem('mb_token');
    localStorage.removeItem('mb_user');
    localStorage.removeItem('mb_subscription');
    setToken(null);
    setUser(null);
    setSubscriptionState(null);
  };

  const updateUser = (u: User) => {
    localStorage.setItem('mb_user', JSON.stringify(u));
    setUser(u);
  };

  const setSubscription = (sub: Subscription | null) => {
    if (sub) localStorage.setItem('mb_subscription', JSON.stringify(sub));
    else localStorage.removeItem('mb_subscription');
    setSubscriptionState(sub);
  };

  const refreshSubscription = useCallback(async () => {
    if (localStorage.getItem('mb_token')) await fetchSubscription();
  }, [fetchSubscription]);

  const hasActiveSubscription = user?.role === 'admin' || isSubActive(subscription);

  const value = useMemo(() => ({
    user, token, subscription, hasActiveSubscription,
    isAuthenticated: !!token && !!user,
    login, logout, updateUser, setSubscription, refreshSubscription,
  }), [user, token, subscription, hasActiveSubscription, refreshSubscription]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
