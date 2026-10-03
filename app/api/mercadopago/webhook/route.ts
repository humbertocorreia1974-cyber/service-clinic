import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPayment, mapPaymentMethod, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

async function extractPaymentId(request: Request): Promise<string | null> {
  const url = new URL(request.url);
  const queryId = url.searchParams.get("data.id") || url.searchParams.get("id");
  const topic = url.searchParams.get("type") || url.searchParams.get("topic");
  if (queryId && (!topic || topic === "payment")) return queryId;

  try {
    const body = await request.json();
    if (body?.type === "payment" && body?.data?.id) return String(body.data.id);
  } catch {
    // corpo vazio/não-JSON (ex: ping do Mercado Pago) - sem pagamento pra processar
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`mp-webhook:${ip}`, 60, 60 * 1000)) {
      // não deixa o Mercado Pago entrar num loop de retry por causa do nosso rate limit
      return NextResponse.json({ ok: true });
    }

    if (!isMercadoPagoConfigured()) return NextResponse.json({ ok: true });

    const paymentId = await extractPaymentId(request);
    if (!paymentId) return NextResponse.json({ ok: true });

    // Nunca confia no corpo do webhook pros DADOS do pagamento - só usa ele
    // pra saber QUAL pagamento consultar. A verdade vem sempre da nossa
    // própria chamada autenticada à API do Mercado Pago (padrão recomendado
    // pelo próprio MP — evita ter que validar assinatura de webhook).
    const payment = await getPayment(paymentId);
    if (payment?.status !== "approved") return NextResponse.json({ ok: true });

    const invoiceId = payment.external_reference;
    if (!invoiceId) return NextResponse.json({ ok: true });

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return NextResponse.json({ ok: true });

    const already = await prisma.payment.findFirst({
      where: { invoiceId: invoice.id, reference: String(payment.id) },
    });
    if (already) return NextResponse.json({ ok: true }); // webhook duplicado (MP reenvia) - idempotente

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: payment.transaction_amount ?? invoice.total,
          method: mapPaymentMethod(payment.payment_type_id),
          reference: String(payment.id),
          notes: "Pagamento automático via Mercado Pago",
        },
      }),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "paga", paidAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/mercadopago/webhook/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/mercadopago/webhook]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Mercado Pago às vezes manda a notificação IPN legada via GET.
  return POST(request);
}
