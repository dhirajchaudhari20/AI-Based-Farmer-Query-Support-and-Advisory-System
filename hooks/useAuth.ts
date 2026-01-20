import { useState, useEffect, useCallback } from 'react';
import type { User, LanguageCode } from '../types';
import { INDIAN_STATES_DISTRICTS } from '../constants';

const AUTH_KEY = 'kissanMitraAuth';

interface AuthData {
  user: User;
  language: LanguageCode;
  state: string;
  district: string;
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('hi');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const defaultState = Object.keys(INDIAN_STATES_DISTRICTS)[0];
  const defaultDistrict = INDIAN_STATES_DISTRICTS[defaultState][0];

  const [state, setState] = useState<string>(defaultState);
  const [district, setDistrict] = useState<string>(defaultDistrict);

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const authData: AuthData = JSON.parse(storedAuth);
        setUser(authData.user);
        setLanguage(authData.language);
        setState(authData.state || defaultState);
        setDistrict(authData.district || defaultDistrict);
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem(AUTH_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [defaultState, defaultDistrict]);

  const login = useCallback((name: string, lang: LanguageCode, userState: string, userDistrict: string) => {
    const authData: AuthData = { 
        user: { name }, 
        language: lang,
        state: userState,
        district: userDistrict,
    };
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setUser(authData.user);
      setLanguage(authData.language);
      setState(authData.state);
      setDistrict(authData.district);
    } catch (error) {
      console.error("Failed to save auth data to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
      setUser(null);
    } catch (error) {
      console.error("Failed to remove auth data from localStorage", error);
    }
  }, []);

  const setAuthLanguage = useCallback((newLang: LanguageCode) => {
      setLanguage(newLang);
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
          try {
            const authData: AuthData = JSON.parse(storedAuth);
            authData.language = newLang;
            localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
          } catch (e) { /* ignore */ }
      }
  }, []);

  return { user, language, state, district, login, logout, setLanguage: setAuthLanguage, isLoading };
};

export default useAuth;