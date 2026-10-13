import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LaudoFormClient } from "./laudo-form-client";

export const dynamic = "force-dynamic";

export default async function NovoLaudoPage({
  searchParams,
}: {
  searchParams: { serviceOrderId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!["admin", "gerente", "tecnico"].includes(session.user.role ?? "")) redirect("/dashboard");

  const serviceOrderId = searchParams.serviceOrderId;
  if (!serviceOrderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-fg">Emitir laudo técnico</h1>
        <p className="mt-3 text-fg-muted">
          Laudos são emitidos a partir de uma ordem de serviço. Abra a OS desejada e use o botão
          &ldquo;Emitir laudo&rdquo;.
        </p>
        <Link href="/ordens-servico" className="mt-6 inline-block text-brand hover:underline">
          Ver ordens de serviço →
        </Link>
      </div>
    );
  }

  const serviceOrder = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
    include: {
      client: { select: { id: true, nomeFantasia: true } },
      equipment: { select: { id: true, brand: true, model: true } },
      photos: { where: { kind: { in: ["depois", "laudo"] } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!serviceOrder) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href={`/ordens-servico/${serviceOrder.id}`} className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Voltar para OS {serviceOrder.code}
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-fg">Emitir laudo técnico</h1>
      <p className="mt-1 text-sm text-fg-muted">
        {serviceOrder.client.nomeFantasia}
        {serviceOrder.equipment ? ` · ${serviceOrder.equipment.brand} ${serviceOrder.equipment.model}` : ""}
      </p>
      <div className="mt-6">
        <LaudoFormClient
          serviceOrderId={serviceOrder.id}
          existingPhotos={serviceOrder.photos.map((p) => ({ url: p.url, kind: p.kind, caption: p.caption }))}
        />
      </div>
    </div>
  );
}
