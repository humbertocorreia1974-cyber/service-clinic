"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "../cart-context";
import type { ShippingOption } from "@/lib/shipping";

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CarrinhoPage() {
  const router = useRouter();
  const { items, updateQty, removeItem, subtotal, clear } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zip, setZip] = useState("");
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [method, setMethod] = useState<string>("");
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const digits = zip.replace(/\D/g, "");
  const chosen = options.find((o) => o.id === method) ?? null;
  const total = subtotal + (chosen?.cost ?? 0);

  // cota o frete quando o CEP completa (ou o carrinho muda)
  useEffect(() => {
    if (digits.length !== 8 || items.length === 0) {
      setOptions([]);
      setMethod("");
      setQuoteError(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    setQuoteError(null);
    fetch("/api/pecas/frete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zip: digits, items: items.map((i) => ({ partId: i.partId, quantity: i.qty })) }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setOptions([]);
          setMethod("");
          setQuoteError(data?.error || "Não foi possível calcular o frete.");
        } else {
          setOptions(data.options ?? []);
          setMethod((cur) => (data.options?.some((o: ShippingOption) => o.id === cur) ? cur : data.options?.[data.options.length - 1]?.id ?? ""));
        }
      })
      .catch(() => !cancelled && setQuoteError("Não foi possível calcular o frete."))
      .finally(() => !cancelled && setQuoting(false));
    return () => {
      cancelled = true;
    };
  }, [digits, items]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!chosen) {
      setError("Informe o CEP e escolha a forma de entrega.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      items: items.map((i) => ({ partId: i.partId, quantity: i.qty })),
      shippingMethod: chosen.id,
      customer: {
        name: String(fd.get("name") ?? "").trim(),
        phone: String(fd.get("phone") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        addressStreet: String(fd.get("addressStreet") ?? "").trim() || null,
        addressNumber: String(fd.get("addressNumber") ?? "").trim() || null,
        addressDistrict: String(fd.get("addressDistrict") ?? "").trim() || null,
        addressCity: String(fd.get("addressCity") ?? "").trim(),
        addressState: String(fd.get("addressState") ?? "RJ").trim() || "RJ",
        addressZip: digits,
        notes: String(fd.get("notes") ?? "").trim() || null,
      },
    };
    try {
      const res = await fetch("/api/pecas/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Não foi possível criar o pedido.");
        setSubmitting(false);
        return;
      }
      clear();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        router.push(`/pecas/pedido/${data.orderId}`);
      }
    } catch {
      setError("Erro inesperado ao criar o pedido.");
      setSubmitting(false);
    }
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-fg">Seu carrinho está vazio</h1>
        <p className="mt-2 text-fg-muted">Volte ao catálogo e adicione as peças que precisa.</p>
        <Link href="/pecas" className="mt-6 inline-block">
          <Button variant="primary">Ver catálogo de peças</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/pecas" className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-brand">
        <ArrowLeft className="h-3.5 w-3.5" /> Continuar comprando
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-fg">Carrinho</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.partId}>
              <CardBody className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{item.name}</p>
                  <p className="text-xs text-fg-muted">SKU: {item.sku}</p>
                  <p className="mt-1 font-display text-sm font-bold text-accent">{formatBRL(item.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => updateQty(item.partId, item.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface-2" aria-label="Diminuir quantidade">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm">{item.qty}</span>
                  <button type="button" onClick={() => updateQty(item.partId, item.qty + 1)} disabled={item.qty >= item.stockQty} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface-2 disabled:opacity-40" aria-label="Aumentar quantidade">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button type="button" onClick={() => removeItem(item.partId)} className="text-fg-muted hover:text-red-400" aria-label="Remover">
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardBody>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardBody>
              <CardTitle>Resumo</CardTitle>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-fg-muted">Subtotal</span>
                <span className="font-semibold text-fg">{formatBRL(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-fg-muted">Frete</span>
                <span className="font-semibold text-fg">{chosen ? (chosen.cost === 0 ? "Grátis" : formatBRL(chosen.cost)) : "—"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm">
                <span className="font-semibold text-fg">Total</span>
                <span className="font-display text-lg font-bold text-accent">{formatBRL(total)}</span>
              </div>

              <div className="mt-4">
                <label htmlFor="cep" className="mb-1 block text-xs font-medium text-fg">CEP de entrega</label>
                <Input id="cep" inputMode="numeric" placeholder="00000-000" value={zip} onChange={(e) => setZip(e.target.value.replace(/[^\d-]/g, "").slice(0, 9))} />
                {quoting && <p className="mt-1 text-xs text-fg-muted">Calculando frete…</p>}
                {quoteError && <p className="mt-1 text-xs text-red-500">{quoteError}</p>}
              </div>

              {options.length > 0 && (
                <fieldset className="mt-3 space-y-2">
                  <legend className="sr-only">Forma de entrega</legend>
                  {options.map((o) => (
                    <label key={o.id} className={`flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm ${method === o.id ? "border-brand bg-brand/5" : "border-border"}`}>
                      <input type="radio" name="shipping" className="mt-1" checked={method === o.id} onChange={() => setMethod(o.id)} />
                      <span className="flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium text-fg">{o.label}</span>
                          <span className="font-semibold text-fg">{o.cost === 0 ? "Grátis" : formatBRL(o.cost)}</span>
                        </span>
                        <span className="block text-xs text-fg-muted">
                          {o.etaDays[1] === 0 ? "Hoje" : o.etaDays[0] === o.etaDays[1] ? `${o.etaDays[1]} dia(s) útil(eis)` : `${o.etaDays[0]} a ${o.etaDays[1]} dias úteis`} · {o.note}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}

              {!showCheckout ? (
                <Button variant="primary" className="mt-4 w-full" onClick={() => setShowCheckout(true)} disabled={items.length === 0}>
                  Finalizar compra
                </Button>
              ) : (
                <form onSubmit={onSubmit} className="mt-4 space-y-3">
                  {error && <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-500">{error}</p>}
                  <Input name="name" required placeholder="Nome completo" />
                  <Input name="phone" required placeholder="Telefone / WhatsApp" inputMode="tel" />
                  <Input name="email" required type="email" placeholder="E-mail" />
                  {method !== "retirada" && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <Input name="addressStreet" placeholder="Rua" className="col-span-2" required />
                        <Input name="addressNumber" placeholder="Nº" required />
                      </div>
                      <Input name="addressDistrict" placeholder="Bairro" />
                    </>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <Input name="addressCity" required placeholder="Cidade" className="col-span-2" />
                    <Input name="addressState" placeholder="UF" defaultValue="RJ" />
                  </div>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Observações (opcional)"
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
                  />
                  <Button type="submit" variant="primary" className="w-full" disabled={submitting || !chosen}>
                    {submitting ? "Processando..." : chosen ? `Pagar ${formatBRL(total)}` : "Informe o CEP para continuar"}
                  </Button>
                  <p className="text-center text-[11px] text-fg-muted">Reservamos as peças por 48h enquanto o pagamento é confirmado.</p>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
