"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PORTFOLIO_URL } from "@/lib/portfolio";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: signUpError } = await createClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (signUpError) setError(signUpError.message);
    else if (data.session) router.push("/dashboard");
    else setMessage("Revisa tu email para confirmar la cuenta.");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf2] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#d9e3dc] bg-white p-8 shadow-xl shadow-[#123d42]/5">
        <div className="flex items-center justify-between gap-4"><a href={PORTFOLIO_URL} className="text-sm font-semibold text-[#31575a] transition-colors hover:text-[#d85f4d]">← Volver</a><Link href="/" className="text-sm font-bold tracking-[0.16em] text-[#123d42]">AI DATA ANALYST</Link></div>
        <h1 className="mt-12 text-3xl font-semibold tracking-[-0.03em] text-[#123d42]">Empieza a entender tus datos</h1>
        <p className="mt-3 text-[#5d7471]">Crea tu cuenta y prepara tu primer análisis.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-[#31575a]">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#b9cec6] bg-[#fbfdf9] px-4 py-3 font-normal outline-none transition focus:border-[#d85f4d]" /></label>
          <label className="block text-sm font-semibold text-[#31575a]">Contraseña<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#b9cec6] bg-[#fbfdf9] px-4 py-3 font-normal outline-none transition focus:border-[#d85f4d]" /></label>
          {error && <p role="alert" className="rounded-xl bg-[#fff0eb] px-4 py-3 text-sm text-[#b74e3e]">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-[#eef8ef] px-4 py-3 text-sm text-[#27634f]">{message}</p>}
          <button disabled={loading} className="w-full rounded-full bg-[#d85f4d] px-5 py-3.5 font-semibold text-white transition hover:bg-[#b74e3e] disabled:cursor-wait disabled:opacity-60">{loading ? "Creando cuenta..." : "Crear cuenta"}</button>
        </form>
        <p className="mt-7 text-center text-sm text-[#5d7471]">¿Ya tienes cuenta? <Link className="font-semibold text-[#d85f4d]" href="/login">Inicia sesión</Link></p>
      </div>
    </main>
  );
}
