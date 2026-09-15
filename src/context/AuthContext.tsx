import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (username: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  quickSwitchUser: (role: 'ADMIN' | 'USER') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('apex_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('apex_access_token');
      if (savedToken) {
        try {
          const res = await api.getCurrentUser();
          setUser(res.user);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('apex_access_token');
          setToken(null);
          setUser(null);
        }
      } else {
        // Auto-login as demo user alex_coder for immediate interactive review experience!
        try {
          const res = await api.login('alex_coder', 'password123');
          localStorage.setItem('apex_access_token', res.accessToken);
          setToken(res.accessToken);
          setUser(res.user);
        } catch (e) {
          // Ignore
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    localStorage.setItem('apex_access_token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const register = async (username: string, email: string, pass: string) => {
    const res = await api.register(username, email, pass);
    localStorage.setItem('apex_access_token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('apex_access_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitchUser = async (role: 'ADMIN' | 'USER') => {
    setIsLoading(true);
    try {
      const identifier = role === 'ADMIN' ? 'admin' : 'alex_coder';
      const res = await api.login(identifier, 'password123');
      localStorage.setItem('apex_access_token', res.accessToken);
      setToken(res.accessToken);
      setUser(res.user);
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        logout,
        quickSwitchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
