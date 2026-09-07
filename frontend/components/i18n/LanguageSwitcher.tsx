"use client";

import ReactCountryFlag from "react-country-flag";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { useLanguage } from "@/app/providers";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { changeLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  async function handleChange(nextLocale: Locale) {
    await changeLocale(nextLocale);
    setOpen(false);
    router.refresh();
  }

  const countryCode = locale === "es" ? "ES" : "GB";

  return (
    <div className="language-switcher">
      <button type="button" className="language-current" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu" aria-label="Language">
        <ReactCountryFlag countryCode={countryCode} svg aria-hidden="true" />
        <span>{locale === "es" ? "ES" : "EN"}</span>
      </button>
      {open && (
        <div className="language-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => void handleChange("es")}><ReactCountryFlag countryCode="ES" svg aria-hidden="true" />ES</button>
          <button type="button" role="menuitem" onClick={() => void handleChange("en")}><ReactCountryFlag countryCode="GB" svg aria-hidden="true" />EN</button>
        </div>
      )}
    </div>
  );
}
