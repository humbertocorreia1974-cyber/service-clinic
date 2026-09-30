import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { TecnicoServiceOrderRow } from "./service-order-row";

export const dynamic = "force-dynamic";
export const metadata = { title: "Minhas Ordens de Serviço · Service Clinic" };

function rangeFor(periodo: string, turno: string | null) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  if (periodo === "semana") {
    end.setDate(end.getDate() + 7);
  } else if (periodo === "mes") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setDate(end.getDate() + 1);
    if (turno === "manha") {
      end.setHours(12, 0, 0, 0);
    } else if (turno === "tarde") {
      start.setHours(12, 0, 0, 0);
    }
  }
  return { start, end };
}

export default async function TecnicoPage({
  searchParams,
}: {
  searchParams: { periodo?: string; turno?: string; regiao?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/tecnico");

  const technician = await prisma.technician.findUnique({ where: { userId: session.user.id } });
  if (!technician) redirect("/dashboard");

  const periodo = ["hoje", "semana", "mes"].includes(searchParams.periodo ?? "") ? searchParams.periodo! : "hoje";
  const turno = searchParams.turno === "manha" || searchParams.turno === "tarde" ? searchParams.turno : null;
  const regiao = searchParams.regiao || null;

  const { start, end } = rangeFor(periodo, turno);

  const orders = await prisma.serviceOrder.findMany({
    where: {
      assignedToId: session.user.id,
      status: { not: "cancelada" },
      ...(regiao ? { city: regiao } : {}),
      OR: [{ scheduledAt: { gte: start, lt: end } }, { scheduledAt: null }],
    },
    include: {
      client: { select: { nomeFantasia: true, addressStreet: true, addressNumber: true } },
      invoiceItems: { select: { id: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });

  function link(params: Record<string, string>) {
    const sp = new URLSearchParams({ periodo, ...(turno ? { turno } : {}), ...(regiao ? { regiao } : {}), ...params });
    return `/tecnico?${sp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-fg">Minhas Ordens de Serviço</h1>
      <p className="mt-1 text-sm text-fg-muted">{technician.name}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { key: "hoje", label: "Hoje" },
          { key: "semana", label: "Semana" },
          { key: "mes", label: "Mês" },
        ].map((p) => (
          <Link
            key={p.key}
            href={link({ periodo: p.key, ...(p.key !== "hoje" ? { turno: "" } : {}) })}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              periodo === p.key ? "border-brand bg-brand text-white" : "border-border bg-bg text-fg-muted"
            }`}
          >
            {p.label}
          </Link>
        ))}
        {periodo === "hoje" ? (
          <>
            <Link
              href={link({ turno: turno === "manha" ? "" : "manha" })}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                turno === "manha" ? "border-brand bg-brand text-white" : "border-border bg-bg text-fg-muted"
              }`}
            >
              Manhã
            </Link>
            <Link
              href={link({ turno: turno === "tarde" ? "" : "tarde" })}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                turno === "tarde" ? "border-brand bg-brand text-white" : "border-border bg-bg text-fg-muted"
              }`}
            >
              Tarde
            </Link>
          </>
        ) : null}
        {technician.cities.map((c) => (
          <Link
            key={c}
            href={link({ regiao: regiao === c ? "" : c })}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              regiao === c ? "border-accent bg-accent text-white" : "border-border bg-bg text-fg-muted"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <Card>
            <p className="text-sm text-fg-muted">Nenhuma OS neste filtro.</p>
          </Card>
        ) : (
          orders.map((os) => (
            <TecnicoServiceOrderRow
              key={os.id}
              id={os.id}
              code={os.code}
              type={os.type}
              status={os.status}
              clientName={os.client.nomeFantasia}
              address={`${os.client.addressStreet ?? ""} ${os.client.addressNumber ?? ""}`.trim()}
              city={os.city}
              scheduledAt={os.scheduledAt ? os.scheduledAt.toISOString() : null}
              totalValue={os.totalValue ? Number(os.totalValue) : null}
              materialsPlanned={os.materialsPlanned}
              materialsUsed={os.materialsUsed}
              hasCharge={os.invoiceItems.length > 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
