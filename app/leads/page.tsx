import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { LeadStatusClient } from "./lead-status-client";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  site_home: "Site",
  servico: "Página de serviço",
  catalogo_pecas: "Catálogo de peças",
  contato: "Contato",
  blog: "Blog",
  whatsapp: "WhatsApp",
  orcamento_foto: "Orçamento com foto",
};

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/leads");
  if (!["admin", "gerente"].includes(session.user.role ?? "")) redirect("/dashboard");

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-fg">Leads e pedidos de orçamento</h1>
      <p className="mt-1 text-sm text-fg-muted">{leads.length} registro(s).</p>

      <div className="mt-6 space-y-4">
        {leads.length === 0 ? (
          <Card>
            <CardBody className="py-10 text-center text-fg-muted">Nenhum lead registrado ainda.</CardBody>
          </Card>
        ) : (
          leads.map((lead) => (
            <Card key={lead.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    {lead.photoUrl && (
                      <a href={lead.photoUrl} target="_blank" rel="noreferrer" className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={lead.photoUrl}
                          alt="Foto enviada pelo cliente"
                          className="h-20 w-20 rounded-md border border-border object-cover"
                        />
                      </a>
                    )}
                    <div>
                      <p className="font-medium text-fg">{lead.name}</p>
                      <p className="text-sm text-fg-muted">
                        {lead.phone} · {lead.city}
                        {lead.email ? ` · ${lead.email}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-fg-muted">
                        {SOURCE_LABEL[lead.source] ?? lead.source} · {new Date(lead.createdAt).toLocaleString("pt-BR")}
                      </p>
                      {lead.preferredAt && (
                        <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
                          🗓 Cliente prefere: {new Date(lead.preferredAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      )}
                      {lead.message && <p className="mt-2 max-w-xl text-sm text-fg">{lead.message}</p>}
                    </div>
                  </div>
                  <LeadStatusClient leadId={lead.id} status={lead.status} />
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
