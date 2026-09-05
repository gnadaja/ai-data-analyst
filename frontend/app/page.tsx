import Link from "next/link";
import { PORTFOLIO_URL } from "@/lib/portfolio";

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_80%_15%,_#ffd6c7_0,_transparent_32%),linear-gradient(135deg,_#fffaf2_0%,_#f4f8f3_58%,_#e7f0ed_100%)]" />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-5">
          <a href={PORTFOLIO_URL} className="text-sm font-semibold text-[#31575a] transition-colors hover:text-[#d85f4d]">← Volver al portfolio</a>
          <Link href="/" className="flex items-center gap-3 text-sm font-bold tracking-[0.18em] text-[#123d42]">
          <span className="grid size-9 place-items-center rounded-xl bg-[#123d42] text-lg text-[#ffd6c7]">∿</span>
          AI DATA ANALYST
          </Link>
        </div>
        <div className="flex items-center gap-5 text-sm font-semibold text-[#31575a]">
          <a className="hidden transition-colors hover:text-[#d85f4d] sm:block" href="#como-funciona">Cómo funciona</a>
          <Link className="rounded-full bg-[#123d42] px-4 py-2.5 text-white transition-transform hover:-translate-y-0.5" href="/login">Iniciar sesión</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-14 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-32 lg:pt-24">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f2a38f] bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#b74e3e]">
            <span className="size-2 rounded-full bg-[#e36e58]" /> Análisis sin fricción
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[#123d42] sm:text-7xl">
            Tus datos tienen algo que decirte.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#4b6665] sm:text-xl">
            Sube un CSV o Excel, explora los patrones importantes y pregunta a tus datos en lenguaje natural. Sin fórmulas escondidas ni código generado a ciegas.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-13 items-center justify-center rounded-full bg-[#d85f4d] px-6 font-semibold text-white shadow-[0_12px_30px_-12px_#d85f4d] transition-transform hover:-translate-y-0.5" href="/register">
              Analizar mi primer dataset <span className="ml-3 text-xl">→</span>
            </Link>
            <a className="inline-flex h-13 items-center justify-center rounded-full border border-[#9ab3ad] bg-white/50 px-6 font-semibold text-[#123d42] transition-colors hover:bg-white" href="#como-funciona">
              Ver cómo funciona
            </a>
          </div>
          <p className="mt-5 text-xs font-medium text-[#6d8580]">Tus datasets son privados por defecto · Límite gratuito para empezar</p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mr-0">
          <div className="absolute -inset-5 -z-10 rotate-3 rounded-[2rem] bg-[#f5b7a5]/50" />
          <div className="overflow-hidden rounded-[1.5rem] border border-white/80 bg-[#123d42] p-4 shadow-2xl shadow-[#123d42]/20">
            <div className="flex items-center justify-between border-b border-white/15 px-2 pb-4 text-xs text-[#b9d1c9]"><span>ventas_2025.xlsx</span><span className="rounded-full bg-[#2d6565] px-2.5 py-1 text-[#d8eee4]">Listo</span></div>
            <div className="grid grid-cols-2 gap-3 py-4"><Metric label="Ingresos" value="$284.6K" change="+18.4%" /><Metric label="Pedidos" value="1,842" change="+12.8%" /></div>
            <div className="rounded-xl bg-[#edf5ed] p-4"><div className="flex items-center justify-between text-xs font-semibold text-[#31575a]"><span>Ingresos por mes</span><span className="text-[#d85f4d]">2025</span></div><div className="mt-5 flex h-28 items-end gap-2">{[38, 52, 45, 67, 60, 78, 70, 92, 84, 100].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-[#d85f4d]" style={{ height: `${height}%`, opacity: 0.45 + index * 0.05 }} />)}</div></div>
            <div className="mt-3 rounded-xl border border-[#4a7a76] bg-[#1a4c50] p-4 text-sm leading-6 text-[#d8eee4]"><span className="mr-2 text-[#f5b7a5]">✦</span>Los ingresos crecen un 22% en el último trimestre, impulsados por clientes recurrentes.</div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-20 lg:px-8"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d85f4d]">De archivo a insight</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#123d42] sm:text-4xl">Menos tiempo preparando datos. Más tiempo entendiendo el negocio.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3"><Step number="01" title="Sube tu dataset" text="Carga un archivo CSV o Excel. Detectamos tipos, columnas, faltantes y duplicados automáticamente." /><Step number="02" title="Explora lo importante" text="Obtén KPIs, estadísticas y visualizaciones adaptadas a la forma real de tus datos." /><Step number="03" title="Haz preguntas" text="Pregunta en lenguaje natural. La IA elige herramientas analíticas controladas para responderte." /></div></section>
      <footer className="border-t border-[#d9e3dc] px-6 py-8 text-center text-sm text-[#6d8580]">AI Data Analyst · Análisis claro para decisiones mejores</footer>
    </main>
  );
}

function Metric({ label, value, change }: { label: string; value: string; change: string }) {
  return <div className="rounded-xl bg-[#1a4c50] p-3"><p className="text-xs text-[#b9d1c9]">{label}</p><p className="mt-1 text-xl font-semibold text-white">{value}</p><p className="mt-1 text-xs font-medium text-[#f5b7a5]">{change}</p></div>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return <article className="border-t-2 border-[#d85f4d] pt-5"><p className="text-xs font-bold tracking-[0.16em] text-[#d85f4d]">{number}</p><h3 className="mt-4 text-xl font-semibold text-[#123d42]">{title}</h3><p className="mt-3 leading-7 text-[#5d7471]">{text}</p></article>;
}
