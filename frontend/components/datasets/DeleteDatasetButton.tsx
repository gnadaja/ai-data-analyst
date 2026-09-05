"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteDatasetButton({ datasetId, filePath, compact = false }: { datasetId: string; filePath: string; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm("¿Seguro que quieres borrar este dataset y su archivo? Esta acción no se puede deshacer.")) return;

    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from("ai-datasets").remove([filePath]);
    if (storageError) {
      setError("No se pudo borrar el archivo privado.");
      setLoading(false);
      return;
    }

    const { error: datasetError } = await supabase.from("ai_datasets").delete().eq("id", datasetId);
    if (datasetError) {
      setError("El archivo se borró, pero no se pudo borrar su registro.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={handleDelete} disabled={loading} aria-label="Borrar dataset" className={compact ? "rounded-full border border-[#efb8ad] px-3 py-1.5 text-xs font-semibold text-[#a3453a] transition hover:bg-[#fff3f0] disabled:opacity-60" : "rounded-full border border-[#efb8ad] px-4 py-2 text-sm font-semibold text-[#a3453a] transition hover:bg-[#fff3f0] disabled:opacity-60"}>
        {loading ? "Borrando..." : "Borrar"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-[#a3453a]">{error}</p>}
    </div>
  );
}
