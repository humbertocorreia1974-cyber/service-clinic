import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { ChecklistClient } from "./checklist-client";
import { AssignClient } from "./assign-client";
import { SignatureClient } from "./signature-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const os = await prisma.serviceOrder.findUnique({ where: { id: params.id }, select: { code: true } });
  return {
    title: os ? `OS ${os.code} — Service Clinic` : "Ordem de Serviço — Service Clinic",
    description: "Detalhe da ordem de serviço: checklist, fotos, assinatura do cliente e laudo técnico.",
    openGraph: { title: "Ordem de Serviço — Service Clinic", description: "Acompanhe o andamento da OS em tempo real." },
  };
}

const TYPE_LABEL: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  higienizacao_ac: "Higienização de AC",
  instalacao: "Instalação",
  venda_peca: "Venda de peça",
};

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?next=/ordens-servico/${params.id}`);

  const os = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      equipment: true,
      technician: { include: { user: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      checklists: { orderBy: { order: "asc" } },
      photos: { orderBy: { createdAt: "asc" } },
      signatures: { orderBy: { signedAt: "desc" }, take: 1 },
      laudos: { select: { id: true, code: true, type: true, status: true } },
    },
  });

  if (!os) notFound();

  const role = session.user.role;
  const isClient = role === "cliente";
  if (isClient && os.client.userId !== session.user.id) redirect("/portal");

  const technicians = !isClient
    ? await prisma.technician.findMany({
        where: { active: true },
        select: { id: true, name: true, cities: true, specialties: true },
        orderBy: { name: "asc" },
      })
    : [];

  const canEdit = role === "admin" || role === "gerente" || role === "tecnico";
  const lastSig = os.signatures[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/ordens-servico" className="text-sm text-fg-muted hover:text-brand transition-colors">
            ← Voltar para Ordens de Serviço
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-fg">
            OS <span className="text-brand">{os.code}</span>
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {os.client.nomeFantasia} · {os.city} · {TYPE_LABEL[os.type] ?? os.type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={os.status} />
          <StatusBadge status={os.priority} kind="priority" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle>Descrição do chamado</CardTitle>
            <CardBody>
              <p className="whitespace-pre-wrap text-sm text-fg">{os.description || "Sem descrição registrada."}</p>
              {os.diagnosis && (
                <div className="mt-4 rounded-md border border-border bg-bg/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-fg-muted">Diagnóstico técnico</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-fg">{os.diagnosis}</p>
                </div>
              )}
              {os.solution && (
                <div className="mt-3 rounded-md border border-border bg-bg/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-fg-muted">Solução aplicada</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-fg">{os.solution}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Checklist técnico</CardTitle>
            <CardBody>
              <ChecklistClient
                serviceOrderId={os.id}
                canEdit={canEdit}
                items={os.checklists.map((c) => ({
                  id: c.id,
                  itemKey: c.itemKey,
                  itemLabel: c.itemLabel,
                  itemGroup: c.itemGroup,
                  done: c.done,
                  notes: c.notes,
                }))}
              />
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Fotos antes / depois</CardTitle>
            <CardBody>
              {os.photos.length === 0 ? (
                <p className="text-sm text-fg-muted">Nenhuma foto anexada ainda.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {os.photos.map((p) => (
                    <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-md border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.caption ?? p.kind} className="h-32 w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                      <div className="bg-surface/70 px-2 py-1 text-xs text-fg-muted">{p.kind}</div>
                    </a>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Assinatura do cliente</CardTitle>
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
                <SignatureClient serviceOrderId={os.id} canEdit={canEdit} />
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Cliente</CardTitle>
            <CardBody>
              <p className="font-medium text-fg">{os.client.nomeFantasia}</p>
              <p className="text-sm text-fg-muted">{os.client.razaoSocial}</p>
              <p className="mt-2 text-sm text-fg-muted">
                {os.client.addressStreet ?? ""} {os.client.addressNumber ?? ""}
                <br />
                {os.client.addressCity} — {os.client.addressState}
              </p>
              <p className="mt-2 text-sm text-fg-muted">Tel: {os.client.phone}</p>
              <Link href={`/clientes/${os.client.id}`} className="mt-3 inline-block text-sm text-brand hover:underline">
                Ver ficha do cliente →
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Equipamento</CardTitle>
            <CardBody>
              {os.equipment ? (
                <div className="text-sm">
                  <p className="font-medium text-fg">{os.equipment.brand} {os.equipment.model}</p>
                  <p className="text-fg-muted">S/N: {os.equipment.serialNumber}</p>
                  <p className="text-fg-muted">Categoria: {os.equipment.category}</p>
                  {os.equipment.location && <p className="text-fg-muted">Local: {os.equipment.location}</p>}
                </div>
              ) : (
                <p className="text-sm text-fg-muted">Nenhum equipamento vinculado.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Atribuição</CardTitle>
            <CardBody>
              <AssignClient
                serviceOrderId={os.id}
                canEdit={canEdit}
                currentTechnicianId={os.technicianId}
                technicians={technicians}
              />
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Agenda</CardTitle>
            <CardBody>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Agendado</dt>
                  <dd className="text-fg">{os.scheduledAt ? new Date(os.scheduledAt).toLocaleString("pt-BR") : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Iniciado</dt>
                  <dd className="text-fg">{os.startedAt ? new Date(os.startedAt).toLocaleString("pt-BR") : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Concluído</dt>
                  <dd className="text-fg">{os.finishedAt ? new Date(os.finishedAt).toLocaleString("pt-BR") : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Valor</dt>
                  <dd className="text-fg">{os.totalValue ? `R$ ${Number(os.totalValue).toFixed(2)}` : "—"}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {os.laudos.length > 0 && (
            <Card>
              <CardTitle>Laudos vinculados</CardTitle>
              <CardBody>
                <ul className="space-y-2 text-sm">
                  {os.laudos.map((l) => (
                    <li key={l.id} className="flex items-center justify-between">
                      <Link href={`/laudos/${l.id}`} className="text-brand hover:underline">
                        {l.code} · {l.type}
                      </Link>
                      <span className="text-xs text-fg-muted">{l.status}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {canEdit && (
            <Card>
              <CardTitle>Ações rápidas</CardTitle>
              <CardBody>
                <div className="flex flex-col gap-2">
                  <Link href={`/ordens-servico/${os.id}/editar`}>
                    <Button variant="secondary" size="sm" className="w-full">Editar OS</Button>
                  </Link>
                  <Link href={`/laudos/novo?serviceOrderId=${os.id}`}>
                    <Button variant="ghost" size="sm" className="w-full">Emitir laudo</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}