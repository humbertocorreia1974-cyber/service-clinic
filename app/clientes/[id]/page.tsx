import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardBody } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const OS_STATUS_LABEL: Record<string, string> = {
  aberta: "Aberta",
  a_caminho: "A caminho",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const INVOICE_STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  paga: "Paga",
  atrasada: "Atrasada",
  cancelada: "Cancelada",
};

function formatBRL(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id }, select: { nomeFantasia: true } });
  return { title: client ? `${client.nomeFantasia} · Service Clinic` : "Cliente · Service Clinic" };
}

export default async function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?next=/clientes/${params.id}`);
  if (!["admin", "gerente"].includes(session.user.role ?? "")) redirect("/dashboard");

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      equipments: { orderBy: { createdAt: "desc" } },
      serviceOrders: { orderBy: { createdAt: "desc" }, take: 20 },
      invoices: { orderBy: { issueDate: "desc" }, take: 20 },
    },
  });
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/clientes" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Clientes
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-fg">{client.nomeFantasia}</h1>
          <p className="text-sm text-fg-muted">{client.razaoSocial}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            client.userId
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-border bg-bg text-fg-muted"
          }`}
        >
          {client.userId ? "Com acesso ao portal" : "Sem acesso"}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle>Ordens de serviço</CardTitle>
            <CardBody>
              {client.serviceOrders.length === 0 ? (
                <p className="text-sm text-fg-muted">Nenhuma OS registrada ainda.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {client.serviceOrders.map((os) => (
                    <li key={os.id} className="flex items-center justify-between py-2.5 text-sm">
                      <Link href={`/ordens-servico/${os.id}`} className="text-brand hover:underline">
                        {os.code} · {os.city}
                      </Link>
                      <span className="text-xs text-fg-muted">{OS_STATUS_LABEL[os.status] ?? os.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Faturas</CardTitle>
            <CardBody>
              {client.invoices.length === 0 ? (
                <p className="text-sm text-fg-muted">Nenhuma fatura emitida ainda.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {client.invoices.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="text-fg">{inv.number}</span>
                      <span className="text-fg-muted">{formatBRL(inv.total)}</span>
                      <span className="text-xs text-fg-muted">{INVOICE_STATUS_LABEL[inv.status] ?? inv.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Contato</CardTitle>
            <CardBody>
              <p className="text-sm text-fg-muted">Tel: {client.phone}</p>
              {client.whatsapp && <p className="text-sm text-fg-muted">WhatsApp: {client.whatsapp}</p>}
              <p className="text-sm text-fg-muted">{client.email}</p>
              <p className="mt-2 text-sm text-fg-muted">
                {client.addressStreet ?? ""} {client.addressNumber ?? ""}
                <br />
                {client.addressCity} — {client.addressState}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Equipamentos</CardTitle>
            <CardBody>
              {client.equipments.length === 0 ? (
                <p className="text-sm text-fg-muted">Nenhum equipamento cadastrado.</p>
              ) : (
                <ul className="space-y-3">
                  {client.equipments.map((eq) => (
                    <li key={eq.id} className="text-sm">
                      <p className="font-medium text-fg">{eq.brand} {eq.model}</p>
                      <p className="text-xs text-fg-muted">S/N: {eq.serialNumber} · {eq.category}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
