"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PixQrCode } from "@/components/pix-qrcode";

const TYPE_LABEL: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  higienizacao_ac: "Higienização de AC",
  instalacao: "Instalação",
  venda_peca: "Venda de peça",
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  aberta: { label: "Aguardando agendamento", cls: "border-border bg-bg text-fg-muted" },
  a_caminho: { label: "Técnico a caminho", cls: "border-accent/30 bg-accent/10 text-accent" },
  em_andamento: { label: "Em atendimento", cls: "border-accent/30 bg-accent/10 text-accent" },
  concluida: { label: "Concluída", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
};

export function PortalServiceOrderCard({
  id,
  code,
  type,
  status,
  technicianName,
  scheduledAt,
  totalValue,
  clientApprovedAt,
  review,
  pendingInvoiceTotal,
  pendingInvoiceId,
  pixPayload,
  mercadoPagoEnabled,
}: {
  id: string;
  code: string;
  type: string;
  status: string;
  technicianName: string | null;
  scheduledAt: string | null;
  totalValue: number | null;
  clientApprovedAt: string | null;
  review: { rating: number; comment: string | null } | null;
  pendingInvoiceTotal: number | null;
  pendingInvoiceId: string | null;
  pixPayload: string | null;
  mercadoPagoEnabled: boolean;
}) {
  const router = useRouter();
  const [aprovando, setAprovando] = useState(false);
  const [aprovado, setAprovado] = useState(!!clientApprovedAt);
  const [avaliando, setAvaliando] = useState(false);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(!!review);
  const [erro, setErro] = useState<string | null>(null);
  const [pagando, setPagando] = useState(false);

  const s = STATUS_LABEL[status] ?? { label: status, cls: "border-border bg-bg text-fg-muted" };

  async function aprovar() {
    setAprovando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/service-orders/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Falha ao aprovar");
      setAprovado(true);
      router.refresh();
    } catch {
      setErro("Não foi possível aprovar agora. Tente de novo.");
    } finally {
      setAprovando(false);
    }
  }

  async function pagarOnline() {
    if (!pendingInvoiceId) return;
    setPagando(true);
    setErro(null);
    try {
      const res = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: pendingInvoiceId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.initPoint) throw new Error(data?.error ?? "Falha ao iniciar pagamento");
      window.location.href = data.initPoint;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível iniciar o pagamento agora.");
      setPagando(false);
    }
  }

  async function enviarAvaliacao() {
    setErro(null);
    try {
      const res = await fetch(`/api/service-orders/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: nota, comment: comentario || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Falha ao enviar avaliação");
      }
      setEnviado(true);
      setAvaliando(false);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado");
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>
            {code} · {TYPE_LABEL[type] ?? type}
          </CardTitle>
          <p className="mt-1 text-xs text-fg-muted">
            Técnico: {technicianName ?? "Aguardando atribuição"}
            {scheduledAt ? ` · ${new Date(scheduledAt).toLocaleString("pt-BR")}` : ""}
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
          {s.label}
        </span>
      </div>

      {totalValue ? (
        <p className="mt-3 text-sm text-fg">Valor: R$ {totalValue.toFixed(2)}</p>
      ) : null}

      {pendingInvoiceTotal ? (
        <div className="mt-3 rounded-md border border-border bg-bg/60 p-3 text-sm text-fg">
          Cobrança enviada: <strong>R$ {pendingInvoiceTotal.toFixed(2)}</strong>
          {pixPayload ? (
            <PixQrCode payload={pixPayload} amountLabel={`R$ ${pendingInvoiceTotal.toFixed(2)}`} />
          ) : (
            <p className="mt-1 text-xs text-fg-muted">
              Pague via PIX, cartão ou dinheiro diretamente com nossa equipe — a confirmação do recebimento é feita manualmente.
            </p>
          )}
          {mercadoPagoEnabled && pendingInvoiceId ? (
            <div className="mt-3">
              <Button size="sm" variant="secondary" onClick={pagarOnline} disabled={pagando}>
                {pagando ? "Abrindo pagamento…" : "Pagar online (cartão, boleto ou Pix)"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {totalValue && !aprovado && status !== "concluida" ? (
        <div className="mt-4">
          <Button size="sm" onClick={aprovar} disabled={aprovando}>
            {aprovando ? "Aprovando…" : "Aprovar orçamento/execução"}
          </Button>
        </div>
      ) : null}
      {aprovado && status !== "concluida" ? (
        <p className="mt-3 text-xs text-emerald-400">Orçamento aprovado.</p>
      ) : null}

      {status === "concluida" && !enviado ? (
        <div className="mt-4 border-t border-border pt-4">
          {!avaliando ? (
            <Button size="sm" variant="secondary" onClick={() => setAvaliando(true)}>
              Avaliar atendimento
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNota(n)}
                    className={`text-xl ${n <= nota ? "text-accent" : "text-fg-muted"}`}
                    aria-label={`${n} estrela(s)`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                placeholder="Como foi o atendimento? (opcional)"
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
              />
              <Button size="sm" onClick={enviarAvaliacao}>
                Enviar avaliação
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {enviado && review ? (
        <div className="mt-4 border-t border-border pt-4 text-sm">
          <p className="text-accent">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
          {review.comment ? <p className="mt-1 text-fg-muted">{review.comment}</p> : null}
        </div>
      ) : null}

      {erro ? <p className="mt-3 text-xs text-red-400">{erro}</p> : null}
    </Card>
  );
}
