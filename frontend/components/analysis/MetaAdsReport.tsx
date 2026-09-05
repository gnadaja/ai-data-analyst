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
};

export function MetaAdsReport({ report }: { report: MetaAdsReportData | null }) {
  if (!report) return null;

  return (
    <section className="mt-8 rounded-3xl border border-[#c9ddd4] bg-[#123d42] p-6 text-[#eef8ef] shadow-xl shadow-[#123d42]/10 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f5b7a5]">Informe ejecutivo</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{report.title}</h2>
      <p className="mt-2 text-sm text-[#b9d1c9]">{report.subtitle}</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{report.kpis.map((kpi) => <div key={kpi.key} className="rounded-2xl bg-[#1a4c50] p-4"><p className="text-xs text-[#b9d1c9]">{kpi.label}</p><p className="mt-2 text-xl font-semibold">{formatKpi(kpi)}</p>{kpi.explanation && <p className="mt-2 text-xs leading-5 text-[#d8eee4]">{kpi.explanation}</p>}</div>)}</div>
      {(report.comparisons.best || report.comparisons.worst) && <div className="mt-7 grid gap-3 sm:grid-cols-2">{report.comparisons.best && <div className="rounded-2xl border border-[#5c9181] bg-[#28635f] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b9ead0]">Mejor rendimiento</p><p className="mt-2 font-semibold">{report.comparisons.best.name}</p><p className="mt-1 text-sm text-[#d8eee4]">ROAS {report.comparisons.best.roas.toLocaleString("es-AR", { maximumFractionDigits: 2 })}</p></div>}{report.comparisons.worst && <div className="rounded-2xl border border-[#9c665e] bg-[#583d3b] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ffd6c7]">Para revisar</p><p className="mt-2 font-semibold">{report.comparisons.worst.name}</p><p className="mt-1 text-sm text-[#f8dfd7]">ROAS {report.comparisons.worst.roas.toLocaleString("es-AR", { maximumFractionDigits: 2 })}</p></div>}</div>}
      {report.insights.length > 0 && <div className="mt-8"><h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#f5b7a5]">Lecturas principales</h3><ul className="mt-3 space-y-3">{report.insights.map((insight) => <li key={insight} className="flex gap-3 text-sm leading-6 text-[#eef8ef]"><span className="text-[#f5b7a5]">✦</span>{insight}</li>)}</ul></div>}
      {report.warnings.length > 0 && <div className="mt-7 rounded-2xl border border-[#d88b78]/60 bg-[#6a3f3b]/40 p-4"><h3 className="text-sm font-semibold text-[#ffd6c7]">Puntos para revisar</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[#f8dfd7]">{report.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></div>}
    </section>
  );
}

function formatKpi(kpi: ReportKpi) {
  if (kpi.format === "currency") return `ARS ${kpi.value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
  if (kpi.format === "decimal") return kpi.value.toLocaleString("es-AR", { maximumFractionDigits: 2 });
  return kpi.value.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}
