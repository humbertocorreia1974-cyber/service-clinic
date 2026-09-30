import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./[id]/status-badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ordens de Serviço · Service Clinic" };

const TYPE_LABEL: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  higienizacao_ac: "Higienização de AC",
  instalacao: "Instalação",
  venda_peca: "Venda de peça",
};

export default async function OrdensServicoListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/ordens-servico");

  const role = session.user.role;
  const where =
    role === "tecnico"
      ? { assignedToId: session.user.id }
      : ["admin", "gerente"].includes(role)
      ? {}
      : null;

  if (where === null) redirect("/dashboard");

  const orders = await prisma.serviceOrder.findMany({
    where,
    include: {
      client: { select: { nomeFantasia: true } },
      technician: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Painel
      </Link>
      <h1 className="mt-2 mb-6 font-display text-2xl font-bold text-fg">Ordens de Serviço</h1>

      {orders.length === 0 ? (
        <Card>
          <p className="text-sm text-fg-muted">Nenhuma ordem de serviço ainda.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((os) => (
            <Link key={os.id} href={`/ordens-servico/${os.id}`}>
              <Card className="flex items-center justify-between transition-transform hover:-translate-y-0.5">
                <div>
                  <p className="font-medium text-fg">
                    {os.code} · {os.client.nomeFantasia}
                  </p>
                  <p className="mt-1 text-xs text-fg-muted">
                    {TYPE_LABEL[os.type] ?? os.type} · {os.city} · {os.technician?.name ?? "Não atribuído"}
                  </p>
                </div>
                <StatusBadge status={os.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
