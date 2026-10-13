import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";
import { LaudoActionsClient } from "./laudo-actions-client";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  tecnico: "Laudo técnico",
  higienizacao_ac: "Higienização de AC",
  pmoc: "PMOC",
  biosseguranca: "Biossegurança",
};

export default async function LaudoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?next=/laudos/${params.id}`);

  const laudo = await prisma.laudo.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      equipment: true,
      serviceOrder: { select: { id: true, code: true } },
      createdBy: { select: { name: true } },
    },
  });
  if (!laudo) notFound();

  const role = session.user.role;
  const isClient = role === "cliente";
  if (isClient && laudo.client.userId !== session.user.id) redirect("/portal");

  const canEdit = role === "admin" || role === "gerente" || role === "tecnico";
  const content = (laudo.content as any) || {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          {laudo.serviceOrder && (
            <Link
              href={`/ordens-servico/${laudo.serviceOrder.id}`}
              className="text-sm text-fg-muted hover:text-brand transition-colors"
            >
              ← Voltar para OS {laudo.serviceOrder.code}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-fg">
            {TYPE_LABEL[laudo.type] ?? laudo.type} <span className="text-brand">{laudo.code}</span>
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{laudo.client.nomeFantasia}</p>
        </div>
        <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium capitalize text-fg-muted">
          {laudo.status}
        </span>
      </div>

      <Card className="mb-6">
        <CardTitle>{laudo.title}</CardTitle>
        <CardBody className="space-y-3 text-sm">
          {content.diagnosis && (
            <p>
              <strong className="text-fg">Diagnóstico:</strong> <span className="text-fg-muted">{content.diagnosis}</span>
            </p>
          )}
          {content.solution && (
            <p>
              <strong className="text-fg">Solução aplicada:</strong> <span className="text-fg-muted">{content.solution}</span>
            </p>
          )}
          {content.observations && (
            <p>
              <strong className="text-fg">Observações:</strong> <span className="text-fg-muted">{content.observations}</span>
            </p>
          )}
          {!content.diagnosis && !content.solution && !content.observations && (
            <p className="text-fg-muted">Sem conteúdo adicional registrado.</p>
          )}
        </CardBody>
      </Card>

      {content.photos?.length > 0 && (
        <Card className="mb-6">
          <CardTitle>Registro fotográfico — serviço concluído</CardTitle>
          <CardBody>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {content.photos.map((p: any, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={p.url}
                  alt={p.caption ?? ""}
                  className="h-32 w-full rounded-md border border-border object-cover"
                />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardTitle>Assinatura e envio ao cliente</CardTitle>
        <CardBody>
          <LaudoActionsClient
            laudoId={laudo.id}
            canEdit={canEdit}
            alreadySigned={!!laudo.signatureData}
            signedAt={laudo.signedAt ? laudo.signedAt.toISOString() : null}
            clientEmail={laudo.client.email}
            clientWhatsapp={laudo.client.whatsapp || laudo.client.phone}
          />
        </CardBody>
      </Card>
    </div>
  );
}
