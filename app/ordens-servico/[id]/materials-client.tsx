"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { postJsonResilient } from "@/lib/offline-queue";

export function MaterialsClient({
  serviceOrderId,
  materialsPlanned,
  materialsUsed,
  canEdit,
}: {
  serviceOrderId: string;
  materialsPlanned: string | null;
  materialsUsed: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [planned, setPlanned] = useState(materialsPlanned ?? "");
  const [used, setUsed] = useState(materialsUsed ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setMsg(null);
    const result = await postJsonResilient(
      `/api/service-orders/${serviceOrderId}/materials`,
      { materialsPlanned: planned, materialsUsed: used },
      "Materiais"
    );
    if (!result.ok) {
      setError("Falha ao salvar materiais.");
      return;
    }
    if (result.queued) {
      setMsg("Salvo no aparelho — sincroniza quando a internet voltar.");
      return;
    }
    setMsg("Materiais salvos.");
    startTransition(() => router.refresh());
  }

  if (!canEdit) {
    if (!materialsPlanned && !materialsUsed) return <p className="text-sm text-fg-muted">Nenhum material registrado.</p>;
    return (
      <div className="space-y-2 text-sm text-fg">
        {materialsPlanned && (
          <div>
            <p className="text-xs uppercase tracking-wide text-fg-muted">Previsto</p>
            <p className="whitespace-pre-wrap">{materialsPlanned}</p>
          </div>
        )}
        {materialsUsed && (
          <div>
            <p className="text-xs uppercase tracking-wide text-fg-muted">Usado</p>
            <p className="whitespace-pre-wrap">{materialsUsed}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-fg-muted">Material previsto</label>
        <textarea
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
          rows={2}
          placeholder="Ex.: 1x resistência de autoclave, 1x válvula de retenção"
          className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
      <div>
        <label className="text-xs text-fg-muted">Material usado</label>
        <textarea
          value={used}
          onChange={(e) => setUsed(e.target.value)}
          rows={2}
          placeholder="Preencher ao concluir o serviço"
          className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
      <Button size="sm" onClick={submit} disabled={pending}>
        {pending ? "Salvando..." : "Salvar materiais"}
      </Button>
      {msg && <p className="text-xs text-emerald-400">{msg}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
