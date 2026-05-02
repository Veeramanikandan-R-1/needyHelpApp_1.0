import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} });

const STORAGE_KEY = 'nh:theme';

const readInitial = () => {
  if (typeof document === 'undefined') return 'dark';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return 'dark';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readInitial);

  // Sync DOM + storage whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  // Follow OS changes only when user hasn't explicitly chosen one yet
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (e) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch { /* ignore */ }
      setThemeState(e.matches ? 'light' : 'dark');
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const setTheme = useCallback((t) => setThemeState(t === 'light' ? 'light' : 'dark'), []);
  const toggle = useCallback(() => setThemeState((t) => (t === 'light' ? 'dark' : 'light')), []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
