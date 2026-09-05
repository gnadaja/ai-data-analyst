import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PORTFOLIO_URL } from "@/lib/portfolio";
import { MissingValuesChart } from "@/components/analysis/MissingValuesChart";

type DatasetPageProps = {
  params: Promise<{ datasetId: string }>;
};

export default async function DatasetPage({ params }: DatasetPageProps) {
  const { datasetId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/datasets/${datasetId}`);

  const { data: dataset, error: datasetError } = await supabase
    .from("ai_datasets")
    .select("id, name, file_size, status, row_count, column_count, duplicate_rows, created_at")
    .eq("id", datasetId)
    .maybeSingle();

  if (datasetError || !dataset) notFound();

  const { data: columns, error: columnsError } = await supabase
    .from("ai_dataset_columns")
    .select("name, data_type, position, missing_count")
    .eq("dataset_id", datasetId)
    .order("position", { ascending: true });

  if (columnsError) {
    return <ErrorState message="No pudimos cargar las columnas de este dataset." />;
  }

  const totalMissing = columns.reduce((total, column) => total + column.missing_count, 0);
  const chartData = columns.map((column) => ({ name: column.name, missing_count: column.missing_count }));

  return (
    <main className="min-h-screen bg-[#f4f8f3] px-6 py-8 text-[#123d42] lg:px-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4"><div className="flex items-center gap-5"><a href={PORTFOLIO_URL} className="text-sm font-semibold text-[#31575a] transition-colors hover:text-[#d85f4d]">← Volver al portfolio</a><Link href="/dashboard" className="text-sm font-semibold text-[#d85f4d]">← Dashboard</Link></div><span className="text-sm text-[#5d7471]">AI DATA ANALYST</span></header>
      <section className="mx-auto max-w-6xl py-16"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d85f4d]">Dataset analizado</p><h1 className="mt-3 break-words text-4xl font-semibold tracking-[-0.04em]">{dataset.name}</h1><p className="mt-3 text-sm text-[#5d7471]">Estado: <span className="font-semibold text-[#27634f]">{dataset.status}</span></p></div><Link href="/dashboard" className="rounded-full border border-[#9ab3ad] px-4 py-2 text-sm font-semibold text-[#31575a] transition hover:bg-white">← Todos los datasets</Link></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Filas" value={dataset.row_count ?? "-"} /><Metric label="Columnas" value={dataset.column_count ?? "-"} /><Metric label="Faltantes" value={totalMissing} /><Metric label="Duplicados" value={dataset.duplicate_rows ?? 0} /></div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><section className="rounded-2xl border border-[#d9e3dc] bg-white p-6"><h2 className="text-lg font-semibold">Valores faltantes por columna</h2><p className="mt-2 text-sm text-[#5d7471]">Una primera lectura de la calidad del dataset.</p><div className="mt-6"><MissingValuesChart data={chartData} /></div></section><section className="rounded-2xl border border-[#d9e3dc] bg-white p-6"><h2 className="text-lg font-semibold">Estructura</h2><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-[#d9e3dc] text-[#6d8580]"><tr><th className="pb-3 pr-4 font-medium">Columna</th><th className="pb-3 pr-4 font-medium">Tipo</th><th className="pb-3 text-right font-medium">Faltantes</th></tr></thead><tbody>{columns.map((column) => <tr key={column.name} className="border-b border-[#eef2ed] last:border-0"><td className="py-3 pr-4 font-medium">{column.name}</td><td className="py-3 pr-4 text-[#5d7471]">{column.data_type}</td><td className="py-3 text-right text-[#5d7471]">{column.missing_count}</td></tr>)}</tbody></table></div></section></div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-2xl border border-[#d9e3dc] bg-white p-5"><p className="text-sm text-[#6d8580]">{label}</p><p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{value}</p></div>;
}

function ErrorState({ message }: { message: string }) {
  return <main className="grid min-h-screen place-items-center bg-[#f4f8f3] px-6"><div className="rounded-2xl border border-[#f2b3a3] bg-white p-8 text-center"><p className="font-semibold text-[#b74e3e]">{message}</p><Link href="/dashboard" className="mt-5 inline-block font-semibold text-[#d85f4d]">← Volver al dashboard</Link></div></main>;
}
