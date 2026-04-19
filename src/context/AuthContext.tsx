import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Subscription } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, subscription?: Subscription | null) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setSubscription: (sub: Subscription | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [subscription, setSubscriptionState] = useState<Subscription | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('mb_token');
    const storedUser = localStorage.getItem('mb_user');
    const storedSub = localStorage.getItem('mb_subscription');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedSub) setSubscriptionState(JSON.parse(storedSub));
      } catch {
        localStorage.removeItem('mb_token');
        localStorage.removeItem('mb_user');
        localStorage.removeItem('mb_subscription');
      }
    }
  }, []);

  const login = (t: string, u: User, sub?: Subscription | null) => {
    localStorage.setItem('mb_token', t);
    localStorage.setItem('mb_user', JSON.stringify(u));
    if (sub !== undefined && sub !== null) {
      localStorage.setItem('mb_subscription', JSON.stringify(sub));
      setSubscriptionState(sub);
    }
    setToken(t);
    setUser(u);
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

  return (
    <AuthContext.Provider value={{
      user, token, subscription,
      isAuthenticated: !!token && !!user,
      login, logout, updateUser, setSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
