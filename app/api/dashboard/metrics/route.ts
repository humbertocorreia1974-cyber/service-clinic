import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildLeadFunnel, buildOsStatusBreakdown, buildTechnicianProductivity } from "@/lib/dashboard-metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["admin", "gerente"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [faturamentoAgg, osPorStatus, leadsPorStatus, produtividadeRows, tecnicos] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: "paga", paidAt: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.serviceOrder.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.serviceOrder.groupBy({
      by: ["technicianId"],
      _count: { _all: true },
      where: { status: "concluida", finishedAt: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.technician.findMany({ select: { id: true, name: true } }),
  ]);

  const technicianNames = Object.fromEntries(tecnicos.map((t) => [t.id, t.name]));

  return NextResponse.json({
    faturamentoMes: Number(faturamentoAgg._sum.total ?? 0),
    osPorStatus: buildOsStatusBreakdown(osPorStatus),
    leadsFunil: buildLeadFunnel(leadsPorStatus),
    produtividadeTecnicos: buildTechnicianProductivity(produtividadeRows, technicianNames),
    geradoEm: now.toISOString(),
  });
}
