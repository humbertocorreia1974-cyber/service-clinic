import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createCartPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`pecas-pedido:${ip}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Muitas solicitações. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const rawItems = Array.isArray(body?.items) ? body.items : [];
    const customer = body?.customer || {};

    if (rawItems.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
    }

    const name = String(customer.name ?? "").trim();
    const phone = String(customer.phone ?? "").trim();
    const email = String(customer.email ?? "").trim();
    const addressCity = String(customer.addressCity ?? "").trim();
    if (!name || !phone || !email || !addressCity) {
      return NextResponse.json({ error: "Preencha nome, telefone, e-mail e cidade." }, { status: 400 });
    }

    // Nunca confia no preço/estoque vindo do navegador - revalida tudo contra o banco.
    const partIds = rawItems.map((i: any) => String(i.partId));
    const parts = await prisma.part.findMany({
      where: { id: { in: partIds }, active: true, publicVisible: true },
    });
    const partMap = new Map(parts.map((p) => [p.id, p]));

    const orderItems: { partId: string; quantity: number; unitPrice: number; subtotal: number; title: string }[] = [];
    for (const raw of rawItems) {
      const part = partMap.get(String(raw.partId));
      const qty = Math.max(1, Math.floor(Number(raw.quantity) || 1));
      if (!part) {
        return NextResponse.json({ error: "Uma das peças não está mais disponível." }, { status: 400 });
      }
      if (qty > part.stockQty) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${part.name} (disponível: ${part.stockQty}).` },
          { status: 409 }
        );
      }
      const unitPrice = Number(part.salePrice);
      orderItems.push({ partId: part.id, quantity: qty, unitPrice, subtotal: unitPrice * qty, title: part.name });
    }

    const subtotal = orderItems.reduce((acc, i) => acc + i.subtotal, 0);
    const code = `PED-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.partOrder.create({
      data: {
        code,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        addressStreet: customer.addressStreet ?? null,
        addressNumber: customer.addressNumber ?? null,
        addressDistrict: customer.addressDistrict ?? null,
        addressCity,
        addressState: customer.addressState || "RJ",
        addressZip: customer.addressZip ?? null,
        notes: customer.notes ?? null,
        subtotal,
        total: subtotal,
        status: "aguardando_pagamento",
        items: {
          create: orderItems.map((i) => ({
            partId: i.partId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
          })),
        },
      },
    });

    let initPoint: string | null = null;
    if (isMercadoPagoConfigured()) {
      const baseUrl = new URL(request.url).origin;
      try {
        const pref = await createCartPreference({
          orderId: order.id,
          items: orderItems.map((i) => ({ title: i.title, quantity: i.quantity, unitPrice: i.unitPrice })),
          payerEmail: email,
          baseUrl,
        });
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
