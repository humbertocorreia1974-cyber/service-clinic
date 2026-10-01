import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { NovaOSForm } from "./nova-os-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova Ordem de Serviço · Service Clinic" };

const CIDADES = ["Volta Redonda", "Pinheiral", "Barra Mansa", "Resende", "Barra do Piraí"];

export default async function NovaOSPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/ordens-servico/novo");
  if (!["admin", "gerente"].includes(session.user.role)) redirect("/dashboard");

  const [clients, technicians] = await Promise.all([
    prisma.client.findMany({ orderBy: { nomeFantasia: "asc" }, select: { id: true, nomeFantasia: true, addressCity: true } }),
    prisma.technician.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, cities: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/ordens-servico" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Ordens de Serviço
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-fg">Nova Ordem de Serviço</h1>
      {clients.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-fg-muted">
            Cadastre um cliente antes de abrir uma OS.{" "}
            <Link href="/clientes/novo" className="text-brand hover:underline">
              Criar cliente →
            </Link>
          </p>
        </Card>
      ) : (
        <Card className="mt-6">
          <NovaOSForm clients={clients} technicians={technicians} cidades={CIDADES} />
        </Card>
      )}
    </div>
  );
}
