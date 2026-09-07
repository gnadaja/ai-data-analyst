import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UploadDataset } from "@/components/datasets/UploadDataset";
import { DeleteDatasetButton } from "@/components/datasets/DeleteDatasetButton";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const { data: datasets, error } = await supabase
    .from("ai_datasets")
    .select("id, name, file_path, file_size, row_count, column_count, duplicate_rows, status, created_at")
    .order("created_at", { ascending: false });
  const dictionary = await getServerDictionary();

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--foreground)] lg:px-10">
      <section className="mx-auto max-w-6xl py-20"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary-strong)]">{dictionary.dashboardEyebrow}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{dictionary.dashboardTitle}</h1><p className="mt-4 max-w-xl text-lg leading-8 text-[var(--text-soft)]">{dictionary.dashboardDescription}</p><div className="mt-10"><UploadDataset /></div>{error ? <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-[var(--error)]">{dictionary.dashboardLoadError}</p> : datasets.length === 0 ? <p className="mt-8 text-center text-sm text-[var(--text-soft)]">{dictionary.noDatasets}</p> : <div className="mt-8 grid gap-4 sm:grid-cols-2">{datasets.map((dataset) => <article key={dataset.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary)]"><Link href={`/datasets/${dataset.id}`}><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-[var(--foreground)]">{dataset.name}</h2><p className="mt-2 text-sm text-[var(--text-soft)]">{formatBytes(dataset.file_size, dictionary.rows)} </p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-[var(--success)]">{dataset.status}</span></div></Link><div className="mt-4 border-t border-[var(--border)] pt-3 text-right"><DeleteDatasetButton datasetId={dataset.id} filePath={dataset.file_path} compact /></div></article>)}</div>}</section>
    </main>
  );
}

function formatBytes(bytes: number, rowCountOrRows: number | string | null, rows?: string) {
  const rowCount = typeof rowCountOrRows === "number" ? rowCountOrRows : null;
  const rowLabel = typeof rowCountOrRows === "string" ? rowCountOrRows : rows ?? "rows";
  const formattedRows = rowCount === null ? "" : ` · ${rowCount} ${rowLabel}`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB${formattedRows}`;
}
