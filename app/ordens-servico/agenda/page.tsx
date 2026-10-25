import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DispatchBoard } from "./dispatch-board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agenda de OS · Service Clinic" };

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDateParam(value: string | undefined): Date {
  if (value) {
    const [y, m, d] = value.split("-").map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
  }
  return startOfDay(new Date());
}

function toDateParam(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/ordens-servico/agenda");
  if (!["admin", "gerente"].includes(session.user.role ?? "")) redirect("/dashboard");

  const day = parseDateParam(searchParams.date);
  const dayEnd = new Date(day);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [technicians, orders] = await Promise.all([
    prisma.technician.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.serviceOrder.findMany({
      where: {
        scheduledAt: { gte: day, lt: dayEnd },
        status: { notIn: ["concluida", "cancelada"] },
      },
      select: {
        id: true,
        code: true,
        scheduledAt: true,
        status: true,
        type: true,
        city: true,
        technicianId: true,
        client: { select: { nomeFantasia: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  const prevDay = new Date(day);
  prevDay.setDate(prevDay.getDate() - 1);
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Painel
      </Link>
      <div className="mt-2 mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-fg">Agenda de dispatch</h1>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={`/ordens-servico/agenda?date=${toDateParam(prevDay)}`}
            className="rounded-md border border-border px-3 py-1.5 text-fg-muted hover:text-brand hover:border-brand/40 transition-colors"
          >
            ← Dia anterior
          </Link>
          <Link
            href={`/ordens-servico/agenda?date=${toDateParam(startOfDay(new Date()))}`}
            className="rounded-md border border-border px-3 py-1.5 text-fg-muted hover:text-brand hover:border-brand/40 transition-colors"
          >
            Hoje
          </Link>
          <Link
            href={`/ordens-servico/agenda?date=${toDateParam(nextDay)}`}
            className="rounded-md border border-border px-3 py-1.5 text-fg-muted hover:text-brand hover:border-brand/40 transition-colors"
          >
            Próximo dia →
          </Link>
        </div>
      </div>
      <p className="mb-6 text-sm text-fg-muted">
        {day.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} ·
        arraste uma OS entre técnicos/horários para redespachar.
      </p>

      <DispatchBoard day={toDateParam(day)} technicians={technicians} initialOrders={orders} />
    </div>
  );
}
