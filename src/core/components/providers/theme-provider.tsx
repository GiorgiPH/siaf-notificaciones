'use client';

import * as React from 'react';
import { THEMES, THEME_COOKIE, DEFAULT_THEME, isTheme, type Theme } from './theme-config';

export { THEMES, THEME_COOKIE, DEFAULT_THEME, isTheme, type Theme };

type ThemeContextValue = {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme | undefined>(undefined);

  React.useEffect(() => {
    const fromHtml = document.documentElement.getAttribute('data-theme');
    setThemeState(isTheme(fromHtml) ? fromHtml : DEFAULT_THEME);
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, themes: THEMES }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    return { theme: undefined, setTheme: () => {}, themes: THEMES };
  }
  return ctx;
}
