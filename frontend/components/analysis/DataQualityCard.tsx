type Quality = {
  level: "good" | "review" | "incomplete";
  label: string;
  message: string;
};

const styles = {
  good: { dot: "bg-[#3b9a72]", surface: "border-[#b9dcca] bg-[#f1fbf4]", text: "text-[#27634f]" },
  review: { dot: "bg-[#d89f3d]", surface: "border-[#ead4a6] bg-[#fffaf0]", text: "text-[#87601b]" },
  incomplete: { dot: "bg-[#c95f51]", surface: "border-[#efb8ad] bg-[#fff3f0]", text: "text-[#a3453a]" },
};

export function DataQualityCard({ quality }: { quality: Quality | null }) {
  if (!quality) return null;
  const style = styles[quality.level];

  return (
    <section className={`mt-8 rounded-2xl border p-5 ${style.surface}`}>
      <div className="flex items-start gap-3"><span className={`mt-1.5 size-3 shrink-0 rounded-full ${style.dot}`} /><div><p className={`text-xs font-bold uppercase tracking-[0.16em] ${style.text}`}>Calidad de datos · {quality.label}</p><p className="mt-2 text-sm leading-6 text-[#4b6665]">{quality.message}</p></div></div>
    </section>
  );
}
