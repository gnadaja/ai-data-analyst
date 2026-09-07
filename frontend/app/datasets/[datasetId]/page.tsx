import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalyzeDatasetButton } from "@/components/analysis/AnalyzeDatasetButton";
import { MetaAdsReport } from "@/components/analysis/MetaAdsReport";
import { DataQualityCard } from "@/components/analysis/DataQualityCard";
import { DeleteDatasetButton } from "@/components/datasets/DeleteDatasetButton";
import { DatasetChat } from "@/components/analysis/DatasetChat";
import { getServerDictionary } from "@/lib/i18n/server";

type DatasetPageProps = {
  params: Promise<{ datasetId: string }>;
};

type MetaAdsReportData = {
  title: string;
  subtitle: string;
  kpis: { key: string; label: string; value: number; format: "currency" | "number" | "decimal" }[];
  insights: string[];
  warnings: string[];
  comparisons: { best: { name: string; roas: number } | null; worst: { name: string; roas: number } | null };
  quality: { level: "good" | "review" | "incomplete"; label: string; message: string };
  recommendations: string[];
};

export default async function DatasetPage({ params }: DatasetPageProps) {
  const { datasetId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/datasets/${datasetId}`);

  const { data: dataset, error: datasetError } = await supabase
    .from("ai_datasets")
    .select("id, name, file_path, file_size, status, row_count, column_count, duplicate_rows, analysis_summary, created_at")
    .eq("id", datasetId)
    .maybeSingle();

  if (datasetError || !dataset) notFound();

  const report = (dataset.analysis_summary?.report ?? null) as MetaAdsReportData | null;
  const dictionary = await getServerDictionary();

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--foreground)] lg:px-10">
      <section className="mx-auto max-w-6xl py-16"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary-strong)]">{dictionary.analyzedDataset}</p><h1 className="mt-3 break-words text-4xl font-semibold tracking-[-0.04em]">{dataset.name}</h1><p className="mt-3 text-sm text-[var(--text-soft)]">{dictionary.status} <span className="font-semibold text-[var(--success)]">{dataset.status}</span></p></div><div className="flex flex-wrap items-center gap-3"><AnalyzeDatasetButton datasetId={datasetId} /><DeleteDatasetButton datasetId={datasetId} filePath={dataset.file_path} /><Link href="/dashboard" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface)]">← {dictionary.allDatasets}</Link></div></div>
        <DataQualityCard quality={report?.quality ?? null} labels={{ quality: dictionary.quality }} /><MetaAdsReport report={report} labels={dictionary} />
        {report && dataset.status === "ready" && <DatasetChat datasetId={datasetId} />}
      </section>
    </main>
  );
}

