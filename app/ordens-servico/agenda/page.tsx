import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "../[id]/status-badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agenda de OS · Service Clinic" };

const TYPE_LABEL: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  higienizacao_ac: "Higienização de AC",
  instalacao: "Instalação",
  venda_peca: "Venda de peça",
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default async function AgendaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/ordens-servico/agenda");
  if (!["admin", "gerente"].includes(session.user.role ?? "")) redirect("/dashboard");

  const todayStart = startOfDay(new Date());
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const orders = await prisma.serviceOrder.findMany({
    where: {
      scheduledAt: { gte: todayStart, lt: weekEnd },
      status: { notIn: ["concluida", "cancelada"] },
    },
    include: {
      client: { select: { nomeFantasia: true } },
      technician: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const groups = new Map<string, { name: string; orders: typeof orders }>();
  for (const os of orders) {
    const key = os.technician?.id ?? "sem-tecnico";
    const name = os.technician?.name ?? "Sem técnico atribuído";
    if (!groups.has(key)) groups.set(key, { name, orders: [] });
    groups.get(key)!.orders.push(os);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Painel
      </Link>
      <h1 className="mt-2 mb-1 font-display text-2xl font-bold text-fg">Agenda da semana</h1>
      <p className="mb-6 text-sm text-fg-muted">OS agendadas de hoje até os próximos 7 dias, por técnico.</p>

      {groups.size === 0 ? (
        <Card>
          <p className="text-sm text-fg-muted">Nenhuma OS agendada para os próximos 7 dias.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(groups.values()).map((group) => (
            <div key={group.name}>
              <h2 className="mb-2 text-sm font-semibold text-fg-muted">{group.name}</h2>
              <div className="space-y-2">
                {group.orders.map((os) => (
                  <Link key={os.id} href={`/ordens-servico/${os.id}`}>
                    <Card className="flex items-center justify-between transition-transform hover:-translate-y-0.5">
                      <div>
                        <p className="font-medium text-fg">
                          {os.code} · {os.client.nomeFantasia}
                        </p>
                        <p className="mt-1 text-xs text-fg-muted">
                          {os.scheduledAt
                            ? os.scheduledAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                            : "Sem horário"}{" "}
                          · {TYPE_LABEL[os.type] ?? os.type} · {os.city}
                        </p>
                      </div>
                      <StatusBadge status={os.status} />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
