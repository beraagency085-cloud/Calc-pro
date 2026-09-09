import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AsianLanguage, ASIAN_LANGUAGES } from '../types/language';
import { SectionTranslations, getTranslation } from '../data/translations';

interface LanguageContextType {
  currentLanguage: AsianLanguage;
  setLanguage: (code: string) => void;
  languages: AsianLanguage[];
  t: (key: keyof SectionTranslations) => string;
  isSelectorOpen: boolean;
  setIsSelectorOpen: (open: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'calcpro_selected_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<AsianLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = ASIAN_LANGUAGES.find((l) => l.code === saved);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    // Default to Bengali (bn) as primary user preference, or fallback to English
    return ASIAN_LANGUAGES.find((l) => l.code === 'bn') || ASIAN_LANGUAGES[0];
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const applyGoogleTranslate = (langCode: string) => {
    try {
      // Set the standard google translate cookie
      const domain = window.location.hostname;
      document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${domain}`;
      document.cookie = `googtrans=/auto/${langCode}; path=/;`;

      // Trigger change on google translate combo if loaded
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Google Translate trigger note:', e);
    }
  };

  const setLanguage = (code: string) => {
    const lang = ASIAN_LANGUAGES.find((l) => l.code === code);
    if (!lang) return;

    setCurrentLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang.code);
    } catch {
      // ignore
    }

    // Set document direction for RTL Asian languages (Arabic, Urdu, Persian)
    if (lang.rtl) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }

    document.documentElement.setAttribute('lang', lang.code);

    // Apply translation trigger
    applyGoogleTranslate(lang.code);
  };

  // Initialize on mount
  useEffect(() => {
    if (currentLanguage.rtl) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    document.documentElement.setAttribute('lang', currentLanguage.code);
  }, [currentLanguage]);

  const t = (key: keyof SectionTranslations): string => {
    return getTranslation(currentLanguage.code, key);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        languages: ASIAN_LANGUAGES,
        t,
        isSelectorOpen,
        setIsSelectorOpen,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
