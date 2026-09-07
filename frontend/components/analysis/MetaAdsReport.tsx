type ReportKpi = {
  key: string;
  label: string;
  value: number;
  format: "currency" | "number" | "decimal";
  explanation?: string | null;
};

type MetaAdsReportData = {
  title: string;
  subtitle: string;
  kpis: ReportKpi[];
  insights: string[];
  warnings: string[];
  comparisons: {
    best: { name: string; roas: number } | null;
    worst: { name: string; roas: number } | null;
  };
  recommendations: string[];
};

type ReportLabels = {
  smartReport: string;
  bestPerformance: string;
  toReview: string;
  mainInsights: string;
  pointsToReview: string;
  nextSteps: string;
};

export function MetaAdsReport({ report, labels }: { report: MetaAdsReportData | null; labels: ReportLabels }) {
  if (!report) return null;

  return (
    <section className="mt-8 rounded-3xl border border-[#c9ddd4] bg-[#123d42] p-6 text-[#eef8ef] shadow-xl shadow-[#123d42]/10 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary-soft)]">{labels.smartReport}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{report.title}</h2>
      <p className="mt-2 text-sm text-[#b9d1c9]">{report.subtitle}</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{report.kpis.map((kpi) => <div key={kpi.key} className="rounded-2xl bg-[#1a4c50] p-4"><p className="text-xs text-[#b9d1c9]">{kpi.label}</p><p className="mt-2 text-xl font-semibold">{formatKpi(kpi)}</p>{kpi.explanation && <p className="mt-2 text-xs leading-5 text-[#d8eee4]">{kpi.explanation}</p>}</div>)}</div>
      {(report.comparisons.best || report.comparisons.worst) && <div className="mt-7 grid gap-3 sm:grid-cols-2">{report.comparisons.best && <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">{labels.bestPerformance}</p><p className="mt-2 font-semibold">{report.comparisons.best.name}</p><p className="mt-1 text-sm text-white/80">ROAS {report.comparisons.best.roas.toLocaleString("es-AR", { maximumFractionDigits: 2 })}</p></div>}{report.comparisons.worst && <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary-soft)]">{labels.toReview}</p><p className="mt-2 font-semibold">{report.comparisons.worst.name}</p><p className="mt-1 text-sm text-[var(--text-soft)]">ROAS {report.comparisons.worst.roas.toLocaleString("es-AR", { maximumFractionDigits: 2 })}</p></div>}</div>}
      {report.insights.length > 0 && <div className="mt-8"><h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--primary-soft)]">{labels.mainInsights}</h3><ul className="mt-3 space-y-3">{report.insights.map((insight) => <li key={insight} className="flex gap-3 text-sm leading-6 text-white/90"><span className="text-[var(--primary-soft)]">✦</span>{insight}</li>)}</ul></div>}
      {report.warnings.length > 0 && <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><h3 className="text-sm font-semibold text-[var(--primary-soft)]">{labels.pointsToReview}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-soft)]">{report.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></div>}
      {report.recommendations.length > 0 && <div className="mt-7 border-t border-white/15 pt-6"><h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--primary-soft)]">{labels.nextSteps}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-white/80">{report.recommendations.map((recommendation) => <li key={recommendation}>→ {recommendation}</li>)}</ul></div>}
    </section>
  );
}

function formatKpi(kpi: ReportKpi) {
  if (kpi.format === "currency") return `ARS ${kpi.value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
  if (kpi.format === "decimal") return kpi.value.toLocaleString("es-AR", { maximumFractionDigits: 2 });
  return kpi.value.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}
