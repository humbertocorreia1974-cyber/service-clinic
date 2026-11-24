import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Consulta pública: código do pedido + e-mail usado na compra → devolve o id da página de acompanhamento.
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`pecas-rastreio:${ip}`, 15, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas consultas. Tente novamente em instantes." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase();
  const email = String(body?.email ?? "").trim();
  if (!code || !email) return NextResponse.json({ error: "Informe o código do pedido e o e-mail da compra." }, { status: 400 });
  const order = await prisma.partOrder.findFirst({
    where: { code, customerEmail: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  // mesma resposta para "não existe" e "e-mail não confere": não revela quais pedidos existem
  if (!order) return NextResponse.json({ error: "Não encontramos um pedido com esses dados." }, { status: 404 });
  return NextResponse.json({ ok: true, orderId: order.id });
}
