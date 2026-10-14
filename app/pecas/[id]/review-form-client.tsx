"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";

export function ReviewFormClient({ partId }: { partId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/pecas/${partId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, rating, comment: comment || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Não foi possível enviar a avaliação.");
        setSubmitting(false);
        return;
      }
      setSent(true);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Erro inesperado ao enviar.");
      setSubmitting(false);
    }
  }

  if (sent) {
    return <p className="text-sm text-emerald-500">Avaliação enviada. Obrigado!</p>;
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Deixar avaliação
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div>
        <p className="mb-1 text-xs text-fg-muted">Sua nota</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} estrela(s)`}
              className="p-0.5"
            >
              <Star
                className={`h-6 w-6 ${n <= rating ? "fill-accent text-accent" : "text-fg-muted"}`}
              />
            </button>
          ))}
        </div>
      </div>
      <Input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Seu nome"
        maxLength={120}
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Como foi usar este produto? (opcional)"
        className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={submitting || !authorName.trim()}>
          {submitting ? "Enviando..." : "Enviar avaliação"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
