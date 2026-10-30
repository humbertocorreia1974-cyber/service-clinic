import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { NovoContratoForm } from "./novo-contrato-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo Contrato · Service Clinic" };

export default async function NovoContratoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/contratos/novo");
  if (!["admin", "gerente"].includes(session.user.role ?? "")) redirect("/dashboard");

  const [clients, equipments] = await Promise.all([
    prisma.client.findMany({ orderBy: { nomeFantasia: "asc" }, select: { id: true, nomeFantasia: true } }),
    prisma.equipment.findMany({
      where: { active: true },
      orderBy: { brand: "asc" },
      select: { id: true, clientId: true, category: true, brand: true, model: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/contratos" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Contratos
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-fg">Novo Contrato</h1>
      {clients.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-fg-muted">
            Cadastre um cliente antes de criar um contrato.{" "}
            <Link href="/clientes/novo" className="text-brand hover:underline">
              Criar cliente →
            </Link>
          </p>
        </Card>
      ) : (
        <Card className="mt-6">
          <NovoContratoForm clients={clients} equipments={equipments} />
        </Card>
      )}
    </div>
  );
}
