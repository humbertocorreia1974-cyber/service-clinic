import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`pecas-review:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Muitas avaliações enviadas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

    const part = await prisma.part.findUnique({
      where: { id: params.id },
      select: { id: true, active: true, publicVisible: true },
    });
    if (!part || !part.active || !part.publicVisible) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const authorName = String(body?.authorName ?? "").trim().slice(0, 120);
    const rating = Number(body?.rating);
    const comment = body?.comment ? String(body.comment).trim().slice(0, 2000) : null;

    if (!authorName) {
      return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Nota inválida (use de 1 a 5)." }, { status: 400 });
    }

    const review = await prisma.partReview.create({
      data: { partId: part.id, authorName, rating, comment },
    });

    return NextResponse.json({ ok: true, review }, { status: 201 });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/pecas/[id]/reviews/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch { /* relatar erro nunca pode gerar outro erro */ }
    console.error("[POST /api/pecas/[id]/reviews]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível enviar a avaliação." }, { status: 500 });
  }
}
