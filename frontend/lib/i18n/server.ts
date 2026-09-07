import { cookies } from "next/headers";
import { getDictionary, isLocale, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "ai-data-locale";
export const THEME_COOKIE = "ai-data-theme";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "es";
}

export async function getServerDictionary() {
  return getDictionary(await getLocale());
}
