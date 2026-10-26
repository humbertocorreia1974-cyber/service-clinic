import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { ContractStatusBadge, SignatureStatusBadge } from "./status-badge";
import { ContractSignatureClient } from "./signature-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const contract = await prisma.contract.findUnique({ where: { id: params.id }, select: { code: true } });
  return {
    title: contract ? `Contrato ${contract.code} — Service Clinic` : "Contrato — Service Clinic",
    description: "Detalhe do contrato de manutenção recorrente: periodicidade, próxima visita e assinatura.",
  };
}

const PERIODICITY_LABEL: Record<string, string> = {
  mensal: "Mensal",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?next=/contratos/${params.id}`);

  const role = session.user.role ?? "";
  if (!["admin", "gerente", "tecnico"].includes(role)) redirect("/dashboard");

  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      equipment: true,
      createdBy: { select: { id: true, name: true } },
      signatures: { orderBy: { signedAt: "desc" }, take: 1 },
    },
  });

  if (!contract) notFound();

  const canEdit = role === "admin" || role === "gerente" || role === "tecnico";
  const lastSig = contract.signatures[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/contratos" className="text-sm text-fg-muted hover:text-brand transition-colors">
            ← Voltar para Contratos
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-fg">
            Contrato <span className="text-brand">{contract.code}</span>
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {contract.client.nomeFantasia} · {PERIODICITY_LABEL[contract.periodicity] ?? contract.periodicity}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ContractStatusBadge status={contract.status} />
          <SignatureStatusBadge signed={!!lastSig} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle>{contract.title}</CardTitle>
            <CardBody>
              <p className="whitespace-pre-wrap text-sm text-fg">{contract.description || "Sem descrição registrada."}</p>
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Assinatura do contrato</CardTitle>
            <CardBody>
              {lastSig ? (
                <div className="space-y-2 text-sm">
                  <p className="text-fg">
                    Assinado por <strong>{lastSig.signerName}</strong>
                    {lastSig.signerDocument ? ` (${lastSig.signerDocument})` : ""}
                  </p>
                  <p className="text-fg-muted">
                    Em {new Date(lastSig.signedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              ) : (
                <ContractSignatureClient contractId={contract.id} canEdit={canEdit} />
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Cliente</CardTitle>
            <CardBody>
              <p className="font-medium text-fg">{contract.client.nomeFantasia}</p>
              <p className="text-sm text-fg-muted">{contract.client.razaoSocial}</p>
              <p className="mt-2 text-sm text-fg-muted">
                {contract.client.addressStreet ?? ""} {contract.client.addressNumber ?? ""}
                <br />
                {contract.client.addressCity} — {contract.client.addressState}
              </p>
              <p className="mt-2 text-sm text-fg-muted">Tel: {contract.client.phone}</p>
              <Link href={`/clientes/${contract.client.id}`} className="mt-3 inline-block text-sm text-brand hover:underline">
                Ver ficha do cliente →
              </Link>
            </CardBody>
          </Card>

          {contract.equipment && (
            <Card>
              <CardTitle>Equipamento</CardTitle>
              <CardBody>
                <div className="text-sm">
                  <p className="font-medium text-fg">{contract.equipment.brand} {contract.equipment.model}</p>
                  <p className="text-fg-muted">S/N: {contract.equipment.serialNumber}</p>
                  <p className="text-fg-muted">Categoria: {contract.equipment.category}</p>
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardTitle>Vigência</CardTitle>
            <CardBody>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Início</dt>
                  <dd className="text-fg">{new Date(contract.startDate).toLocaleDateString("pt-BR")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Término</dt>
                  <dd className="text-fg">{contract.endDate ? new Date(contract.endDate).toLocaleDateString("pt-BR") : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Próxima visita</dt>
                  <dd className="text-fg">{contract.nextVisitAt ? new Date(contract.nextVisitAt).toLocaleDateString("pt-BR") : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Renovação automática</dt>
                  <dd className="text-fg">{contract.autoRenew ? "Sim" : "Não"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Valor</dt>
                  <dd className="text-fg">R$ {Number(contract.value).toFixed(2)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
