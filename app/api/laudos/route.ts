import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["tecnico", "higienizacao_ac", "pmoc", "biosseguranca"];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const role = session.user.role ?? "";
    if (!["admin", "gerente", "tecnico"].includes(role)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const serviceOrderId = body?.serviceOrderId ? String(body.serviceOrderId) : null;
    const type = String(body?.type ?? "").trim();
    const title = String(body?.title ?? "").trim();
    const diagnosis = body?.diagnosis ? String(body.diagnosis).trim() : null;
    const solution = body?.solution ? String(body.solution).trim() : null;
    const observations = body?.observations ? String(body.observations).trim() : null;
    const photos = Array.isArray(body?.photos)
      ? body.photos.filter((p: any) => typeof p?.url === "string").map((p: any) => ({ url: p.url, caption: p.caption ?? null }))
      : [];

    if (!VALID_TYPES.includes(type) || !title) {
      return NextResponse.json({ error: "Informe o tipo e o título do laudo." }, { status: 400 });
    }
    if (!serviceOrderId) {
      return NextResponse.json({ error: "Laudo precisa estar vinculado a uma ordem de serviço." }, { status: 400 });
    }

    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      select: { id: true, clientId: true, equipmentId: true, assignedToId: true },
    });
    if (!serviceOrder) return NextResponse.json({ error: "Ordem de serviço não encontrada." }, { status: 404 });
    if (role === "tecnico" && serviceOrder.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const code = `LAUDO-${Date.now().toString(36).toUpperCase()}`;

    const laudo = await prisma.laudo.create({
      data: {
        code,
        serviceOrderId: serviceOrder.id,
        clientId: serviceOrder.clientId,
        equipmentId: serviceOrder.equipmentId,
        createdById: session.user.id as string,
        type,
        title,
        content: { diagnosis, solution, observations, photos },
        status: "rascunho",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "create",
        entity: "Laudo",
        entityId: laudo.id,
        metadata: { serviceOrderId: serviceOrder.id, type },
      },
    });

    return NextResponse.json({ ok: true, laudo }, { status: 201 });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/laudos/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch { /* relatar erro nunca pode gerar outro erro */ }
    console.error("[POST /api/laudos]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível criar o laudo." }, { status: 500 });
  }
}
