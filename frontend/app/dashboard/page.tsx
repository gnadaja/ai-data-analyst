import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PORTFOLIO_URL } from "@/lib/portfolio";
import { UploadDataset } from "@/components/datasets/UploadDataset";
import { DeleteDatasetButton } from "@/components/datasets/DeleteDatasetButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const { data: datasets, error } = await supabase
    .from("ai_datasets")
    .select("id, name, file_path, file_size, row_count, column_count, duplicate_rows, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f4f8f3] px-6 py-8 text-[#123d42] lg:px-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4"><div className="flex items-center gap-5"><a href={PORTFOLIO_URL} className="text-sm font-semibold text-[#31575a] transition-colors hover:text-[#d85f4d]">← Volver al portfolio</a><Link href="/" className="text-sm font-bold tracking-[0.16em]">AI DATA ANALYST</Link></div><span className="text-sm text-[#5d7471]">{user.email}</span></header>
      <section className="mx-auto max-w-6xl py-20"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d85f4d]">Tu espacio de análisis</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Tu dashboard está listo.</h1><p className="mt-4 max-w-xl text-lg leading-8 text-[#5d7471]">Sube un archivo y prepararemos su perfil de datos.</p><div className="mt-10"><UploadDataset /></div>{error ? <p role="alert" className="mt-4 rounded-xl bg-[#fff0eb] px-4 py-3 text-sm text-[#b74e3e]">No se pudieron cargar tus datasets. Ejecuta la migración de Supabase para activar esta sección.</p> : datasets.length === 0 ? <p className="mt-8 text-center text-sm text-[#5d7471]">Todavía no tienes datasets.</p> : <div className="mt-8 grid gap-4 sm:grid-cols-2">{datasets.map((dataset) => <article key={dataset.id} className="rounded-2xl border border-[#d9e3dc] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#d85f4d]"><Link href={`/datasets/${dataset.id}`}><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-[#123d42]">{dataset.name}</h2><p className="mt-2 text-sm text-[#5d7471]">{formatBytes(dataset.file_size)}{dataset.row_count !== null && ` · ${dataset.row_count} filas`}</p></div><span className="rounded-full bg-[#eef8ef] px-3 py-1 text-xs font-semibold text-[#27634f]">{dataset.status}</span></div></Link><div className="mt-4 border-t border-[#eef2ed] pt-3 text-right"><DeleteDatasetButton datasetId={dataset.id} filePath={dataset.file_path} compact /></div></article>)}</div>}</section>
    </main>
  );
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
