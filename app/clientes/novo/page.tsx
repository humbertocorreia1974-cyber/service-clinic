import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { NovoClienteForm } from "./novo-cliente-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo cliente · Service Clinic" };

const CIDADES = ["Volta Redonda", "Pinheiral", "Barra Mansa", "Resende", "Barra do Piraí"];

export default async function NovoClientePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/clientes/novo");
  if (!["admin", "gerente"].includes(session.user.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/clientes" className="text-sm text-fg-muted hover:text-brand transition-colors">
        ← Clientes
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-fg">Novo cliente</h1>
      <Card className="mt-6">
        <NovoClienteForm cidades={CIDADES} />
      </Card>
    </div>
  );
}
