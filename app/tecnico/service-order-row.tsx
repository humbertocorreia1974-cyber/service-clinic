"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TYPE_LABEL: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  higienizacao_ac: "Higienização de AC",
  instalacao: "Instalação",
  venda_peca: "Venda de peça",
};

const NEXT_ACTION: Record<string, string> = {
  aberta: "Marcar: a caminho",
  a_caminho: "Marcar: iniciar atendimento",
  em_andamento: "Marcar: concluído",
};

export function TecnicoServiceOrderRow({
  id,
  code,
  type,
  status,
  clientName,
  address,
  city,
  scheduledAt,
  totalValue,
  materialsPlanned,
  materialsUsed,
  hasCharge,
}: {
  id: string;
  code: string;
  type: string;
  status: string;
  clientName: string;
  address: string;
  city: string;
  scheduledAt: string | null;
  totalValue: number | null;
  materialsPlanned: string | null;
  materialsUsed: string | null;
  hasCharge: boolean;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [pending, setPending] = useState(false);
  const [showMateriais, setShowMateriais] = useState(false);
  const [planned, setPlanned] = useState(materialsPlanned ?? "");
  const [used, setUsed] = useState(materialsUsed ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [cobrado, setCobrado] = useState(hasCharge);

  async function avancarStatus() {
    setPending(true);
    setErro(null);
    try {
      const res = await fetch(`/api/service-orders/${id}/status`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Falha ao atualizar status");
      setCurrentStatus(data.serviceOrder.status);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setPending(false);
    }
  }

  async function salvarMateriais() {
    setErro(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/service-orders/${id}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialsPlanned: planned, materialsUsed: used }),
      });
      if (!res.ok) throw new Error("Falha ao salvar materiais");
      setMsg("Materiais salvos.");
      router.refresh();
    } catch {
      setErro("Não foi possível salvar os materiais.");
    }
  }

  async function enviarCobranca() {
    setPending(true);
    setErro(null);
    try {
      const res = await fetch(`/api/service-orders/${id}/charge`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Falha ao enviar cobrança");
      setCobrado(true);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>
            {code} · {clientName}
          </CardTitle>
          <p className="mt-1 text-xs text-fg-muted">
            {TYPE_LABEL[type] ?? type} · {address ? `${address}, ` : ""}
            {city}
            {scheduledAt ? ` · ${new Date(scheduledAt).toLocaleString("pt-BR")}` : ""}
          </p>
        </div>
        {totalValue ? <span className="shrink-0 text-sm text-fg-muted">R$ {totalValue.toFixed(2)}</span> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {NEXT_ACTION[currentStatus] ? (
          <Button size="sm" onClick={avancarStatus} disabled={pending}>
            {pending ? "Salvando…" : NEXT_ACTION[currentStatus]}
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={() => setShowMateriais((v) => !v)}>
          Materiais
        </Button>
        {currentStatus === "concluida" && totalValue ? (
          cobrado ? (
            <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              Cobrança enviada
            </span>
          ) : (
            <Button size="sm" variant="secondary" onClick={enviarCobranca} disabled={pending}>
              Enviar cobrança
            </Button>
          )
        ) : null}
      </div>

      {showMateriais ? (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div>
            <label className="mb-1 block text-xs text-fg-muted">Material previsto</label>
            <textarea
              value={planned}
              onChange={(e) => setPlanned(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
              placeholder="Ex.: 1 kit de filtro, 2m de mangueira"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-fg-muted">Material realmente usado</label>
            <textarea
              value={used}
              onChange={(e) => setUsed(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
              placeholder="Preencha ao concluir o serviço"
            />
          </div>
          <Button size="sm" onClick={salvarMateriais}>
            Salvar materiais
          </Button>
          {msg ? <p className="text-xs text-emerald-400">{msg}</p> : null}
        </div>
      ) : null}

      {erro ? <p className="mt-3 text-xs text-red-400">{erro}</p> : null}
    </Card>
  );
}
