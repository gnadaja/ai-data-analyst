"use client";

import Link from "next/link";
import { LogOut, Menu, User, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PORTFOLIO_URL } from "@/lib/portfolio";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function AppNavbar({ locale, userEmail }: { locale: Locale; userEmail: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dictionary = getDictionary(locale);

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const closeMenu = () => setOpen(false);
  const linkClass = (path: string) => `app-nav-link ${pathname === path ? "active" : ""}`;

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <Link href="/" className="app-brand" onClick={closeMenu}>
          <span className="app-brand-mark" aria-hidden="true">∿</span>
          <span>{dictionary.brand}</span>
        </Link>
        <button className="app-menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Menu" aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`app-nav-panel ${open ? "open" : ""}`} aria-label="Main navigation">
          <div className="app-nav-links">
            <Link href="/" className={linkClass("/")} onClick={closeMenu}>{dictionary.home}</Link>
            <Link href="/dashboard" className={linkClass("/dashboard")} onClick={closeMenu}>{dictionary.dashboard}</Link>
            <a href={PORTFOLIO_URL} className="app-nav-link" onClick={closeMenu}>{dictionary.portfolio}</a>
          </div>
          <div className="app-nav-actions">
            <LanguageSwitcher locale={locale} />
            <ThemeToggle locale={locale} />
            {userEmail ? (
              <>
                <span className="app-user"><User size={15} />{userEmail}</span>
                <button type="button" className="app-secondary-button" onClick={handleLogout}><LogOut size={15} />{dictionary.logout}</button>
              </>
            ) : (
              <>
                <Link href="/login" className="app-secondary-button" onClick={closeMenu}>{dictionary.login}</Link>
                <Link href="/register" className="app-primary-button" onClick={closeMenu}>{dictionary.register}</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
