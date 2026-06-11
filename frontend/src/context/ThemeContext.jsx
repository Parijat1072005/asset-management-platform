import React, { createContext, useContext, useState, useEffect } from 'react';

// Key name — deliberately different from old 'theme' key to ignore any stale values
const STORAGE_KEY = 'assetiq_theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default is always LIGHT unless user has explicitly saved 'dark' under the new key
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
