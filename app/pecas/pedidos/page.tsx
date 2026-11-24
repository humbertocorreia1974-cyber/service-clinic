import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expireStaleOrders } from "@/lib/orders";
import { STAFF_ORDER_ROLES } from "@/lib/order-status";
import { PedidosClient, type OrderRow } from "./pedidos-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedidos da loja · Service Clinic" };

export default async function PedidosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/pecas/pedidos");
  if (!STAFF_ORDER_ROLES.includes(session.user.role ?? "")) redirect("/dashboard");

  await expireStaleOrders().catch(() => 0);

  const orders = await prisma.partOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
    include: {
      items: { include: { part: { select: { name: true, sku: true } } } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  const low = await prisma.part.count({ where: { active: true, stockQty: { lte: 0 } } });

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    code: o.code,
    status: o.status,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    address: [o.addressStreet, o.addressNumber, o.addressDistrict, o.addressCity, o.addressState, o.addressZip].filter(Boolean).join(", "),
    notes: o.notes,
    shippingMethod: o.shippingMethod,
    shippingCost: Number(o.shippingCost),
    total: Number(o.total),
    carrier: o.carrier,
    trackingCode: o.trackingCode,
    estimatedDelivery: o.estimatedDelivery ? o.estimatedDelivery.toISOString() : null,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ name: i.part.name, sku: i.part.sku, quantity: i.quantity })),
    events: o.events.map((e) => ({ status: e.status, note: e.note, createdAt: e.createdAt.toISOString() })),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-fg-muted transition-colors hover:text-brand">← Painel</Link>
      <div className="mt-2 mb-1 flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-display text-2xl font-bold text-fg">Pedidos da loja</h1>
        <Link href="/pecas/estoque" className="text-sm font-medium text-brand underline-offset-4 hover:underline">
          Estoque de peças{low > 0 ? ` (${low} sem saldo)` : ""} →
        </Link>
      </div>
      <p className="mb-6 text-sm text-fg-muted">
        O estoque é reservado quando o pedido é criado e volta sozinho se o pagamento não for confirmado em 48h.
      </p>
      <PedidosClient initialOrders={rows} />
    </div>
  );
}
