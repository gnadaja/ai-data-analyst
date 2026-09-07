"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/app/providers";

export function DeleteDatasetButton({ datasetId, filePath, compact = false }: { datasetId: string; filePath: string; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { dictionary } = useLanguage();

  async function handleDelete() {
    if (!window.confirm(dictionary.deleteConfirm)) return;

    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from("ai-datasets").remove([filePath]);
    if (storageError) {
      setError(dictionary.deleteFileError);
      setLoading(false);
      return;
    }

    const { error: datasetError } = await supabase.from("ai_datasets").delete().eq("id", datasetId);
    if (datasetError) {
      setError(dictionary.deleteRecordError);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={handleDelete} disabled={loading} aria-label={dictionary.deleteLabel} className={compact ? "rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-strong)] transition hover:bg-[var(--primary-soft)] disabled:opacity-60" : "rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--primary-strong)] transition hover:bg-[var(--primary-soft)] disabled:opacity-60"}>
        {loading ? dictionary.deleting : dictionary.delete}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-[#a3453a]">{error}</p>}
    </div>
  );
}
