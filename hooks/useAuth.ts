import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

const USER_KEY = 'kissanMitraUser';

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const login = useCallback((name: string) => {
    const newUser: User = { name };
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
  }, []);

  return { user, login, logout };
};

export default useAuth;
