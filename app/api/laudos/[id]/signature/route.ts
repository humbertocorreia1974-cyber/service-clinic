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
    if (!["admin", "gerente", "tecnico"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.signatureData !== "string") {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const laudo = await prisma.laudo.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!laudo) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const updated = await prisma.laudo.update({
      where: { id: params.id },
      data: {
        signatureData: body.signatureData,
        signedById: session.user.id as string,
        signedAt: new Date(),
        status: "assinado",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "update",
        entity: "Laudo",
        entityId: updated.id,
        metadata: { action: "sign" },
      },
    });

    return NextResponse.json({ ok: true, laudo: { id: updated.id, signedAt: updated.signedAt } });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/laudos/[id]/signature/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch { /* relatar erro nunca pode gerar outro erro */ }
    console.error("[POST /api/laudos/[id]/signature]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível registrar a assinatura." }, { status: 500 });
  }
}
