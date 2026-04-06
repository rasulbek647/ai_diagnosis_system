// LanguageContext.jsx — Global language state
import { createContext, useContext, useState } from 'react';
import uz from '../i18n/uz';
import ru from '../i18n/ru';
import en from '../i18n/en';

const translations = { uz, ru, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Default language: Uzbek
  const [lang, setLang] = useState(
    () => localStorage.getItem('medai_lang') || 'uz'
  );

  const t = translations[lang] || translations.uz;

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('medai_lang', newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}