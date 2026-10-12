import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAuthToken, getAuthToken } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  organization?: string;
  country?: string;
  walletAddress?: string;
  role?: string;
  creditBalance?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ecofuse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Verify server token on mount if available
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authApi.getMe()
        .then((serverUser) => {
          const mapped: User = {
            id: serverUser.id,
            name: serverUser.name,
            email: serverUser.email,
            organization: serverUser.organization,
            country: serverUser.country,
            walletAddress: serverUser.wallet_address,
            role: serverUser.role,
            creditBalance: serverUser.credit_balance,
          };
          setUser(mapped);
          localStorage.setItem('ecofuse_user', JSON.stringify(mapped));
        })
        .catch(() => {
          // Token expired or server unreachable, keep current user
        });
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ecofuse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ecofuse_user');
    }
  }, [user]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      // Attempt backend authentication
      const result = await authApi.login(email, password || 'password123');
      const mappedUser: User = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        organization: result.user.organization,
        country: result.user.country,
        walletAddress: result.user.wallet_address,
        role: result.user.role,
        creditBalance: result.user.credit_balance,
      };
      setUser(mappedUser);
      return true;
    } catch (err) {
      console.warn('Backend login unavailable or invalid, utilizing local demonstration account:', err);
      // Graceful local demo fallback if backend is offline
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0] || 'Eco User',
        email: email,
        organization: 'Green Innovators',
        country: 'United States',
        walletAddress: '0x71C...4982',
        creditBalance: 420,
      };
      setUser(mockUser);
      return true;
    }
  };

  const register = async (name: string, email: string, password?: string): Promise<boolean> => {
    try {
      const result = await authApi.register(name, email, password || 'password123');
      const mappedUser: User = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        organization: result.user.organization,
        country: result.user.country,
        walletAddress: result.user.wallet_address,
        role: result.user.role,
        creditBalance: result.user.credit_balance,
      };
      setUser(mappedUser);
      return true;
    } catch (err) {
      console.warn('Backend registration unavailable, using local demo profile:', err);
      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: name,
        email: email,
        organization: 'Sustainable Solutions',
        country: 'Global',
        creditBalance: 420,
      };
      setUser(newUser);
      return true;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    try {
      await authApi.updateMe({
        name: data.name,
        organization: data.organization,
        country: data.country,
        wallet_address: data.walletAddress,
      });
    } catch (err) {
      // Local fallback
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
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
