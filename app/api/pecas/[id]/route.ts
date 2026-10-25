import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "gerente"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const data: Record<string, unknown> = {};

    if (body?.stockQty != null) {
      const stockQty = Number(body.stockQty);
      if (!Number.isFinite(stockQty) || stockQty < 0) {
        return NextResponse.json({ error: "Quantidade inválida." }, { status: 400 });
      }
      data.stockQty = Math.trunc(stockQty);
    }
    if (body?.minStockQty != null) {
      const minStockQty = Number(body.minStockQty);
      if (!Number.isFinite(minStockQty) || minStockQty < 0) {
        return NextResponse.json({ error: "Estoque mínimo inválido." }, { status: 400 });
      }
      data.minStockQty = Math.trunc(minStockQty);
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
    }

    const current = await prisma.part.findUnique({ where: { id: params.id }, select: { stockQty: true } });
    if (!current) {
      return NextResponse.json({ error: "Peça não encontrada." }, { status: 404 });
    }
    const delta = typeof data.stockQty === "number" ? (data.stockQty as number) - current.stockQty : 0;

    const [part] = await prisma.$transaction([
      prisma.part.update({
        where: { id: params.id },
        data,
        select: { id: true, stockQty: true, minStockQty: true },
      }),
      ...(delta !== 0
        ? [
            prisma.stockMovement.create({
              data: {
                partId: params.id,
                userId: session.user.id,
                kind: "ajuste",
                quantity: delta,
                reason: "Ajuste manual via tela de estoque",
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ ok: true, part });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/pecas/[id]/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[PATCH /api/pecas/[id]]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível atualizar a peça." }, { status: 500 });
  }
}
