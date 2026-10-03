import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('gabirwa_dark');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [rtl, setRtl] = useState(() => localStorage.getItem('gabirwa_rtl') === 'true');

  const [language, setLanguage] = useState(() => localStorage.getItem('gabirwa_lang') || 'en');

  // Apply dark class to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('gabirwa_dark', darkMode);
  }, [darkMode]);

  // Apply dir attribute to <html>
  useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    localStorage.setItem('gabirwa_rtl', rtl);
  }, [rtl]);

  useEffect(() => {
    localStorage.setItem('gabirwa_lang', language);
  }, [language]);

  const toggleDark = () => setDarkMode(d => !d);
  const toggleRtl  = () => setRtl(r => !r);
  const toggleLang = () => setLanguage(l => l === 'en' ? 'rw' : 'en');

  return (
    <SettingsContext.Provider value={{ darkMode, rtl, language, toggleDark, toggleRtl, toggleLang }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
