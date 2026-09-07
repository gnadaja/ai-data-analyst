"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, THEME_COOKIE } from "@/lib/i18n/server";
import { isLocale, type Locale } from "@/lib/i18n/dictionaries";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;

  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function setTheme(theme: "light" | "dark") {
  if (theme !== "light" && theme !== "dark") return;

  (await cookies()).set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
