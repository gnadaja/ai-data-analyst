import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PORTFOLIO_URL } from "@/lib/portfolio";
import { AnalyzeDatasetButton } from "@/components/analysis/AnalyzeDatasetButton";
import { MetaAdsReport } from "@/components/analysis/MetaAdsReport";
import { DataQualityCard } from "@/components/analysis/DataQualityCard";

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
};

export default async function DatasetPage({ params }: DatasetPageProps) {
  const { datasetId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/datasets/${datasetId}`);

  const { data: dataset, error: datasetError } = await supabase
    .from("ai_datasets")
    .select("id, name, file_size, status, row_count, column_count, duplicate_rows, analysis_summary, created_at")
    .eq("id", datasetId)
    .maybeSingle();

  if (datasetError || !dataset) notFound();

  const report = (dataset.analysis_summary?.report ?? null) as MetaAdsReportData | null;

  return (
    <main className="min-h-screen bg-[#f4f8f3] px-6 py-8 text-[#123d42] lg:px-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4"><div className="flex items-center gap-5"><a href={PORTFOLIO_URL} className="text-sm font-semibold text-[#31575a] transition-colors hover:text-[#d85f4d]">← Volver al portfolio</a><Link href="/dashboard" className="text-sm font-semibold text-[#d85f4d]">← Dashboard</Link></div><span className="text-sm text-[#5d7471]">AI DATA ANALYST</span></header>
      <section className="mx-auto max-w-6xl py-16"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d85f4d]">Dataset analizado</p><h1 className="mt-3 break-words text-4xl font-semibold tracking-[-0.04em]">{dataset.name}</h1><p className="mt-3 text-sm text-[#5d7471]">Estado: <span className="font-semibold text-[#27634f]">{dataset.status}</span></p></div><div className="flex flex-wrap items-center gap-3"><AnalyzeDatasetButton datasetId={datasetId} /><Link href="/dashboard" className="rounded-full border border-[#9ab3ad] px-4 py-2 text-sm font-semibold text-[#31575a] transition hover:bg-white">← Todos los datasets</Link></div></div>
        <DataQualityCard quality={report?.quality ?? null} /><MetaAdsReport report={report} />
      </section>
    </main>
  );
}

