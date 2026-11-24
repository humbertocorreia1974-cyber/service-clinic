import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { quoteShipping, normalizeZip, zoneOf } from "@/lib/shipping";

export const dynamic = "force-dynamic";

// Cotação de frete: o servidor recalcula subtotal e peso a partir do banco (nunca confia no navegador).
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`pecas-frete:${ip}`, 60, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas consultas. Tente novamente em instantes." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const zip = normalizeZip(String(body?.zip ?? ""));
  const raw = Array.isArray(body?.items) ? body.items : [];
  if (!zoneOf(zip)) return NextResponse.json({ error: "Informe um CEP válido com 8 dígitos." }, { status: 400 });
  if (raw.length === 0 || raw.length > 50) return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });

  const parts = await prisma.part.findMany({
    where: { id: { in: raw.map((i: { partId: unknown }) => String(i.partId)) }, active: true, publicVisible: true },
    select: { id: true, salePrice: true, weightGrams: true },
  });
  const byId = new Map(parts.map((p) => [p.id, p]));
  let subtotal = 0;
  let grams = 0;
  for (const i of raw) {
    const p = byId.get(String(i.partId));
    if (!p) return NextResponse.json({ error: "Uma das peças não está mais disponível." }, { status: 400 });
    const q = Math.max(1, Math.min(999, Math.floor(Number(i.quantity) || 1)));
    subtotal += Number(p.salePrice) * q;
    grams += p.weightGrams * q;
  }
  return NextResponse.json({ ok: true, options: quoteShipping(zip, subtotal, grams) });
}
