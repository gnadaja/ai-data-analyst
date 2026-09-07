"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/app/providers";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const suggestedQuestions = [
  "¿Cuál es la principal oportunidad que ves en este informe?",
  "¿Qué debería revisar primero?",
  "¿Qué conclusiones puedo sacar de los KPIs?",
];

export function DatasetChat({ datasetId }: { datasetId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { dictionary, locale } = useLanguage();

  async function sendMessage(content = message) {
    const trimmedMessage = content.trim();
    if (!trimmedMessage || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmedMessage }];
    setMessages(nextMessages);
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/datasets/${datasetId}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedMessage, history: messages.slice(-10), locale }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.detail ?? `${dictionary.chatError} (HTTP ${response.status}).`);
      }
      setMessages([...nextMessages, { role: "assistant", content: payload.answer }]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : dictionary.chatError);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-[#c9ddd4] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary-strong)]">Consulta al informe</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{dictionary.talkToAnalyst}</h2>
          <p className="mt-2 text-sm text-[var(--text-soft)]">{dictionary.chatDescription}</p>
        </div>
        <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary-strong)]">{dictionary.contextual}</span>
      </div>

      <div className="mt-6 space-y-3" aria-live="polite">
        {messages.length === 0 && (
          <div className="rounded-2xl bg-[#f4f8f3] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">{dictionary.startQuestion}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button key={question} type="button" onClick={() => void sendMessage(question)} className="rounded-full border border-[var(--border)] px-3 py-2 text-left text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary-strong)]">
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((item, index) => (
          <div key={`${item.role}-${index}`} className={`max-w-3xl rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "user" ? "ml-auto bg-[#123d42] text-white" : "bg-[#f4f8f3] text-[#31575a]"}`}>
            {item.content}
          </div>
        ))}
        {loading && <p className="text-sm text-[var(--text-soft)]">{dictionary.analyzingQuestion}</p>}
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="dataset-question" className="sr-only">{dictionary.questionLabel}</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea id="dataset-question" value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={handleKeyDown} maxLength={2000} rows={2} placeholder={dictionary.questionPlaceholder} className="min-h-20 flex-1 resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--primary)]" />
          <button type="submit" disabled={loading || !message.trim()} className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-50">{dictionary.send}</button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-[#b74e3e]">{error}</p>}
      </form>
    </section>
  );
}