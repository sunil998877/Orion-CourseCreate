import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'orion-ui-theme';

type ThemeName = 'dark' | 'light';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function applyDocumentTheme(isDark: boolean) {
  const theme: ThemeName = isDark ? 'dark' : 'light';
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', isDark);
  document.body?.classList.toggle('dark', isDark);
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore private mode */
  }
}

function readInitialDark(): boolean {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    const legacy = localStorage.getItem('theme');
    if (legacy === 'light') return false;
    if (legacy === 'dark') return true;
  } catch {
    /* ignore */
  }
  return true;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const dark = readInitialDark();
    applyDocumentTheme(dark);
    return dark;
  });

  useEffect(() => {
    applyDocumentTheme(isDark);
  }, [isDark]);

  const setTheme = useCallback((theme: ThemeName) => {
    const dark = theme === 'dark';
    applyDocumentTheme(dark);
    setIsDark(dark);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      applyDocumentTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ isDark, toggleTheme, setTheme }), [isDark, toggleTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
