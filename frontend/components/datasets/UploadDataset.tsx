"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["csv", "xls", "xlsx"];

export function UploadDataset() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setError("Selecciona un archivo CSV o Excel.");
      return;
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError("El archivo debe pesar entre 1 byte y 10 MB.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Tu sesión expiró. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }

    const datasetId = crypto.randomUUID();
    const filePath = `${user.id}/${datasetId}/${file.name}`;
    const { error: uploadError } = await supabase.storage.from("ai-datasets").upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("ai_datasets").insert({
      id: datasetId,
      user_id: user.id,
      name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type || "application/octet-stream",
      status: "uploaded",
    });

    if (insertError) {
      await supabase.storage.from("ai-datasets").remove([filePath]);
      setError(insertError.message);
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/datasets/${datasetId}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      });
      if (!response.ok) {
        setError("El archivo se subió, pero no pudimos analizarlo todavía.");
      }
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#9ab3ad] bg-white/70 p-8">
      <label className="flex cursor-pointer flex-col items-center text-center">
        <span className="text-lg font-semibold text-[#123d42]">{loading ? "Subiendo dataset..." : "Sube tu primer dataset"}</span>
        <span className="mt-2 text-sm text-[#5d7471]">CSV, XLS o XLSX · máximo 10 MB</span>
        <span className="mt-5 rounded-full bg-[#d85f4d] px-5 py-3 font-semibold text-white transition hover:bg-[#b74e3e]">Elegir archivo</span>
        <input className="sr-only" type="file" accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileChange} disabled={loading} />
      </label>
      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0eb] px-4 py-3 text-sm text-[#b74e3e]">{error}</p>}
    </div>
  );
}
