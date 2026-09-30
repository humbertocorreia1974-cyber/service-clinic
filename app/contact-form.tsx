"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      subject: String(fd.get("subject") ?? "").trim() || null,
      message: String(fd.get("message") ?? "").trim() || null,
      source: "site_home",
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
        <h3 className="font-display text-lg font-semibold">
          Recebemos seu pedido!
        </h3>
        <p className="mt-2 text-sm text-fg-muted">
          Nossa equipe entra em contato em até 1 dia útil. Se preferir, chame no
          WhatsApp comercial.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">
          Nome do responsável *
        </label>
        <Input name="name" required placeholder="Ex: Dra. Camila Rezende" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-fg-muted">
            Telefone / WhatsApp *
          </label>
          <Input
            name="phone"
            required
            placeholder="(24) 99999-0000"
            inputMode="tel"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-fg-muted">
            Cidade *
          </label>
          <Input name="city" required placeholder="Volta Redonda" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">
          E-mail
        </label>
        <Input name="email" type="email" placeholder="voce@clinica.com.br" />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">
          Assunto
        </label>
        <select
          name="subject"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          defaultValue=""
        >
          <option value="">Selecione…</option>
          <option value="Manutenção preventiva">Manutenção preventiva</option>
          <option value="Manutenção corretiva">Manutenção corretiva</option>
          <option value="Higienização de ar-condicionado / PMOC">
            Higienização de ar-condicionado / PMOC
          </option>
          <option value="Compra de peças">Compra de peças</option>
          <option value="Contrato de preventiva">Contrato de preventiva</option>
          <option value="Outro">Outro</option>
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-fg-muted">
          Conte o que precisa
        </label>
        <textarea
          name="message"
          rows={3}
          placeholder="Ex: cadeira odontológica com problema no encosto, preciso de avaliação."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" disabled={loading}>
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
