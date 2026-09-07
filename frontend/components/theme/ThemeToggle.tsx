"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/providers";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export function ThemeToggle({ locale }: { locale: Locale }) {
  const { theme, toggleTheme } = useTheme();
  const dictionary = getDictionary(locale);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? dictionary.lightMode : dictionary.darkMode}
      aria-pressed={isDark}
      title={isDark ? dictionary.lightMode : dictionary.darkMode}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">{isDark ? <Moon size={15} /> : <Sun size={15} />}</span>
      </span>
    </button>
  );
}
