import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const role = session.user.role;
  if (!["admin", "gerente"].includes(role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const technicianId: string | null = body?.technicianId ?? null;

  const os = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    select: { id: true, code: true, technicianId: true },
  });
  if (!os) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let assignedToId: string | null = null;
  if (technicianId) {
    const tech = await prisma.technician.findUnique({
      where: { id: technicianId },
      select: { id: true, userId: true, name: true },
    });
    if (!tech) return NextResponse.json({ error: "technician_not_found" }, { status: 404 });
    assignedToId = tech.userId;
  }

  const updated = await prisma.serviceOrder.update({
    where: { id: params.id },
    data: { technicianId, assignedToId },
  });

  if (assignedToId) {
    await prisma.notification.create({
      data: {
        userId: assignedToId,
        title: `Nova OS atribuída: ${os.code}`,
        body: "Você foi designado para uma nova ordem de serviço. Confira os detalhes.",
        kind: "os_atribuida",
        link: `/ordens-servico/${os.id}`,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "update",
      entity: "ServiceOrder",
      entityId: os.id,
      metadata: { action: "assign", technicianId },
    },
  });

  return NextResponse.json({ ok: true, serviceOrder: updated });

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/service-orders/[id]/assign/route.ts",
        message: __jgnextApiErrorReportErr?.message || String(__jgnextApiErrorReportErr),
        stack: __jgnextApiErrorReportErr?.stack,
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
