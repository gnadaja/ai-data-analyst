"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PORTFOLIO_URL } from "@/lib/portfolio";
import { useLanguage } from "@/app/providers";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { dictionary } = useLanguage();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    else router.push("/dashboard");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-12 text-[var(--foreground)]">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl shadow-black/10">
        <div className="flex items-center justify-between gap-4"><a href={PORTFOLIO_URL} className="text-sm font-semibold text-[var(--text-soft)] transition-colors hover:text-[var(--primary-strong)]">← Volver</a><Link href="/" className="text-sm font-bold tracking-[0.16em] text-[var(--foreground)]">AI DATA ANALYST</Link></div>
        <h1 className="mt-12 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{dictionary.loginTitle}</h1>
        <p className="mt-3 text-[var(--text-soft)]">{dictionary.loginDescription}</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-[var(--foreground)]">{dictionary.email}<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 font-normal text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]" /></label>
          <label className="block text-sm font-semibold text-[var(--foreground)]">{dictionary.password}<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 font-normal text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]" /></label>
          {error && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-[var(--error)]">{error}</p>}
          <button disabled={loading} className="w-full rounded-full bg-[var(--primary)] px-5 py-3.5 font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-wait disabled:opacity-60">{loading ? dictionary.loginLoading : dictionary.loginSubmit}</button>
        </form>
        <p className="mt-7 text-center text-sm text-[var(--text-soft)]">{dictionary.noAccount} <Link className="font-semibold text-[var(--primary-strong)]" href="/register">{dictionary.registerLink}</Link></p>
      </div>
    </main>
  );
}
