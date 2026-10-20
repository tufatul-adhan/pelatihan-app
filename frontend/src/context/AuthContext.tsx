import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nama: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        // Set token in axios default headers
        authService.setAuthToken(storedToken);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      if (response.data?.user && response.data?.token) {
        const userData = response.data.user;
        const userToken = response.data.token;

        setUser(userData);
        setToken(userToken);

        // Save to localStorage
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('authUser', JSON.stringify(userData));

        // Set token in axios default headers
        authService.setAuthToken(userToken);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (nama: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.register(nama, email, password);

      if (response.data?.user && response.data?.token) {
        const userData = response.data.user;
        const userToken = response.data.token;

        setUser(userData);
        setToken(userToken);

        // Save to localStorage
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('authUser', JSON.stringify(userData));

        // Set token in axios default headers
        authService.setAuthToken(userToken);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    authService.setAuthToken(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
