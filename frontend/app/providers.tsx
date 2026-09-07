"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setLocale, setTheme } from "@/app/actions/preferences";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };
type LanguageContextValue = { locale: Locale; dictionary: ReturnType<typeof getDictionary>; changeLocale: (nextLocale: Locale) => Promise<void> };

const ThemeContext = createContext<ThemeContextValue | null>(null);
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function Providers({ children, initialTheme, initialLocale }: { children: ReactNode; initialTheme: Theme; initialLocale: Locale }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("ai-data-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setThemeState(nextTheme);
        void setTheme(nextTheme);
      },
    }),
    [theme],
  );

  const languageValue = useMemo(
    () => ({
      locale,
      dictionary: getDictionary(locale),
      changeLocale: async (nextLocale: Locale) => {
        setLocaleState(nextLocale);
        await setLocale(nextLocale);
      },
    }),
    [locale],
  );

  return <LanguageContext.Provider value={languageValue}><ThemeContext.Provider value={value}>{children}</ThemeContext.Provider></LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage debe usarse dentro de Providers");
  return context;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de Providers");
  return context;
}
