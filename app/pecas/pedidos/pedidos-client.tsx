"use client";

import { useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CARRIERS, NEXT_STATUS, ORDER_STATUS } from "@/lib/order-status";
import { ChevronDown, Truck } from "lucide-react";

export type OrderRow = {
  id: string;
  code: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  notes: string | null;
  shippingMethod: string | null;
  shippingCost: number;
  total: number;
  carrier: string | null;
  trackingCode: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
  items: { name: string; sku: string; quantity: number }[];
  events: { status: string; note: string | null; createdAt: string }[];
};

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const when = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const ACTION_LABEL: Record<string, string> = { pago: "Marcar como pago", preparando: "Começar a preparar", enviado: "Registrar envio", entregue: "Confirmar entrega", cancelado: "Cancelar pedido" };
const FILTERS = ["todos", "aguardando_pagamento", "pago", "preparando", "enviado", "entregue", "cancelado"];

export function PedidosClient({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("todos");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [shipFor, setShipFor] = useState<string | null>(null);
  const [cancelFor, setCancelFor] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);
  const visible = filter === "todos" ? orders : orders.filter((o) => o.status === filter);

  async function act(order: OrderRow, status: string, extra: Record<string, string> = {}) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/pecas/pedidos/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ id: order.id, text: data?.error || "Não foi possível atualizar.", ok: false });
      } else {
        const o = data.order;
        setOrders((prev) =>
          prev.map((p) =>
            p.id === order.id
              ? { ...p, status: o.status, carrier: o.carrier, trackingCode: o.trackingCode, events: o.events.map((e: { status: string; note: string | null; createdAt: string }) => ({ status: e.status, note: e.note, createdAt: e.createdAt })) }
              : p
          )
        );
        setMsg({ id: order.id, text: `Pedido atualizado: ${ORDER_STATUS[status]?.label ?? status}.`, ok: true });
        setShipFor(null);
        setCancelFor(null);
      }
    } catch {
      setMsg({ id: order.id, text: "Erro de conexão. Tente de novo.", ok: false });
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por status">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === f ? "border-brand bg-brand text-white" : "border-border bg-surface text-fg-muted hover:text-fg"}`}
          >
            {f === "todos" ? "Todos" : ORDER_STATUS[f].label} <span className="opacity-70">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card><CardBody><p className="py-6 text-center text-sm text-fg-muted">Nenhum pedido neste filtro.</p></CardBody></Card>
      ) : (
        <ul className="space-y-3">
          {visible.map((o) => {
            const st = ORDER_STATUS[o.status] ?? { label: o.status, tone: "text-fg-muted" };
            const isOpen = open === o.id;
            const next = NEXT_STATUS[o.status] ?? [];
            return (
              <li key={o.id}>
                <Card>
                  <CardBody>
                    <button type="button" onClick={() => setOpen(isOpen ? null : o.id)} className="flex w-full items-center gap-3 text-left" aria-expanded={isOpen}>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-3 text-sm">
                          <span className="font-mono font-semibold text-fg">{o.code}</span>
                          <span className={`font-semibold ${st.tone}`}>{st.label}</span>
                          <span className="text-xs text-fg-muted">{when(o.createdAt)}</span>
                        </p>
                        <p className="mt-0.5 truncate text-sm text-fg-muted">{o.customerName} · {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
                      </div>
                      <span className="font-display text-base font-bold text-fg">{brl(o.total)}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-fg-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="mt-4 grid gap-5 border-t border-border pt-4 md:grid-cols-2">
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold text-fg">Cliente</p>
                          <p className="text-fg-muted">{o.customerName}<br />{o.customerPhone} · {o.customerEmail}</p>
                          <p className="font-semibold text-fg">Entrega</p>
                          <p className="text-fg-muted">
                            {o.shippingMethod === "retirada" ? "Retirada na Service Clinic" : o.address || "—"}
                            <br />Frete: {o.shippingCost === 0 ? "grátis" : brl(o.shippingCost)}
                            {o.estimatedDelivery ? <><br />Previsão: {new Date(o.estimatedDelivery).toLocaleDateString("pt-BR")}</> : null}
                          </p>
                          {o.trackingCode && <p className="flex items-center gap-1.5 text-fg"><Truck className="h-4 w-4 text-brand" />{CARRIERS.find((c) => c.id === o.carrier)?.label}: <span className="font-mono">{o.trackingCode}</span></p>}
                          {o.notes && <p className="rounded-md bg-surface-2 p-2 text-xs text-fg-muted">Obs.: {o.notes}</p>}
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-fg">Itens</p>
                          <ul className="mt-1 space-y-0.5 text-fg-muted">{o.items.map((i) => <li key={i.sku}>{i.quantity}× {i.name} <span className="text-xs">({i.sku})</span></li>)}</ul>
                          <p className="mt-3 font-semibold text-fg">Histórico</p>
                          <ul className="mt-1 space-y-1 border-l border-border pl-3">
                            {o.events.map((e, idx) => (
                              <li key={idx} className="text-xs text-fg-muted"><b className="text-fg">{ORDER_STATUS[e.status]?.label ?? e.status}</b> · {when(e.createdAt)}{e.note ? ` — ${e.note}` : ""}</li>
                            ))}
                          </ul>
                        </div>

                        {next.length > 0 && (
                          <div className="md:col-span-2">
                            {shipFor === o.id ? (
                              <form
                                className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const fd = new FormData(e.currentTarget);
                                  act(o, "enviado", { carrier: String(fd.get("carrier")), trackingCode: String(fd.get("trackingCode") ?? "") });
                                }}
                              >
                                <select name="carrier" required defaultValue={o.shippingMethod === "entrega_local" ? "entrega_propria" : "correios"} className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-fg">
                                  {CARRIERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                                <Input name="trackingCode" placeholder="Código de rastreio (se houver)" />
                                <div className="flex gap-2">
                                  <Button type="submit" disabled={busy}>Confirmar envio</Button>
                                  <Button type="button" variant="ghost" onClick={() => setShipFor(null)}>Voltar</Button>
                                </div>
                              </form>
                            ) : cancelFor === o.id ? (
                              <form
                                className="grid gap-2 sm:grid-cols-[1fr_auto]"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  act(o, "cancelado", { note: String(new FormData(e.currentTarget).get("note") ?? "") });
                                }}
                              >
                                <Input name="note" required placeholder="Motivo do cancelamento (o cliente recebe por e-mail)" />
                                <div className="flex gap-2">
                                  <Button type="submit" disabled={busy}>Cancelar e devolver ao estoque</Button>
                                  <Button type="button" variant="ghost" onClick={() => setCancelFor(null)}>Voltar</Button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {next.map((s) =>
                                  s === "cancelado" ? (
                                    <Button key={s} variant="ghost" onClick={() => setCancelFor(o.id)}>{ACTION_LABEL[s]}</Button>
                                  ) : s === "enviado" ? (
                                    <Button key={s} onClick={() => setShipFor(o.id)}>{ACTION_LABEL[s]}</Button>
                                  ) : (
                                    <Button key={s} disabled={busy} onClick={() => act(o, s)}>{ACTION_LABEL[s]}</Button>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {msg?.id === o.id && (
                          <p role="status" className={`md:col-span-2 text-sm ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
