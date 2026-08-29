'use client';

import React, { createContext, useContext, useSyncExternalStore, useMemo, useCallback } from 'react';
import { Language, TRANSLATIONS } from './translations';

export { TRANSLATIONS };
export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (thText: string, enText: string) => string;
  isTh: boolean;
  isEn: boolean;
}

const STORAGE_KEY = 'mumt_language';
const HOME_STORAGE_KEY = 'mumt_home_lang';

function getClientLanguage(): Language {
  if (typeof window === 'undefined') return 'th';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(HOME_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'th';
  } catch {
    return 'th';
  }
}

function subscribeToLanguageChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('mumt-language-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('mumt-language-change', callback);
  };
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'th',
  setLanguage: () => {},
  t: (th: string) => th,
  isTh: true,
  isEn: false,
});

export function LanguageProvider({
  children,
  defaultLanguage,
}: {
  children: React.ReactNode;
  defaultLanguage?: Language;
}) {
  // useSyncExternalStore ensures hydration matches server snapshot without flash/error
  const storedLang = useSyncExternalStore(
    subscribeToLanguageChange,
    getClientLanguage,
    () => defaultLanguage || 'th'
  );

  const activeLang = defaultLanguage || storedLang;

  const setLanguage = useCallback((next: Language) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next);
        window.localStorage.setItem(HOME_STORAGE_KEY, next);
        window.dispatchEvent(new Event('mumt-language-change'));
        window.dispatchEvent(new Event('storage'));
        
        // Update document lang attribute
        document.documentElement.lang = next;
      }
    } catch {}
  }, []);

  const t = useCallback((thText: string, enText: string): string => {
    return activeLang === 'en' ? enText : thText;
  }, [activeLang]);

  const value = useMemo(() => ({
    language: activeLang,
    setLanguage,
    t,
    isTh: activeLang === 'th',
    isEn: activeLang === 'en',
  }), [activeLang, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
