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
      select: { id: true, assignedToId: true },
    });
    if (!os) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (session.user.role === "tecnico" && os.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const materialsPlanned = body?.materialsPlanned != null ? String(body.materialsPlanned).slice(0, 4000) : undefined;
    const materialsUsed = body?.materialsUsed != null ? String(body.materialsUsed).slice(0, 4000) : undefined;

    const updated = await prisma.serviceOrder.update({
      where: { id: os.id },
      data: { materialsPlanned, materialsUsed },
    });

    return NextResponse.json({ ok: true, serviceOrder: updated });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/service-orders/[id]/materials/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/service-orders/[id]/materials]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível salvar os materiais." }, { status: 500 });
  }
}
