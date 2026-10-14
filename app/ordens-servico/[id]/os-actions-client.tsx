"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const NEXT_STATUS_LABEL: Record<string, string> = {
  aberta: "A caminho",
  a_caminho: "Em andamento",
  em_andamento: "Concluída",
};

export function OsActionsClient({
  serviceOrderId,
  status,
  hasInvoice,
  hasValue,
}: {
  serviceOrderId: string;
  status: string;
  hasInvoice: boolean;
  hasValue: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function advanceStatus() {
    setError(null);
    setMsg(null);
    const res = await fetch(`/api/service-orders/${serviceOrderId}/status`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Falha ao atualizar status.");
      return;
    }
    setMsg("Status atualizado.");
    startTransition(() => router.refresh());
  }

  async function sendCharge() {
    setError(null);
    setMsg(null);
    const res = await fetch(`/api/service-orders/${serviceOrderId}/charge`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Falha ao enviar cobrança.");
      return;
    }
    setMsg("Cobrança enviada ao cliente.");
    startTransition(() => router.refresh());
  }

  const nextLabel = NEXT_STATUS_LABEL[status];

  return (
    <div className="flex flex-col gap-2">
      {nextLabel && (
        <Button variant="secondary" size="sm" className="w-full" onClick={advanceStatus} disabled={pending}>
          {pending ? "Atualizando..." : `Avançar para: ${nextLabel}`}
        </Button>
      )}
      {status === "concluida" && !hasInvoice && (
        <Button
          size="sm"
          className="w-full"
          onClick={sendCharge}
          disabled={pending || !hasValue}
          title={!hasValue ? "Informe o valor da OS antes de cobrar" : undefined}
        >
          {pending ? "Enviando..." : "Enviar cobrança"}
        </Button>
      )}
      {status === "concluida" && hasInvoice && (
        <p className="text-center text-xs text-emerald-400">Cobrança já enviada para esta OS.</p>
      )}
      {!hasValue && status === "concluida" && !hasInvoice && (
        <p className="text-xs text-fg-muted">Sem valor definido — edite o valor da OS para poder cobrar.</p>
      )}
      {msg && <p className="text-xs text-emerald-400">{msg}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
