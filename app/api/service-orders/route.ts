import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStack } from "@/lib/error-info";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["preventiva", "corretiva", "higienizacao_ac", "instalacao", "venda_peca"];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!["admin", "gerente"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const clientId = String(body?.clientId ?? "").trim();
    const type = String(body?.type ?? "").trim();
    const city = String(body?.city ?? "").trim();
    const description = body?.description ? String(body.description).trim() : null;
    const address = body?.address ? String(body.address).trim() : null;
    const technicianId = body?.technicianId ? String(body.technicianId).trim() : null;
    const scheduledAtRaw = body?.scheduledAt ? String(body.scheduledAt) : null;
    const totalValueRaw = body?.totalValue;

    if (!clientId || !VALID_TYPES.includes(type) || !city) {
      return NextResponse.json(
        { error: "Informe cliente, tipo de serviço e cidade." },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

    let assignedToId: string | null = null;
    if (technicianId) {
      const tech = await prisma.technician.findUnique({
        where: { id: technicianId },
        select: { id: true, userId: true },
      });
      if (!tech) return NextResponse.json({ error: "Técnico não encontrado." }, { status: 404 });
      assignedToId = tech.userId;
    }

    let scheduledAt: Date | null = null;
    if (scheduledAtRaw) {
      const parsed = new Date(scheduledAtRaw);
      if (!Number.isNaN(parsed.getTime())) scheduledAt = parsed;
    }

    let totalValue: number | null = null;
    if (totalValueRaw != null && totalValueRaw !== "") {
      const n = Number(totalValueRaw);
      if (!Number.isNaN(n) && n > 0) totalValue = n;
    }

    const code = `OS-${Date.now().toString(36).toUpperCase()}`;

    // session.user.id vem sempre preenchido aqui (callback jwt/session em
    // lib/auth.ts sempre define) — o tipo é opcional só porque o augmento
    // do next-auth declara `id?: string` de forma genérica.
    const os = await prisma.serviceOrder.create({
      data: {
        code,
        clientId,
        technicianId,
        assignedToId,
        createdById: session.user.id as string,
        type,
        city,
        address,
        description,
        scheduledAt,
        totalValue,
      },
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

    return NextResponse.json({ ok: true, serviceOrder: os }, { status: 201 });
  } catch (__jgnextApiErrorReportErr) {
    try {
      const { reportRuntimeError } = await import("@/lib/runtime-error-reporter");
      await reportRuntimeError({
        type: "server",
        file: "app/api/service-orders/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch {
      /* relatar erro nunca pode gerar outro erro */
    }
    console.error("[POST /api/service-orders]", __jgnextApiErrorReportErr);
    return NextResponse.json({ error: "Não foi possível criar a ordem de serviço." }, { status: 500 });
  }
}
