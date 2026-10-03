import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

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
      select: { id: true, clientId: true, status: true },
    });
    if (!os || os.clientId !== client.id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (os.status !== "concluida") {
      return NextResponse.json({ error: "A avaliação só pode ser enviada após a conclusão do serviço." }, { status: 400 });
    }

    const existing = await prisma.review.findUnique({ where: { serviceOrderId: os.id } });
    if (existing) {
      return NextResponse.json({ error: "Esta ordem de serviço já foi avaliada." }, { status: 409 });
    }

    const body = await request.json().catch(() => null);
    const rating = Number(body?.rating);
    const comment = body?.comment ? String(body.comment).trim().slice(0, 2000) : null;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Nota inválida (use de 1 a 5)." }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: { serviceOrderId: os.id, clientId: client.id, rating, comment },
    });

    return NextResponse.json({ ok: true, review }, { status: 201 });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/service-orders/[id]/review/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/service-orders/[id]/review]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível registrar a avaliação." }, { status: 500 });
  }
}
