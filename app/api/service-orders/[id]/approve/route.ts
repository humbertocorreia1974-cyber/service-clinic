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
    if (session.user.role !== "cliente") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const client = await prisma.client.findUnique({ where: { userId: session.user.id } });
    if (!client) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const os = await prisma.serviceOrder.findUnique({
      where: { id: params.id },
      select: { id: true, clientId: true, code: true, clientApprovedAt: true, createdById: true },
    });
    if (!os || os.clientId !== client.id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (os.clientApprovedAt) {
      return NextResponse.json({ ok: true, alreadyApproved: true });
    }

    const updated = await prisma.serviceOrder.update({
      where: { id: os.id },
      data: { clientApprovedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: os.createdById,
        title: `Orçamento aprovado: ${os.code}`,
        body: `${client.nomeFantasia} aprovou o orçamento/execução da OS ${os.code}.`,
        kind: "sistema",
        link: `/ordens-servico/${os.id}`,
      },
    });

    return NextResponse.json({ ok: true, serviceOrder: updated });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/service-orders/[id]/approve/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/service-orders/[id]/approve]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível aprovar." }, { status: 500 });
  }
}
