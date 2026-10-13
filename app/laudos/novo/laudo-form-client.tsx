"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TYPES = [
  { value: "tecnico", label: "Laudo técnico" },
  { value: "higienizacao_ac", label: "Higienização de AC" },
  { value: "pmoc", label: "PMOC" },
  { value: "biosseguranca", label: "Biossegurança" },
];

type Photo = { url: string; kind: string; caption: string | null };

export function LaudoFormClient({
  serviceOrderId,
  existingPhotos,
}: {
  serviceOrderId: string;
  existingPhotos: Photo[];
}) {
  const router = useRouter();
  const [type, setType] = useState("tecnico");
  const [title, setTitle] = useState("Laudo técnico de atendimento");
  const [diagnosis, setDiagnosis] = useState("");
  const [solution, setSolution] = useState("");
  const [observations, setObservations] = useState("");
  const [selected, setSelected] = useState<Record<number, boolean>>(
    Object.fromEntries(existingPhotos.map((_, i) => [i, true]))
  );
  const [extraPhotos, setExtraPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Não foi possível subir a foto.");
        return;
      }
      setExtraPhotos((prev) => [...prev, { url: data.url, kind: "laudo", caption: "Serviço concluído" }]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function submit() {
    if (!title.trim()) {
      setError("Informe um título para o laudo.");
      return;
    }
    setSaving(true);
    setError(null);
    const photos = [...existingPhotos.filter((_, i) => selected[i]), ...extraPhotos];
    const res = await fetch("/api/laudos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceOrderId, type, title, diagnosis, solution, observations, photos }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Não foi possível criar o laudo.");
      return;
    }
    router.push(`/laudos/${data.laudo.id}`);
  }

  return (
    <div className="space-y-5">
      {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium text-fg">Tipo de laudo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-fg">Título</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-fg">Diagnóstico</label>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-fg">Solução aplicada</label>
        <textarea
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-fg">Observações</label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-fg">Foto do serviço pronto</label>
        {existingPhotos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {existingPhotos.map((p, i) => (
              <label key={p.url} className="relative block cursor-pointer overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.caption ?? p.kind} className="h-20 w-full object-cover" />
                <input
                  type="checkbox"
                  checked={!!selected[i]}
                  onChange={() => setSelected((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="absolute right-1 top-1 h-4 w-4"
                />
              </label>
            ))}
          </div>
        )}
        {extraPhotos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {extraPhotos.map((p) => (
              <div key={p.url} className="overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-20 w-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-border bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/20 disabled:opacity-60"
        >
          {uploading ? "Enviando..." : "+ Adicionar foto do serviço pronto"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <Button onClick={submit} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Salvando..." : "Criar laudo"}
      </Button>
    </div>
  );
}
