import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// aberta -> a_caminho -> em_andamento -> concluida (ou cancelada, tratado à parte)
const NEXT_STATUS: Record<string, string> = {
  aberta: "a_caminho",
  a_caminho: "em_andamento",
  em_andamento: "concluida",
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!["tecnico", "admin", "gerente"].includes(session.user.role)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const os = await prisma.serviceOrder.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, assignedToId: true, code: true, clientId: true },
    });
    if (!os) return NextResponse.json({ error: "not_found" }, { status: 404 });

    if (session.user.role === "tecnico" && os.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const expected = NEXT_STATUS[os.status];
    if (!expected) {
      return NextResponse.json({ error: `Não há transição a partir de "${os.status}".` }, { status: 400 });
    }

    const data: Record<string, unknown> = { status: expected };
    if (expected === "em_andamento") data.startedAt = new Date();
    if (expected === "concluida") data.finishedAt = new Date();

    const updated = await prisma.serviceOrder.update({ where: { id: os.id }, data });

    const client = await prisma.client.findUnique({ where: { id: os.clientId }, select: { userId: true } });
    if (client?.userId) {
      const LABEL: Record<string, string> = {
        a_caminho: "o técnico está a caminho",
        em_andamento: "o atendimento foi iniciado",
        concluida: "o serviço foi concluído",
      };
      await prisma.notification.create({
        data: {
          userId: client.userId,
          title: `Atualização da OS ${os.code}`,
          body: `Sua ordem de serviço foi atualizada: ${LABEL[expected] ?? expected}.`,
          kind: "sistema",
          link: "/portal",
        },
      });
    }

    return NextResponse.json({ ok: true, serviceOrder: updated });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/service-orders/[id]/status/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/service-orders/[id]/status]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível atualizar o status." }, { status: 500 });
  }
}
