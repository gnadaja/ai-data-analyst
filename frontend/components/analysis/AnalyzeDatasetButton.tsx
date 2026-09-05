"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AnalyzeDatasetButton({ datasetId }: { datasetId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/datasets/${datasetId}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.detail ?? `El análisis falló (HTTP ${response.status}).`);
      } else {
        router.refresh();
      }
    } catch {
      setError("No se pudo conectar con el backend de análisis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleAnalyze} disabled={loading} className="rounded-full bg-[#d85f4d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b74e3e] disabled:cursor-wait disabled:opacity-60">
        {loading ? "Analizando..." : "Reanalizar dataset"}
      </button>
      {error && <p role="alert" className="mt-3 max-w-md text-sm text-[#b74e3e]">{error}</p>}
    </div>
  );
}
