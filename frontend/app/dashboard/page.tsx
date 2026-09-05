import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PORTFOLIO_URL } from "@/lib/portfolio";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  return (
    <main className="min-h-screen bg-[#f4f8f3] px-6 py-8 text-[#123d42] lg:px-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4"><div className="flex items-center gap-5"><a href={PORTFOLIO_URL} className="text-sm font-semibold text-[#31575a] transition-colors hover:text-[#d85f4d]">← Volver al portfolio</a><Link href="/" className="text-sm font-bold tracking-[0.16em]">AI DATA ANALYST</Link></div><span className="text-sm text-[#5d7471]">{user.email}</span></header>
      <section className="mx-auto max-w-6xl py-20"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d85f4d]">Tu espacio de análisis</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Tu dashboard está listo.</h1><p className="mt-4 max-w-xl text-lg leading-8 text-[#5d7471]">Aquí aparecerán tus datasets, KPIs y conversaciones. El siguiente paso será conectar la subida de archivos y el análisis con Pandas.</p><div className="mt-10 rounded-2xl border border-dashed border-[#9ab3ad] bg-white/60 p-10 text-center"><p className="font-semibold">Todavía no tienes datasets</p><p className="mt-2 text-sm text-[#5d7471]">La carga CSV/XLSX se implementará en la siguiente fase.</p></div></section>
    </main>
  );
}
