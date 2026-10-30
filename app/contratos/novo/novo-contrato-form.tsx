"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ClientOpt = { id: string; nomeFantasia: string };
type EquipmentOpt = { id: string; clientId: string; category: string; brand: string; model: string };

const PERIODICITY_LABEL: Record<string, string> = {
  mensal: "Mensal",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export function NovoContratoForm({
  clients,
  equipments,
}: {
  clients: ClientOpt[];
  equipments: EquipmentOpt[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");

  const clientEquipments = equipments.filter((e) => e.clientId === clientId);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErro(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      clientId: String(fd.get("clientId") ?? "").trim(),
      equipmentId: String(fd.get("equipmentId") ?? "").trim() || null,
      title: String(fd.get("title") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim() || null,
      periodicity: String(fd.get("periodicity") ?? "").trim(),
      value: String(fd.get("value") ?? "").trim(),
      startDate: String(fd.get("startDate") ?? "").trim(),
      endDate: String(fd.get("endDate") ?? "").trim() || null,
      alertDaysBefore: String(fd.get("alertDaysBefore") ?? "").trim() || null,
      autoRenew: fd.get("autoRenew") === "on",
    };

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Falha ao criar contrato");
      router.push(`/contratos/${data.contract.id}`);
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
              {c.nomeFantasia}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="equipmentId" className="mb-1 block text-sm text-fg-muted">
          Equipamento (opcional)
        </label>
        <select
          id="equipmentId"
          name="equipmentId"
          disabled={!clientId}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand disabled:opacity-50"
        >
          <option value="">— Contrato geral, sem equipamento específico —</option>
          {clientEquipments.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.brand} {eq.model} ({eq.category})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm text-fg-muted">
          Título do contrato *
        </label>
        <Input id="title" name="title" required placeholder="Ex.: Manutenção preventiva trimestral" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm text-fg-muted">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
          placeholder="Escopo do que está incluso no contrato"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="periodicity" className="mb-1 block text-sm text-fg-muted">
            Periodicidade *
          </label>
          <select
            id="periodicity"
            name="periodicity"
            required
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
          >
            <option value="">Selecione…</option>
            {Object.entries(PERIODICITY_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="value" className="mb-1 block text-sm text-fg-muted">
            Valor (R$) *
          </label>
          <Input id="value" name="value" type="number" step="0.01" min="0" required placeholder="350.00" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm text-fg-muted">
            Início *
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm text-fg-muted">
            Término (opcional)
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        <div>
          <label htmlFor="alertDaysBefore" className="mb-1 block text-sm text-fg-muted">
            Avisar com quantos dias de antecedência
          </label>
          <Input id="alertDaysBefore" name="alertDaysBefore" type="number" min="1" placeholder="7" />
        </div>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input type="checkbox" name="autoRenew" defaultChecked className="h-4 w-4 rounded border-border" />
          Renovação automática
        </label>
      </div>

      {status === "error" && erro && (
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-accent">{erro}</p>
      )}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Criando…" : "Criar contrato"}
      </Button>
    </form>
  );
}
