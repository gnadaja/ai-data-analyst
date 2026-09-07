import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AppNavbar } from "@/components/navigation/AppNavbar";
import { Providers } from "@/app/providers";
import { getLocale, THEME_COOKIE } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Data Analyst | Entiende tus datos",
  description: "Analiza datasets CSV y Excel con visualizaciones e insights en lenguaje natural.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const theme = (await cookies()).get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers initialTheme={theme} initialLocale={locale}>
          <AppNavbar locale={locale} userEmail={user?.email ?? null} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
