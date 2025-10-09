import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiUsers, AuthSession, SiteKey } from '@/services/apiUsers';

interface AuthContextType {
  user: AuthSession | null;
  isLoading: boolean;
  login: (username: string, password: string, site?: SiteKey) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@auth_session';
const API_USERS = createApiUsers();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved session on app start
  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const savedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        let session: AuthSession = JSON.parse(savedSession);

        if (session?.token && !session.avatar) {
          try {
            const profile = await API_USERS.fetchUserProfile('root', session.token);
            session = {
              ...session,
              name: profile.name ?? session.name,
              email: profile.email ?? session.email,
              roles: profile.roles ?? session.roles,
              avatar: profile.avatar ?? session.avatar ?? null,
            };
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          } catch (profileError) {
            console.warn('Failed to refresh user profile on load:', profileError);
          }
        }

        setUser(session);
      }
    } catch (error) {
      console.error('Error loading saved session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Login always happens against the root site (expoflamenco.com)
      let session = await API_USERS.login('root', username, password);

      if (session.token && !session.avatar) {
        try {
          const profile = await API_USERS.fetchUserProfile('root', session.token);
          session = {
            ...session,
            name: profile.name ?? session.name,
            email: profile.email ?? session.email,
            roles: profile.roles ?? session.roles,
            avatar: profile.avatar ?? session.avatar ?? null,
          };
        } catch (profileError) {
          console.warn('Failed to enrich user profile after login:', profileError);
        }
      }

      // Save session to storage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setUser(session);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = useMemo(() => {
    if (!user?.roles) {
      return false;
    }
    return user.roles.some((role) =>
      typeof role === 'string'
        ? ['administrator', 'super_admin', 'super admin'].includes(role.toLowerCase())
        : false
    );
  }, [user?.roles]);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
