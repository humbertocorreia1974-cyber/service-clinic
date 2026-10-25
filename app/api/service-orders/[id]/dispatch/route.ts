import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

// Mesma duração padrão usada em app/api/public/availability/route.ts para
// checagem de conflito de horário (a ServiceOrder não tem campo de duração
// próprio, só Visit/Appointment têm).
const DEFAULT_DURATION_MIN = 40;

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const role = session.user.role ?? "";
    if (!["admin", "gerente"].includes(role)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const technicianId: string | null = body?.technicianId ?? null;
    const scheduledAtRaw = body?.scheduledAt;
    if (!scheduledAtRaw) {
      return NextResponse.json({ error: "scheduledAt_required" }, { status: 400 });
    }
    const scheduledAt = new Date(scheduledAtRaw);
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "invalid_scheduledAt" }, { status: 400 });
    }

    const os = await prisma.serviceOrder.findUnique({
      where: { id: params.id },
      select: { id: true, code: true },
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

      // Checagem de conflito: o técnico não pode ter 2 OS no mesmo horário
      // (mesma lógica de overlap de app/api/public/availability/route.ts).
      const newStartMs = scheduledAt.getTime();
      const newEndMs = newStartMs + DEFAULT_DURATION_MIN * 60000;

      const candidates = await prisma.serviceOrder.findMany({
        where: {
          technicianId,
          id: { not: params.id },
          status: { notIn: ["concluida", "cancelada"] },
          scheduledAt: { not: null },
        },
        select: { id: true, code: true, scheduledAt: true },
      });

      const conflict = candidates.find((c) => {
        if (!c.scheduledAt) return false;
        const cStartMs = new Date(c.scheduledAt).getTime();
        const cEndMs = cStartMs + DEFAULT_DURATION_MIN * 60000;
        return overlaps(newStartMs, newEndMs, cStartMs, cEndMs);
      });

      if (conflict) {
        return NextResponse.json(
          {
            error: "conflict",
            conflict: { id: conflict.id, code: conflict.code, scheduledAt: conflict.scheduledAt },
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.serviceOrder.update({
      where: { id: params.id },
      data: { technicianId, assignedToId, scheduledAt },
    });

    if (assignedToId) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          title: `OS redespachada: ${os.code}`,
          body: `Nova agenda: ${scheduledAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.`,
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
        metadata: { action: "dispatch", technicianId, scheduledAt: scheduledAt.toISOString() },
      },
    });

    return NextResponse.json({ ok: true, serviceOrder: updated });
  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/service-orders/[id]/dispatch/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) {
      /* relatar erro nunca pode gerar outro erro */
    }
    throw __jgnextApiErrorReportErr;
  }
}
