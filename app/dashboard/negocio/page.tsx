import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildLeadFunnel, buildOsStatusBreakdown, buildTechnicianProductivity } from "@/lib/dashboard-metrics";
import { MetricsClient } from "./metrics-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel de Negócio · Service Clinic" };

export default async function NegocioDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/dashboard/negocio");
  if (!["admin", "gerente"].includes(session.user.role ?? "")) redirect("/dashboard");

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

  const initial = {
    faturamentoMes: Number(faturamentoAgg._sum.total ?? 0),
    osPorStatus: buildOsStatusBreakdown(osPorStatus),
    leadsFunil: buildLeadFunnel(leadsPorStatus),
    produtividadeTecnicos: buildTechnicianProductivity(produtividadeRows, technicianNames),
    geradoEm: now.toISOString(),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-fg">Painel de Negócio</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Visão de faturamento, operação e funil de leads — pra quem decide, não só pra quem executa.
      </p>
      <MetricsClient initial={initial} />
    </div>
  );
}
