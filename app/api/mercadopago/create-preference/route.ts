import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    if (!checkRateLimit(`mp-preference:${session.user.id}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Muitas solicitações. Tente novamente em alguns minutos." }, { status: 429 });
    }

    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({ error: "Pagamento online ainda não está disponível." }, { status: 503 });
    }

    const { invoiceId } = await request.json();
    if (!invoiceId || typeof invoiceId !== "string") {
      return NextResponse.json({ error: "invoiceId é obrigatório." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { userId: session.user.id } });
    if (!client) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.clientId !== client.id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (invoice.status !== "pendente") {
      return NextResponse.json({ error: "Esta cobrança não está mais pendente." }, { status: 409 });
    }

    const baseUrl = new URL(request.url).origin;
    const { initPoint } = await createPreference({
      invoiceId: invoice.id,
      title: `Fatura ${invoice.number} — Service Clinic`,
      amount: Number(invoice.total),
      payerEmail: client.email,
      baseUrl,
    });

    return NextResponse.json({ ok: true, initPoint });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/mercadopago/create-preference/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/mercadopago/create-preference]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento agora." }, { status: 500 });
  }
}
