// Regras do pedido da loja de peças: estoque reservado, cancelamento e expiração (só servidor).
// O estoque é RESERVADO na criação do pedido (baixa atômica) e devolvido se o pedido for cancelado/expirar.
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { RESERVATION_HOURS } from "@/lib/order-status";

export { ORDER_STATUS, NEXT_STATUS, CARRIERS, RESERVATION_HOURS, STAFF_ORDER_ROLES, trackingUrl } from "@/lib/order-status";

type Tx = Prisma.TransactionClient;

/** devolve ao estoque os itens do pedido (uma única vez) e cancela */
export async function cancelOrderTx(tx: Tx, orderId: string, note: string, createdBy?: string | null) {
  const order = await tx.partOrder.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status === "cancelado" || order.status === "entregue") return false;
  if (!order.stockReleased) {
    for (const item of order.items) {
      await tx.part.update({ where: { id: item.partId }, data: { stockQty: { increment: item.quantity } } });
      await tx.stockMovement.create({
        data: { partId: item.partId, kind: "ajuste", quantity: item.quantity, reason: `Estorno - pedido ${order.code} cancelado`, userId: createdBy ?? null },
      });
    }
  }
  await tx.partOrder.update({ where: { id: order.id }, data: { status: "cancelado", cancelledAt: new Date(), stockReleased: true } });
  await tx.partOrderEvent.create({ data: { orderId: order.id, status: "cancelado", note, createdBy: createdBy ?? null } });
  return true;
}

/** pedidos sem pagamento há mais de RESERVATION_HOURS liberam o estoque reservado */
export async function expireStaleOrders(): Promise<number> {
  const limit = new Date(Date.now() - RESERVATION_HOURS * 3600 * 1000);
  const stale = await prisma.partOrder.findMany({
    where: { status: "aguardando_pagamento", createdAt: { lt: limit } },
    select: { id: true },
    take: 50,
  });
  let n = 0;
  for (const o of stale) {
    const done = await prisma.$transaction((tx) => cancelOrderTx(tx, o.id, `Pagamento não confirmado em ${RESERVATION_HOURS}h — reserva liberada`));
    if (done) n++;
  }
  return n;
}
