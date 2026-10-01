"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ClientOpt = { id: string; nomeFantasia: string; addressCity: string };
type TechOpt = { id: string; name: string; cities: string[] };

const TYPE_LABEL: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  higienizacao_ac: "Higienização de AC",
  instalacao: "Instalação",
  venda_peca: "Venda de peça",
};

export function NovaOSForm({
  clients,
  technicians,
  cidades,
}: {
  clients: ClientOpt[];
  technicians: TechOpt[];
  cidades: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");

  const selectedClient = clients.find((c) => c.id === clientId);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErro(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      clientId: String(fd.get("clientId") ?? "").trim(),
      type: String(fd.get("type") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim() || null,
      description: String(fd.get("description") ?? "").trim() || null,
      technicianId: String(fd.get("technicianId") ?? "").trim() || null,
      scheduledAt: String(fd.get("scheduledAt") ?? "").trim() || null,
      totalValue: String(fd.get("totalValue") ?? "").trim() || null,
    };

    try {
      const res = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Falha ao criar OS");
      router.push(`/ordens-servico/${data.serviceOrder.id}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErro(err instanceof Error ? err.message : "Erro inesperado");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-6">
      <div>
        <label htmlFor="clientId" className="mb-1 block text-sm text-fg-muted">
          Cliente *
        </label>
        <select
          id="clientId"
          name="clientId"
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
        >
          <option value="">Selecione…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nomeFantasia} — {c.addressCity}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm text-fg-muted">
            Tipo de serviço *
          </label>
          <select
            id="type"
            name="type"
            required
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
          >
            <option value="">Selecione…</option>
            {Object.entries(TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="mb-1 block text-sm text-fg-muted">
            Cidade *
          </label>
          <select
            id="city"
            name="city"
            required
            defaultValue={selectedClient?.addressCity ?? ""}
            key={selectedClient?.addressCity ?? "none"}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
          >
            <option value="">Selecione…</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm text-fg-muted">
          Endereço
        </label>
        <Input id="address" name="address" placeholder="Rua, número" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm text-fg-muted">
          Descrição do chamado
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
          placeholder="Ex.: Autoclave não está pressurizando"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="technicianId" className="mb-1 block text-sm text-fg-muted">
            Técnico (opcional)
          </label>
          <select
            id="technicianId"
            name="technicianId"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
          >
            <option value="">— Não atribuído —</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.cities.length ? `· ${t.cities.join(", ")}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="scheduledAt" className="mb-1 block text-sm text-fg-muted">
            Agendado para
          </label>
          <input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
          />
        </div>
      </div>

      <div>
        <label htmlFor="totalValue" className="mb-1 block text-sm text-fg-muted">
          Valor (R$)
        </label>
        <Input id="totalValue" name="totalValue" type="number" step="0.01" min="0" placeholder="250.00" />
      </div>

      {status === "error" && erro && (
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-accent">{erro}</p>
      )}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Criando…" : "Criar OS"}
      </Button>
    </form>
  );
}
