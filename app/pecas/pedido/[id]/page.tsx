import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CARRIERS, ORDER_STATUS, trackingUrl } from "@/lib/orders";
import { CheckCircle2, Circle, Truck, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function formatBRL(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
const fmtDate = (d: Date | null | undefined) => (d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "");
const fmtDateTime = (d: Date) => d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const STEPS = ["aguardando_pagamento", "pago", "preparando", "enviado", "entregue"] as const;

export default async function PedidoPage({ params, searchParams }: { params: { id: string }; searchParams: { pagamento?: string } }) {
  const order = await prisma.partOrder.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { part: { select: { name: true, sku: true } } } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) notFound();

  const status = ORDER_STATUS[order.status] ?? { label: order.status, tone: "text-fg-muted" };
  const cancelled = order.status === "cancelado";
  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const url = trackingUrl(order.carrier, order.trackingCode);
  const carrierLabel = CARRIERS.find((c) => c.id === order.carrier)?.label ?? order.carrier;
  const pickup = order.shippingMethod === "retirada";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardBody>
          <p className="text-xs uppercase tracking-wide text-fg-muted">Pedido {order.code}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-fg">
            {searchParams.pagamento === "sucesso" ? "Pagamento confirmado!" : searchParams.pagamento === "pendente" ? "Pagamento em processamento" : "Andamento do pedido"}
          </h1>
          <p className={`mt-2 text-sm font-semibold ${status.tone}`}>{status.label}</p>

          {cancelled ? (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{order.events.filter((e) => e.status === "cancelado").at(-1)?.note ?? "Pedido cancelado."}</span>
            </div>
          ) : (
            <ol className="mt-6 grid grid-cols-5 gap-1 text-center" aria-label="Etapas do pedido">
              {STEPS.map((s, i) => {
                const done = i <= stepIndex;
                return (
                  <li key={s} className="flex flex-col items-center gap-1.5">
                    {done ? <CheckCircle2 className="h-5 w-5 text-brand" /> : <Circle className="h-5 w-5 text-border" />}
                    <span className={`text-[11px] leading-tight ${done ? "font-semibold text-fg" : "text-fg-muted"}`}>{ORDER_STATUS[s].label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {!cancelled && order.status !== "entregue" && order.estimatedDelivery && (
            <p className="mt-5 flex items-center gap-2 text-sm text-fg">
              <Truck className="h-4 w-4 text-brand" />
              {pickup ? "Retirada combinada com a equipe." : <>Previsão de entrega até <b>{fmtDate(order.estimatedDelivery)}</b>.</>}
            </p>
          )}

          {order.trackingCode && (
            <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3 text-sm">
              <p className="text-fg-muted">{carrierLabel}</p>
              <p className="mt-0.5 font-mono font-semibold text-fg">{order.trackingCode}</p>
              {url && (
                <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-brand underline underline-offset-4">
                  Rastrear na transportadora
                </a>
              )}
            </div>
          )}

          <div className="mt-6 space-y-3 border-t border-border pt-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-fg">{item.part.name}</p>
                  <p className="text-xs text-fg-muted">{item.quantity}x {formatBRL(item.unitPrice)}</p>
                </div>
                <p className="font-medium text-fg">{formatBRL(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-fg-muted">Subtotal</dt><dd>{formatBRL(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-fg-muted">Frete{pickup ? " (retirada)" : ""}</dt><dd>{Number(order.shippingCost) === 0 ? "Grátis" : formatBRL(order.shippingCost)}</dd></div>
            <div className="flex justify-between pt-1"><dt className="font-semibold text-fg">Total</dt><dd className="font-display text-lg font-bold text-accent">{formatBRL(order.total)}</dd></div>
          </dl>

          <h2 className="mt-6 text-sm font-semibold text-fg">Histórico</h2>
          <ul className="mt-2 space-y-2 border-l border-border pl-4">
            {order.events.map((e) => (
              <li key={e.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand" />
                <p className="font-medium text-fg">{ORDER_STATUS[e.status]?.label ?? e.status}</p>
                {e.note && <p className="text-xs text-fg-muted">{e.note}</p>}
                <p className="text-[11px] text-fg-muted">{fmtDateTime(e.createdAt)}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-fg-muted">Enviaremos atualizações para {order.customerEmail}.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/pecas"><Button variant="secondary">Voltar ao catálogo</Button></Link>
            <Link href="/pecas/rastreio"><Button variant="ghost">Acompanhar outro pedido</Button></Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
