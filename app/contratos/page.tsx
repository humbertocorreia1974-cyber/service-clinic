import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ContractStatusBadge, SignatureStatusBadge } from "./[id]/status-badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contratos · Service Clinic" };

const PERIODICITY_LABEL: Record<string, string> = {
  mensal: "Mensal",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export default async function ContratosListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/contratos");

  const role = session.user.role ?? "";
  if (!["admin", "gerente", "tecnico"].includes(role)) redirect("/dashboard");

  const contracts = await prisma.contract.findMany({
    include: {
      client: { select: { nomeFantasia: true } },
      signatures: { orderBy: { signedAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Painel
      </Link>
      <div className="mt-2 mb-6">
        <h1 className="font-display text-2xl font-bold text-fg">Contratos</h1>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <p className="text-sm text-fg-muted">Nenhum contrato ainda.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <Link key={contract.id} href={`/contratos/${contract.id}`}>
              <Card className="flex items-center justify-between transition-transform hover:-translate-y-0.5">
                <div>
                  <p className="font-medium text-fg">
                    {contract.code} · {contract.client.nomeFantasia}
                  </p>
                  <p className="mt-1 text-xs text-fg-muted">
                    {contract.title} · {PERIODICITY_LABEL[contract.periodicity] ?? contract.periodicity} · R$ {Number(contract.value).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SignatureStatusBadge signed={contract.signatures.length > 0} />
                  <ContractStatusBadge status={contract.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
