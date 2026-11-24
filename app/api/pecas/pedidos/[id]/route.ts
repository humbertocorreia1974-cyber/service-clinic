import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";
import { CARRIERS, NEXT_STATUS, ORDER_STATUS, STAFF_ORDER_ROLES, cancelOrderTx, trackingUrl } from "@/lib/orders";

export const dynamic = "force-dynamic";

// Equipe atualiza o andamento do pedido: pago → preparando → enviado (com rastreio) → entregue, ou cancela (devolve o estoque).
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!STAFF_ORDER_ROLES.includes(session.user.role ?? "")) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const status = String(body?.status ?? "");
  const note = String(body?.note ?? "").trim().slice(0, 300);
  const carrier = body?.carrier ? String(body.carrier) : null;
  const trackingCode = body?.trackingCode ? String(body.trackingCode).trim().slice(0, 60) : null;

  const order = await prisma.partOrder.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (!(NEXT_STATUS[order.status] ?? []).includes(status)) {
    return NextResponse.json({ error: `Não é possível passar de "${ORDER_STATUS[order.status]?.label ?? order.status}" para "${ORDER_STATUS[status]?.label ?? status}".` }, { status: 409 });
  }
  if (status === "enviado") {
    if (!carrier || !CARRIERS.some((c) => c.id === carrier)) return NextResponse.json({ error: "Escolha a transportadora." }, { status: 400 });
    if (carrier !== "entrega_propria" && !trackingCode) return NextResponse.json({ error: "Informe o código de rastreio." }, { status: 400 });
  }
  if (status === "cancelado" && !note) return NextResponse.json({ error: "Informe o motivo do cancelamento." }, { status: 400 });

  const userId = session.user.id ?? null;
  if (status === "cancelado") {
    await prisma.$transaction((tx) => cancelOrderTx(tx, order.id, `Cancelado pela equipe: ${note}`, userId));
  } else {
    await prisma.$transaction([
      prisma.partOrder.update({
        where: { id: order.id },
        data: {
          status,
          ...(status === "pago" ? { paidAt: new Date() } : {}),
          ...(status === "enviado" ? { carrier, trackingCode, shippedAt: new Date() } : {}),
          ...(status === "entregue" ? { deliveredAt: new Date() } : {}),
        },
      }),
      prisma.partOrderEvent.create({
        data: {
          orderId: order.id,
          status,
          createdBy: userId,
          note: note || (status === "enviado" ? `Enviado${trackingCode ? ` — rastreio ${trackingCode}` : ""}` : null),
        },
      }),
    ]);
  }

  // aviso ao cliente (best-effort: falha de e-mail nunca desfaz a atualização)
  if (["preparando", "enviado", "entregue", "cancelado"].includes(status)) {
    try {
      const url = trackingUrl(carrier, trackingCode);
      const link = `${new URL(request.url).origin}/pecas/pedido/${order.id}`;
      await sendEmail({
        to: order.customerEmail,
        subject: `Pedido ${order.code}: ${ORDER_STATUS[status].label}`,
        html: `<p>Olá, ${escapeHtml(order.customerName)}!</p><p>Seu pedido <b>${escapeHtml(order.code)}</b> agora está: <b>${escapeHtml(ORDER_STATUS[status].label)}</b>.</p>${
          status === "enviado" && trackingCode ? `<p>Rastreio: <b>${escapeHtml(trackingCode)}</b>${url ? ` — <a href="${escapeHtml(url)}">acompanhar</a>` : ""}</p>` : ""
        }${status === "cancelado" && note ? `<p>Motivo: ${escapeHtml(note)}</p>` : ""}<p><a href="${escapeHtml(link)}">Ver o andamento do pedido</a></p>`,
      });
    } catch { /* ignora */ }
  }

  const fresh = await prisma.partOrder.findUnique({ where: { id: order.id }, include: { events: { orderBy: { createdAt: "asc" } } } });
  return NextResponse.json({ ok: true, order: fresh });
}
