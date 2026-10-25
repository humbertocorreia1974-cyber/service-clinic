import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { PortalServiceOrderCard } from "./service-order-card";
import { buildPixPayload, getPixConfig } from "@/lib/pix";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portal do cliente · Service Clinic" };

function formatBRL(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const PART_ORDER_STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  aguardando_pagamento: { label: "Aguardando pagamento", tone: "text-amber-500" },
  pago: { label: "Pago", tone: "text-green-500" },
  preparando: { label: "Preparando envio", tone: "text-brand" },
  enviado: { label: "Enviado", tone: "text-brand" },
  entregue: { label: "Entregue", tone: "text-green-500" },
  cancelado: { label: "Cancelado", tone: "text-red-400" },
};

const LAUDO_TYPE_LABEL: Record<string, string> = {
  tecnico: "Laudo técnico",
  higienizacao_ac: "Higienização de AC",
  pmoc: "PMOC",
  biosseguranca: "Biossegurança",
};

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/portal");

  const client = await prisma.client.findUnique({ where: { userId: session.user.id } });
  if (!client) redirect("/dashboard");

  const [orders, partOrders, laudos] = await Promise.all([
    prisma.serviceOrder.findMany({
      where: { clientId: client.id, status: { not: "cancelada" } },
      include: {
        technician: { select: { name: true, phone: true } },
        review: { select: { rating: true, comment: true } },
        invoiceItems: { include: { invoice: { select: { id: true, status: true, total: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    // PartOrder tem FK real (clientId) pro Client. Mantemos o fallback por
    // e-mail só para pedidos antigos/anônimos ainda não linkados (a loja de
    // peças também é usada por visitantes não logados) — ver
    // scripts/backfill-partorder-clientid.mjs.
    prisma.partOrder.findMany({
      where: {
        OR: [
          { clientId: client.id },
          { AND: [{ clientId: null }, { customerEmail: { equals: client.email, mode: "insensitive" } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.laudo.findMany({
      where: { clientId: client.id, status: { in: ["emitido", "assinado", "arquivado"] } },
      select: { id: true, code: true, type: true, title: true, status: true, signedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const pixConfig = getPixConfig();
  const mercadoPagoEnabled = isMercadoPagoConfigured();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-fg">Olá, {client.nomeFantasia}</h1>
      <p className="mt-1 text-sm text-fg-muted">Acompanhe suas ordens de serviço.</p>

      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <Card>
            <p className="text-sm text-fg-muted">Nenhuma ordem de serviço ainda.</p>
          </Card>
        ) : (
          orders.map((os) => {
            const pendingInvoiceItem = os.invoiceItems.find((i) => i.invoice.status === "pendente");
            const pendingInvoiceTotal = pendingInvoiceItem ? Number(pendingInvoiceItem.invoice.total) : null;
            const pendingInvoiceId = pendingInvoiceItem ? pendingInvoiceItem.invoice.id : null;

            // O payload Pix inclui o valor, então é gerado aqui (server-side)
            // por cobrança, não globalmente — cada OS com cobrança pendente
            // ganha seu próprio QR Code já com o valor certo preenchido.
            const pixPayload =
              pixConfig && pendingInvoiceTotal
                ? buildPixPayload({
                    key: pixConfig.key,
                    merchantName: pixConfig.merchantName,
                    merchantCity: pixConfig.merchantCity,
                    amount: pendingInvoiceTotal,
                    txid: os.code,
                  })
                : null;

            return (
              <PortalServiceOrderCard
                key={os.id}
                id={os.id}
                code={os.code}
                type={os.type}
                status={os.status}
                technicianName={os.technician?.name ?? null}
                scheduledAt={os.scheduledAt ? os.scheduledAt.toISOString() : null}
                totalValue={os.totalValue ? Number(os.totalValue) : null}
                clientApprovedAt={os.clientApprovedAt ? os.clientApprovedAt.toISOString() : null}
                review={os.review ? { rating: os.review.rating, comment: os.review.comment } : null}
                pendingInvoiceTotal={pendingInvoiceTotal}
                pendingInvoiceId={pendingInvoiceId}
                pixPayload={pixPayload}
                mercadoPagoEnabled={mercadoPagoEnabled}
              />
            );
          })
        )}
      </div>

      <h2 className="mt-10 font-display text-lg font-bold text-fg">Laudos técnicos</h2>
      <div className="mt-4 space-y-3">
        {laudos.length === 0 ? (
          <Card>
            <p className="text-sm text-fg-muted">Nenhum laudo finalizado ainda.</p>
          </Card>
        ) : (
          laudos.map((laudo) => (
            <Link key={laudo.id} href={`/laudos/${laudo.id}`}>
              <Card className="transition-transform hover:-translate-y-0.5">
                <CardBody className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-fg">{laudo.title}</p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {LAUDO_TYPE_LABEL[laudo.type] ?? laudo.type} · {laudo.code}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-brand">Ver laudo →</span>
                </CardBody>
              </Card>
            </Link>
          ))
        )}
      </div>

      <h2 className="mt-10 font-display text-lg font-bold text-fg">Pedidos na loja de peças</h2>
      <div className="mt-4 space-y-3">
        {partOrders.length === 0 ? (
          <Card>
            <p className="text-sm text-fg-muted">Nenhum pedido de peças ainda.</p>
          </Card>
        ) : (
          partOrders.map((order) => {
            const status = PART_ORDER_STATUS_LABEL[order.status] ?? { label: order.status, tone: "text-fg-muted" };
            return (
              <Link key={order.id} href={`/pecas/pedido/${order.id}`}>
                <Card className="transition-transform hover:-translate-y-0.5">
                  <CardBody className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-fg">Pedido {order.code}</p>
                      <p className={`mt-0.5 text-xs font-medium ${status.tone}`}>{status.label}</p>
                    </div>
                    <span className="shrink-0 font-display text-sm font-bold text-accent">
                      {formatBRL(order.total)}
                    </span>
                  </CardBody>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
