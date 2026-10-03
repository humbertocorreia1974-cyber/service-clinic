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
  const role = session.user.role ?? "";
  if (!["admin", "gerente", "tecnico"].includes(role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.itemId !== "string" || typeof body.done !== "boolean") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const item = await prisma.serviceOrderChecklist.findUnique({ where: { id: body.itemId } });
  if (!item || item.serviceOrderId !== params.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updated = await prisma.serviceOrderChecklist.update({
    where: { id: body.itemId },
    data: { done: body.done },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "update",
      entity: "ServiceOrderChecklist",
      entityId: updated.id,
      metadata: { serviceOrderId: params.id, done: body.done },
    },
  });

  return NextResponse.json({ ok: true, item: updated });

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/service-orders/[id]/checklist/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
