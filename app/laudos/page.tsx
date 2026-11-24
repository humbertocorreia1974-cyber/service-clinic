import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Laudos · Service Clinic" };

const TYPE_LABEL: Record<string, string> = {
  tecnico: "Laudo técnico",
  higienizacao_ac: "Higienização de AC",
  pmoc: "PMOC",
  biosseguranca: "Biossegurança",
};
const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  emitido: "Emitido",
  assinado: "Assinado",
  arquivado: "Arquivado",
};

export default async function LaudosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/laudos");

  const role = session.user.role ?? "";
  const isStaff = ["admin", "gerente", "tecnico"].includes(role);
  const isClient = role === "cliente";
  if (!isStaff && !isClient) redirect("/dashboard");

  const laudos = await prisma.laudo.findMany({
    where: isClient ? { client: { userId: session.user.id } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      client: { select: { nomeFantasia: true } },
      equipment: { select: { brand: true, model: true } },
      serviceOrder: { select: { code: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link href={isClient ? "/portal" : "/dashboard"} className="text-sm text-fg-muted transition-colors hover:text-brand">
            ← {isClient ? "Portal" : "Painel"}
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-fg">Laudos</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {isClient ? "Laudos emitidos para os seus equipamentos." : "Laudos técnicos, higienização de AC, PMOC e biossegurança."}
          </p>
        </div>
        {isStaff ? (
          <Link href="/laudos/novo">
            <Button size="sm">Novo laudo</Button>
          </Link>
        ) : null}
      </div>

      {laudos.length === 0 ? (
        <Card>
          <p className="text-sm text-fg-muted">
            {isClient ? "Nenhum laudo emitido para você ainda." : "Nenhum laudo cadastrado ainda. Crie o primeiro a partir de uma ordem de serviço."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {laudos.map((l) => (
            <Link key={l.id} href={`/laudos/${l.id}`} className="block">
              <Card className="flex items-center justify-between gap-4 transition-colors hover:border-brand/40">
                <div className="min-w-0">
                  <CardTitle>
                    {TYPE_LABEL[l.type] ?? l.type} <span className="text-brand">{l.code}</span>
                  </CardTitle>
                  <p className="mt-1 truncate text-xs text-fg-muted">
                    {l.client.nomeFantasia}
                    {l.equipment ? ` · ${l.equipment.brand} ${l.equipment.model}` : ""}
                    {l.serviceOrder ? ` · OS ${l.serviceOrder.code}` : ""}
                    {` · ${new Date(l.createdAt).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-fg-muted">
                  {STATUS_LABEL[l.status] ?? l.status}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
