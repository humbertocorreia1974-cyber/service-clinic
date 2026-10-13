import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["novo", "contatado", "qualificado", "convertido", "perdido"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "gerente"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const data: Record<string, unknown> = {};
    if (body?.status && VALID_STATUS.includes(body.status)) data.status = body.status;
    if (typeof body?.notes === "string") data.notes = body.notes.trim() || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
    }

    const lead = await prisma.lead.update({ where: { id: params.id }, data });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id as string,
        action: "update",
        entity: "Lead",
        entityId: lead.id,
        metadata: data,
      },
    });

    return NextResponse.json({ ok: true, lead });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/leads/[id]/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch { /* relatar erro nunca pode gerar outro erro */ }
    console.error("[PATCH /api/leads/[id]]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível atualizar o lead." }, { status: 500 });
  }
}
