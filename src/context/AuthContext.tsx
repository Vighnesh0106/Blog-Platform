import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthResponse } from '../types.ts';
import { api, tokenStorage } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: {
    username: string;
    name: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: { name?: string; bio?: string; avatar?: string; username?: string }) => Promise<void>;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(tokenStorage.get());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = tokenStorage.get();
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      console.warn('Failed to load authenticated user, clearing session', err);
      tokenStorage.clear();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (identifier: string, password: string) => {
    const res: AuthResponse = await api.login({ identifier, password });
    tokenStorage.set(res.token);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const register = async (payload: {
    username: string;
    name: string;
    email: string;
    password: string;
    bio?: string;
    avatar?: string;
  }) => {
    const res: AuthResponse = await api.register(payload);
    tokenStorage.set(res.token);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (payload: {
    name?: string;
    bio?: string;
    avatar?: string;
    username?: string;
  }) => {
    const updated = await api.updateProfile(payload);
    setUser(updated);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        login,
        register,
        logout,
        updateProfile,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
