"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OrcamentoForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/leads/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Não foi possível subir a foto.");
        return;
      }
      setPhotoUrl(data.url);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim() || null,
      phone: String(fd.get("phone") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      subject: "Orçamento com foto",
      message: String(fd.get("message") ?? "").trim() || null,
      photoUrl,
      source: "orcamento_foto",
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Não foi possível enviar agora.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-brand">
          ✓
        </div>
        <h3 className="font-display text-lg font-semibold">Recebemos seu pedido!</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Nossa equipe técnica avalia a foto e retorna em até 1 dia útil com o orçamento.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">Nome do responsável *</label>
        <Input name="name" required placeholder="Ex: Dra. Camila Rezende" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-fg-muted">Telefone / WhatsApp *</label>
          <Input name="phone" required placeholder="(24) 99999-0000" inputMode="tel" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-fg-muted">Cidade *</label>
          <Input name="city" required placeholder="Volta Redonda" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">E-mail</label>
        <Input name="email" type="email" placeholder="voce@clinica.com.br" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">Descreva o problema *</label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Ex: compressor fazendo ruído alto e perdendo pressão desde ontem."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">Foto do equipamento/problema</label>
        {photoUrl ? (
          <div className="mb-2 overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="Foto enviada" className="h-40 w-full object-cover" />
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-border bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/20 disabled:opacity-60"
        >
          {uploading ? "Enviando..." : photoUrl ? "Trocar foto" : "+ Adicionar foto"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={loading || uploading}>
        {loading ? "Enviando…" : "Enviar pedido de orçamento"}
      </Button>
      <p className="text-[11px] leading-relaxed text-fg-muted">
        Ao enviar, você concorda com nossa{" "}
        <a href="/privacidade" className="text-brand underline">
          Política de Privacidade
        </a>{" "}
        e{" "}
        <a href="/termos" className="text-brand underline">
          Termos de Uso
        </a>
        .
      </p>
    </form>
  );
}

export default OrcamentoForm;
