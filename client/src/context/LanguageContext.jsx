import { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en';
import hi from '../translations/hi';
import te from '../translations/te';
import ta from '../translations/ta';
import mr from '../translations/mr';

const LanguageContext = createContext();

const translations = { en, hi, te, ta, mr };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
