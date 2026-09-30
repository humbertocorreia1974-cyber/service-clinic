import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PortalServiceOrderCard } from "./service-order-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portal do cliente · Service Clinic" };

export default async function PortalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/portal");

  const client = await prisma.client.findUnique({ where: { userId: session.user.id } });
  if (!client) redirect("/dashboard");

  const orders = await prisma.serviceOrder.findMany({
    where: { clientId: client.id, status: { not: "cancelada" } },
    include: {
      technician: { select: { name: true, phone: true } },
      review: { select: { rating: true, comment: true } },
      invoiceItems: { include: { invoice: { select: { status: true, total: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-fg">Olá, {client.nomeFantasia}</h1>
      <p className="mt-1 text-sm text-fg-muted">Acompanhe suas ordens de serviço.</p>

      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <Card>
            <p className="text-sm text-fg-muted">Nenhuma ordem de serviço ainda.</p>
          </Card>
        ) : (
          orders.map((os) => {
            const pendingInvoiceItem = os.invoiceItems.find((i) => i.invoice.status === "pendente");
            return (
              <PortalServiceOrderCard
                key={os.id}
                id={os.id}
                code={os.code}
                type={os.type}
                status={os.status}
                technicianName={os.technician?.name ?? null}
                scheduledAt={os.scheduledAt ? os.scheduledAt.toISOString() : null}
                totalValue={os.totalValue ? Number(os.totalValue) : null}
                clientApprovedAt={os.clientApprovedAt ? os.clientApprovedAt.toISOString() : null}
                review={os.review ? { rating: os.review.rating, comment: os.review.comment } : null}
                pendingInvoiceTotal={pendingInvoiceItem ? Number(pendingInvoiceItem.invoice.total) : null}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
