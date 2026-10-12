"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const KIND_LABEL: Record<string, string> = {
  antes: "Antes",
  depois: "Depois",
  laudo: "Laudo/documento",
  outro: "Outro",
};

export function PhotosUploadClient({ serviceOrderId }: { serviceOrderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [kind, setKind] = useState("antes");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: formData });
      const upData = await up.json().catch(() => ({}));
      if (!up.ok || !upData.url) {
        setError(upData.error || "Não foi possível subir o arquivo.");
        return;
      }
      const link = await fetch(`/api/service-orders/${serviceOrderId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: upData.url, kind }),
      });
      if (!link.ok) {
        const linkData = await link.json().catch(() => ({}));
        setError(linkData.error || "Arquivo enviado, mas não foi possível vincular à OS.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Falha inesperada ao enviar a foto.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value)}
        disabled={uploading || pending}
        className="rounded-md border border-border bg-bg/40 px-2 py-1.5 text-sm text-fg"
      >
        {Object.entries(KIND_LABEL).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || pending}
        className="rounded-md border border-border bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/20 disabled:opacity-60"
      >
        {uploading ? "Enviando..." : "Adicionar foto"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </div>
  );
}
