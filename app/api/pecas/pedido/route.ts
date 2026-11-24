import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createCartPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";
import { quoteShipping, normalizeZip, addBusinessDays } from "@/lib/shipping";
import { expireStaleOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

class StockError extends Error {}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`pecas-pedido:${ip}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Muitas solicitações. Tente novamente em alguns minutos." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const rawItems = Array.isArray(body?.items) ? body.items : [];
    const customer = body?.customer || {};
    if (rawItems.length === 0 || rawItems.length > 50) {
      return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
    }

    const name = String(customer.name ?? "").trim();
    const phone = String(customer.phone ?? "").trim();
    const email = String(customer.email ?? "").trim();
    const addressCity = String(customer.addressCity ?? "").trim();
    const zip = normalizeZip(String(customer.addressZip ?? ""));
    if (!name || !phone || !email || !addressCity) {
      return NextResponse.json({ error: "Preencha nome, telefone, e-mail e cidade." }, { status: 400 });
    }
    if (zip.length !== 8) {
      return NextResponse.json({ error: "Informe o CEP (8 dígitos) para calcular o frete." }, { status: 400 });
    }

    // libera reservas antigas antes de checar o estoque
    await expireStaleOrders().catch(() => 0);

    // Nunca confia no preço/estoque vindo do navegador - revalida tudo contra o banco.
    const parts = await prisma.part.findMany({
      where: { id: { in: rawItems.map((i: any) => String(i.partId)) }, active: true, publicVisible: true },
    });
    const partMap = new Map(parts.map((p) => [p.id, p]));

    const orderItems: { partId: string; quantity: number; unitPrice: number; subtotal: number; title: string }[] = [];
    let grams = 0;
    for (const raw of rawItems) {
      const part = partMap.get(String(raw.partId));
      const qty = Math.max(1, Math.min(999, Math.floor(Number(raw.quantity) || 1)));
      if (!part) return NextResponse.json({ error: "Uma das peças não está mais disponível." }, { status: 400 });
      if (qty > part.stockQty) {
        return NextResponse.json({ error: `Estoque insuficiente para ${part.name} (disponível: ${part.stockQty}).` }, { status: 409 });
      }
      const unitPrice = Number(part.salePrice);
      grams += part.weightGrams * qty;
      orderItems.push({ partId: part.id, quantity: qty, unitPrice, subtotal: unitPrice * qty, title: part.name });
    }

    const subtotal = orderItems.reduce((acc, i) => acc + i.subtotal, 0);
    const option = quoteShipping(zip, subtotal, grams).find((o) => o.id === String(body?.shippingMethod ?? ""));
    if (!option) return NextResponse.json({ error: "Escolha uma forma de entrega válida para o seu CEP." }, { status: 400 });
    if (option.id !== "retirada" && (!String(customer.addressStreet ?? "").trim() || !String(customer.addressNumber ?? "").trim())) {
      return NextResponse.json({ error: "Informe rua e número para a entrega." }, { status: 400 });
    }
    const total = subtotal + option.cost;
    const code = `PED-${Date.now().toString(36).toUpperCase()}`;

    const matchingClients = await prisma.client.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });
    const clientId = matchingClients.length === 1 ? matchingClients[0].id : null;

    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        // reserva atômica: só baixa se ainda houver saldo (duas compras simultâneas não vendem a mesma peça)
        for (const i of orderItems) {
          const r = await tx.part.updateMany({
            where: { id: i.partId, stockQty: { gte: i.quantity } },
            data: { stockQty: { decrement: i.quantity } },
          });
          if (r.count === 0) throw new StockError(i.title);
          await tx.stockMovement.create({
            data: { partId: i.partId, kind: "saida_venda", quantity: i.quantity, unitCost: i.unitPrice, reason: `Reserva - pedido ${code}` },
          });
        }
        return tx.partOrder.create({
          data: {
            code,
            clientId,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            addressStreet: customer.addressStreet ?? null,
            addressNumber: customer.addressNumber ?? null,
            addressDistrict: customer.addressDistrict ?? null,
            addressCity,
            addressState: customer.addressState || "RJ",
            addressZip: zip,
            notes: customer.notes ?? null,
            subtotal,
            shippingMethod: option.id,
            shippingCost: option.cost,
            total,
            estimatedDelivery: addBusinessDays(new Date(), option.etaDays[1]),
            status: "aguardando_pagamento",
            items: { create: orderItems.map((i) => ({ partId: i.partId, quantity: i.quantity, unitPrice: i.unitPrice, subtotal: i.subtotal })) },
            events: { create: [{ status: "aguardando_pagamento", note: `Pedido criado — ${option.label}` }] },
          },
        });
      });
    } catch (e) {
      if (e instanceof StockError) {
        return NextResponse.json({ error: `Estoque insuficiente para ${e.message}. Atualize o carrinho.` }, { status: 409 });
      }
      throw e;
    }

    let initPoint: string | null = null;
    if (isMercadoPagoConfigured()) {
      const baseUrl = new URL(request.url).origin;
      try {
        const items = orderItems.map((i) => ({ title: i.title, quantity: i.quantity, unitPrice: i.unitPrice }));
        if (option.cost > 0) items.push({ title: `Frete — ${option.label}`, quantity: 1, unitPrice: option.cost });
        const pref = await createCartPreference({ orderId: order.id, items, payerEmail: email, baseUrl });
        initPoint = pref.initPoint;
      } catch (e) {
        console.error("[pecas/pedido] falha ao criar preferência Mercado Pago:", (e as Error).message);
      }
    }

    return NextResponse.json({ ok: true, orderId: order.id, initPoint }, { status: 201 });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/pecas/pedido/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch { /* relatar erro nunca pode gerar outro erro */ }
    console.error("[POST /api/pecas/pedido]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível criar o pedido." }, { status: 500 });
  }
}
