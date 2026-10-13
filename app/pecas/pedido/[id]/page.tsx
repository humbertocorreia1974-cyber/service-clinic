import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function formatBRL(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  aguardando_pagamento: { label: "Aguardando pagamento", tone: "text-amber-500" },
  pago: { label: "Pago", tone: "text-green-500" },
  preparando: { label: "Preparando envio", tone: "text-brand" },
  enviado: { label: "Enviado", tone: "text-brand" },
  entregue: { label: "Entregue", tone: "text-green-500" },
  cancelado: { label: "Cancelado", tone: "text-red-400" },
};

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { pagamento?: string };
}) {
  const order = await prisma.partOrder.findUnique({
    where: { id: params.id },
    include: { items: { include: { part: { select: { name: true, sku: true, imageUrl: true } } } } },
  });
  if (!order) notFound();

  const status = STATUS_LABEL[order.status] ?? { label: order.status, tone: "text-fg-muted" };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardBody>
          <p className="text-xs uppercase tracking-wide text-fg-muted">Pedido {order.code}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-fg">
            {searchParams.pagamento === "sucesso"
              ? "Pagamento confirmado!"
              : searchParams.pagamento === "pendente"
                ? "Pagamento em processamento"
                : "Status do pedido"}
          </h1>
          <p className={`mt-2 text-sm font-semibold ${status.tone}`}>{status.label}</p>

          <div className="mt-6 space-y-3 border-t border-border pt-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-fg">{item.part.name}</p>
                  <p className="text-xs text-fg-muted">
                    {item.quantity}x {formatBRL(item.unitPrice)}
                  </p>
                </div>
                <p className="font-medium text-fg">{formatBRL(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-fg-muted">Total</span>
            <span className="font-display text-lg font-bold text-accent">{formatBRL(order.total)}</span>
          </div>

          <p className="mt-4 text-xs text-fg-muted">
            Enviaremos atualizações para {order.customerEmail} e {order.customerPhone}.
          </p>

          <Link href="/pecas" className="mt-6 inline-block">
            <Button variant="secondary">Voltar ao catálogo</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
