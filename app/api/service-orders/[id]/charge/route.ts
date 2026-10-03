import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!["tecnico", "admin", "gerente"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const os = await prisma.serviceOrder.findUnique({
      where: { id: params.id },
      select: { id: true, code: true, clientId: true, assignedToId: true, status: true, totalValue: true },
    });
    if (!os) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (session.user.role === "tecnico" && os.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (os.status !== "concluida") {
      return NextResponse.json({ error: "Só é possível cobrar uma OS concluída." }, { status: 400 });
    }
    if (!os.totalValue || Number(os.totalValue) <= 0) {
      return NextResponse.json({ error: "Informe o valor da OS antes de enviar a cobrança." }, { status: 400 });
    }

    const existingItem = await prisma.invoiceItem.findFirst({ where: { serviceOrderId: os.id } });
    if (existingItem) {
      return NextResponse.json({ error: "Já existe uma cobrança enviada para esta OS." }, { status: 409 });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const invoice = await prisma.invoice.create({
      data: {
        number: `OS-${os.code}`,
        clientId: os.clientId,
        dueDate,
        subtotal: os.totalValue,
        total: os.totalValue,
        status: "pendente",
        items: {
          create: [
            {
              serviceOrderId: os.id,
              description: `Serviço — OS ${os.code}`,
              quantity: 1,
              unitPrice: os.totalValue,
              total: os.totalValue,
              kind: "servico",
            },
          ],
        },
      },
    });

    const client = await prisma.client.findUnique({ where: { id: os.clientId }, select: { userId: true } });
    if (client?.userId) {
      await prisma.notification.create({
        data: {
          userId: client.userId,
          title: `Cobrança enviada — OS ${os.code}`,
          body: `Valor de R$ ${Number(os.totalValue).toFixed(2)} referente à OS ${os.code}. Pague via PIX, cartão ou dinheiro — nossa equipe confirma o recebimento.`,
          kind: "pagamento_recebido",
          link: "/portal",
        },
      });
    }

    return NextResponse.json({ ok: true, invoice }, { status: 201 });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/service-orders/[id]/charge/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/service-orders/[id]/charge]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível enviar a cobrança." }, { status: 500 });
  }
}
