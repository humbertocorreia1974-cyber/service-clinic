import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

const VALID_PERIODICITY = ["mensal", "bimestral", "trimestral", "semestral", "anual"];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!["admin", "gerente"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const clientId = String(body?.clientId ?? "").trim();
    const equipmentId = body?.equipmentId ? String(body.equipmentId).trim() : null;
    const title = String(body?.title ?? "").trim();
    const description = body?.description ? String(body.description).trim() : null;
    const periodicity = String(body?.periodicity ?? "").trim();
    const valueRaw = body?.value;
    const startDateRaw = String(body?.startDate ?? "").trim();
    const endDateRaw = body?.endDate ? String(body.endDate).trim() : null;
    const alertDaysBeforeRaw = body?.alertDaysBefore;
    const autoRenew = body?.autoRenew !== false;

    if (!clientId || !title || !VALID_PERIODICITY.includes(periodicity) || !startDateRaw) {
      return NextResponse.json(
        { error: "Informe cliente, título, periodicidade e data de início." },
        { status: 400 }
      );
    }

    const value = Number(valueRaw);
    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json({ error: "Informe um valor válido para o contrato." }, { status: 400 });
    }

    const startDate = new Date(startDateRaw);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Data de início inválida." }, { status: 400 });
    }
    let endDate: Date | null = null;
    if (endDateRaw) {
      const parsed = new Date(endDateRaw);
      if (!Number.isNaN(parsed.getTime())) endDate = parsed;
    }

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

    if (equipmentId) {
      const eq = await prisma.equipment.findUnique({ where: { id: equipmentId }, select: { id: true, clientId: true } });
      if (!eq || eq.clientId !== clientId) {
        return NextResponse.json({ error: "Equipamento inválido para este cliente." }, { status: 400 });
      }
    }

    let alertDaysBefore = 7;
    if (alertDaysBeforeRaw != null && alertDaysBeforeRaw !== "") {
      const n = Number(alertDaysBeforeRaw);
      if (Number.isFinite(n) && n > 0) alertDaysBefore = Math.round(n);
    }

    const code = `CTR-${Date.now().toString(36).toUpperCase()}`;

    const contract = await prisma.contract.create({
      data: {
        code,
        clientId,
        equipmentId,
        createdById: session.user.id as string,
        title,
        description,
        periodicity,
        value,
        startDate,
        endDate,
        alertDaysBefore,
        autoRenew,
      },
    });

    return NextResponse.json({ ok: true, contract }, { status: 201 });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/contracts/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/contracts]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível criar o contrato." }, { status: 500 });
  }
}
